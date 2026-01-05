/**
 * Text Anchoring Utilities
 *
 * Provides functions for anchoring text annotations using W3C selectors.
 * Uses dom-anchor-text-quote and dom-anchor-text-position for the heavy lifting.
 *
 * @see https://www.w3.org/TR/annotation-model/#selectors
 */

import { fromRange as textQuoteFromRange, toRange as textQuoteToRange } from 'dom-anchor-text-quote';
import { fromRange as textPositionFromRange, toRange as textPositionToRange } from 'dom-anchor-text-position';
import type { TextQuoteSelector, TextPositionSelector } from '@cluster/w3c';

/**
 * Context length for prefix/suffix in TextQuoteSelector
 * Hypothesis uses 32, we use 50 for more resilience
 */
const CONTEXT_LENGTH = 50;

/**
 * Result of creating selectors from a DOM Range
 */
export interface TextAnchors {
  /** TextQuoteSelector with exact match and context */
  quote: TextQuoteSelector;
  /** TextPositionSelector with character offsets */
  position: TextPositionSelector;
  /** The selected text */
  text: string;
}

/**
 * Create W3C selectors from a DOM Range
 *
 * Generates both TextQuoteSelector (resilient) and TextPositionSelector (fast)
 * for maximum anchoring success when re-locating the annotation.
 *
 * @param root - Root element to anchor within (e.g., transcript container)
 * @param range - DOM Range representing the selection
 * @returns Object with quote and position selectors
 */
export function createSelectorsFromRange(root: Element, range: Range): TextAnchors {
  const text = range.toString();

  // Create TextQuoteSelector with context
  const quoteAnchor = textQuoteFromRange(root, range);
  const quote: TextQuoteSelector = {
    type: 'TextQuoteSelector',
    exact: quoteAnchor.exact,
    prefix: quoteAnchor.prefix?.slice(-CONTEXT_LENGTH),
    suffix: quoteAnchor.suffix?.slice(0, CONTEXT_LENGTH),
  };

  // Create TextPositionSelector
  const positionAnchor = textPositionFromRange(root, range);
  const position: TextPositionSelector = {
    type: 'TextPositionSelector',
    start: positionAnchor.start,
    end: positionAnchor.end,
  };

  return { quote, position, text };
}

/**
 * Options for anchoring selectors back to DOM
 */
export interface AnchorOptions {
  /** Try TextQuoteSelector first (default: true) */
  preferQuote?: boolean;
  /** Maximum characters to search for fuzzy matching */
  maxSearchDistance?: number;
}

/**
 * Anchor result with additional metadata
 */
export interface AnchorResult {
  /** The anchored DOM Range, or null if anchoring failed */
  range: Range | null;
  /** Whether the anchoring was exact or fuzzy */
  exact: boolean;
  /** Which selector succeeded */
  usedSelector: 'quote' | 'position' | 'none';
  /** Error message if anchoring failed */
  error?: string;
}

/**
 * Anchor selectors back to a DOM Range
 *
 * Tries multiple selector strategies in order of resilience:
 * 1. TextQuoteSelector (most resilient to document changes)
 * 2. TextPositionSelector (fallback if quote fails)
 *
 * @param root - Root element to search within
 * @param quote - TextQuoteSelector to anchor
 * @param position - TextPositionSelector as fallback
 * @param options - Anchoring options
 * @returns AnchorResult with range and metadata
 */
export function anchorSelectors(
  root: Element,
  quote: TextQuoteSelector | null,
  position: TextPositionSelector | null,
  options: AnchorOptions = {}
): AnchorResult {
  const { preferQuote = true } = options;

  // Try quote selector first (if available and preferred)
  if (preferQuote && quote) {
    try {
      const range = textQuoteToRange(root, {
        exact: quote.exact,
        prefix: quote.prefix,
        suffix: quote.suffix,
      });
      if (range) {
        // Verify exact match
        const exact = range.toString() === quote.exact;
        return { range, exact, usedSelector: 'quote' };
      }
    } catch {
      // Quote selector failed, try position
    }
  }

  // Try position selector
  if (position) {
    try {
      const range = textPositionToRange(root, {
        start: position.start,
        end: position.end,
      });
      if (range) {
        // Position anchoring is always considered "exact" for position offsets
        // but may not match original text if document changed
        const exact = quote ? range.toString() === quote.exact : true;
        return { range, exact, usedSelector: 'position' };
      }
    } catch {
      // Position selector also failed
    }
  }

  // Try quote selector last if we hadn't tried it first
  if (!preferQuote && quote) {
    try {
      const range = textQuoteToRange(root, {
        exact: quote.exact,
        prefix: quote.prefix,
        suffix: quote.suffix,
      });
      if (range) {
        const exact = range.toString() === quote.exact;
        return { range, exact, usedSelector: 'quote' };
      }
    } catch {
      // All selectors failed
    }
  }

  return {
    range: null,
    exact: false,
    usedSelector: 'none',
    error: 'Could not anchor annotation to document',
  };
}

/**
 * Highlight a range in the DOM
 *
 * Creates a <mark> element wrapping the selected range.
 * Returns a function to remove the highlight.
 *
 * @param range - DOM Range to highlight
 * @param className - CSS class for the mark element
 * @param annotationId - ID to store on the element for click handling
 * @returns Cleanup function to remove the highlight
 */
export function highlightRange(
  range: Range,
  className: string = 'annotation-highlight',
  annotationId?: string
): () => void {
  const mark = document.createElement('mark');
  mark.className = className;
  if (annotationId) {
    mark.dataset.annotationId = annotationId;
  }

  try {
    range.surroundContents(mark);
    return () => {
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
        parent.normalize();
      }
    };
  } catch {
    // surroundContents can fail if range spans multiple elements
    // Fall back to wrapping each text node individually
    const fragment = range.extractContents();
    mark.appendChild(fragment);
    range.insertNode(mark);

    return () => {
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
        parent.normalize();
      }
    };
  }
}

/**
 * Get the text content of a root element for position calculations
 */
export function getRootText(root: Element): string {
  return root.textContent || '';
}

/**
 * Validate that selectors can successfully anchor
 */
export function validateSelectors(
  root: Element,
  quote: TextQuoteSelector,
  position: TextPositionSelector
): boolean {
  const result = anchorSelectors(root, quote, position);
  return result.range !== null && result.exact;
}
