/**
 * Selector Utilities
 *
 * Helper functions for creating, manipulating, and extracting data from
 * W3C Web Annotation selectors.
 */

import type {
  Selector,
  TextQuoteSelector,
  TextPositionSelector,
  FragmentSelector,
} from '@cluster/w3c';

/**
 * Media Fragments URI specification
 */
export const MEDIA_FRAGMENTS_SPEC = 'http://www.w3.org/TR/media-frags/';

/**
 * Combined text selectors (our storage format)
 */
export interface CombinedTextSelectors {
  textQuote: TextQuoteSelector;
  textPosition: TextPositionSelector;
}

/**
 * Create a TextQuoteSelector from selection text and context
 *
 * @param exact - The exact selected text
 * @param prefix - Text before the selection (for context)
 * @param suffix - Text after the selection (for context)
 * @param contextLength - Max length for prefix/suffix (default: 50)
 */
export function createTextQuoteSelector(
  exact: string,
  prefix?: string,
  suffix?: string,
  contextLength: number = 50
): TextQuoteSelector {
  return {
    type: 'TextQuoteSelector',
    exact,
    prefix: prefix?.slice(-contextLength),
    suffix: suffix?.slice(0, contextLength),
  };
}

/**
 * Create a TextPositionSelector from character offsets
 */
export function createTextPositionSelector(start: number, end: number): TextPositionSelector {
  return {
    type: 'TextPositionSelector',
    start,
    end,
  };
}

/**
 * Create a FragmentSelector for media time ranges
 *
 * @param startTime - Start time in seconds
 * @param endTime - End time in seconds
 */
export function createMediaFragmentSelector(startTime: number, endTime: number): FragmentSelector {
  return {
    type: 'FragmentSelector',
    value: `t=${startTime.toFixed(3)},${endTime.toFixed(3)}`,
    conformsTo: MEDIA_FRAGMENTS_SPEC,
  };
}

/**
 * Parse time range from a media FragmentSelector
 *
 * @param selector - FragmentSelector with time range
 * @returns Object with startTime and endTime, or null if invalid
 */
export function parseMediaFragment(
  selector: FragmentSelector
): { startTime: number; endTime: number } | null {
  const match = selector.value.match(/^t=([0-9.]+),([0-9.]+)$/);
  if (!match) return null;

  const startTime = parseFloat(match[1]!);
  const endTime = parseFloat(match[2]!);

  if (isNaN(startTime) || isNaN(endTime)) return null;

  return { startTime, endTime };
}

/**
 * Check if a selector is a TextQuoteSelector
 */
export function isTextQuoteSelector(selector: Selector): selector is TextQuoteSelector {
  return selector.type === 'TextQuoteSelector';
}

/**
 * Check if a selector is a TextPositionSelector
 */
export function isTextPositionSelector(selector: Selector): selector is TextPositionSelector {
  return selector.type === 'TextPositionSelector';
}

/**
 * Check if a selector is a FragmentSelector
 */
export function isFragmentSelector(selector: Selector): selector is FragmentSelector {
  return selector.type === 'FragmentSelector';
}

/**
 * Check if a FragmentSelector is for media (time-based)
 */
export function isMediaFragmentSelector(selector: FragmentSelector): boolean {
  return (
    selector.conformsTo === MEDIA_FRAGMENTS_SPEC &&
    selector.value.startsWith('t=')
  );
}

/**
 * Check if value is our combined text selector format
 */
export function isCombinedTextSelectors(value: unknown): value is CombinedTextSelectors {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    'textQuote' in obj &&
    'textPosition' in obj &&
    typeof obj.textQuote === 'object' &&
    typeof obj.textPosition === 'object'
  );
}

/**
 * Extract TextQuoteSelector from combined or single selector
 */
export function extractTextQuoteSelector(
  value: Selector | CombinedTextSelectors | null | undefined
): TextQuoteSelector | null {
  if (!value) return null;

  if (isCombinedTextSelectors(value)) {
    return value.textQuote;
  }

  if (isTextQuoteSelector(value as Selector)) {
    return value as TextQuoteSelector;
  }

  return null;
}

/**
 * Extract TextPositionSelector from combined or single selector
 */
export function extractTextPositionSelector(
  value: Selector | CombinedTextSelectors | null | undefined
): TextPositionSelector | null {
  if (!value) return null;

  if (isCombinedTextSelectors(value)) {
    return value.textPosition;
  }

  if (isTextPositionSelector(value as Selector)) {
    return value as TextPositionSelector;
  }

  return null;
}

/**
 * Calculate the duration of a media fragment in seconds
 */
export function getFragmentDuration(selector: FragmentSelector): number | null {
  const parsed = parseMediaFragment(selector);
  if (!parsed) return null;
  return parsed.endTime - parsed.startTime;
}

/**
 * Format a media fragment time range for display
 */
export function formatFragmentTimeRange(selector: FragmentSelector): string | null {
  const parsed = parseMediaFragment(selector);
  if (!parsed) return null;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return `${formatTime(parsed.startTime)} - ${formatTime(parsed.endTime)}`;
}

/**
 * Expand a media fragment by a given number of seconds on each side
 */
export function expandMediaFragment(
  selector: FragmentSelector,
  expandSeconds: number,
  maxDuration?: number
): FragmentSelector {
  const parsed = parseMediaFragment(selector);
  if (!parsed) return selector;

  const newStart = Math.max(0, parsed.startTime - expandSeconds);
  const newEnd = maxDuration
    ? Math.min(maxDuration, parsed.endTime + expandSeconds)
    : parsed.endTime + expandSeconds;

  return createMediaFragmentSelector(newStart, newEnd);
}
