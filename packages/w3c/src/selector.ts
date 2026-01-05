/**
 * W3C Web Annotation Selector Types
 * @see https://www.w3.org/TR/annotation-model/#selectors
 */

/**
 * TextQuoteSelector - Identifies text by exact match with surrounding context
 * @see https://www.w3.org/TR/annotation-model/#text-quote-selector
 */
export interface TextQuoteSelector {
  type: 'TextQuoteSelector';
  /** The exact text content being selected */
  exact: string;
  /** Text content immediately before the selected text */
  prefix?: string;
  /** Text content immediately after the selected text */
  suffix?: string;
}

/**
 * TextPositionSelector - Identifies text by character offsets
 * @see https://www.w3.org/TR/annotation-model/#text-position-selector
 */
export interface TextPositionSelector {
  type: 'TextPositionSelector';
  /** Starting character offset (0-based) */
  start: number;
  /** Ending character offset (exclusive) */
  end: number;
}

/**
 * FragmentSelector - Uses URI fragment syntax (e.g., media fragments)
 * @see https://www.w3.org/TR/annotation-model/#fragment-selector
 */
export interface FragmentSelector {
  type: 'FragmentSelector';
  /** URI of the fragment specification (e.g., Media Fragments URI) */
  conformsTo: string;
  /** The fragment identifier value (e.g., "t=30,45") */
  value: string;
}

/**
 * CssSelector - Uses CSS selectors to identify elements
 * @see https://www.w3.org/TR/annotation-model/#css-selector
 */
export interface CssSelector {
  type: 'CssSelector';
  /** A valid CSS selector string */
  value: string;
}

/**
 * XPathSelector - Uses XPath expressions to identify elements
 * @see https://www.w3.org/TR/annotation-model/#xpath-selector
 */
export interface XPathSelector {
  type: 'XPathSelector';
  /** A valid XPath expression */
  value: string;
}

/**
 * RangeSelector - Defines a range between two points
 * @see https://www.w3.org/TR/annotation-model/#range-selector
 */
export interface RangeSelector {
  type: 'RangeSelector';
  /** Selector identifying the start of the range */
  startSelector: Selector;
  /** Selector identifying the end of the range */
  endSelector: Selector;
}

/**
 * Union type of all W3C selector types
 */
export type Selector =
  | TextQuoteSelector
  | TextPositionSelector
  | FragmentSelector
  | CssSelector
  | XPathSelector
  | RangeSelector;

/**
 * Discriminator type for selector kinds
 */
export type SelectorType = Selector['type'];

/**
 * Media Fragments URI specification
 * @see https://www.w3.org/TR/media-frags/
 */
export const MEDIA_FRAGMENTS_URI = 'http://www.w3.org/TR/media-frags/';
