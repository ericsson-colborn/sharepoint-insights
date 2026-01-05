/**
 * Type declarations for dom-anchor-text-quote
 * @see https://github.com/tilgovi/dom-anchor-text-quote
 */
declare module 'dom-anchor-text-quote' {
  export interface TextQuoteAnchor {
    exact: string;
    prefix?: string;
    suffix?: string;
  }

  export interface TextQuoteOptions {
    hint?: number;
  }

  /**
   * Convert a DOM Range to a TextQuoteAnchor
   */
  export function fromRange(root: Element, range: Range): TextQuoteAnchor;

  /**
   * Convert a TextQuoteAnchor back to a DOM Range
   */
  export function toRange(
    root: Element,
    selector: TextQuoteAnchor,
    options?: TextQuoteOptions
  ): Range | null;
}

/**
 * Type declarations for dom-anchor-text-position
 * @see https://github.com/tilgovi/dom-anchor-text-position
 */
declare module 'dom-anchor-text-position' {
  export interface TextPositionAnchor {
    start: number;
    end: number;
  }

  /**
   * Convert a DOM Range to a TextPositionAnchor
   */
  export function fromRange(root: Element, range: Range): TextPositionAnchor;

  /**
   * Convert a TextPositionAnchor back to a DOM Range
   */
  export function toRange(root: Element, selector: TextPositionAnchor): Range | null;
}
