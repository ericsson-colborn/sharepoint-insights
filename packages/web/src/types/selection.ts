/**
 * Selection types for text and media highlights
 */

/**
 * Text position selector value
 */
export interface TextPositionSelectorValue {
  start: number;
  end: number;
}

/**
 * Text quote selector value (W3C standard)
 */
export interface TextQuoteSelectorValue {
  type?: 'TextQuoteSelector';
  exact: string;
  prefix?: string;
  suffix?: string;
}

/**
 * Fragment selector value (for media time ranges)
 */
export interface FragmentSelectorValue {
  type: 'FragmentSelector';
  value: string;
  conformsTo: string;
}

/**
 * Combined text selector value (stored format for text highlights)
 * Contains both quote and position selectors together
 */
export interface CombinedTextSelectorValue {
  textQuote: TextQuoteSelectorValue;
  textPosition: TextPositionSelectorValue;
}

/**
 * Combined selector value type - all possible formats stored in DB
 */
export type SelectorValue = CombinedTextSelectorValue | FragmentSelectorValue | TextPositionSelectorValue;

/**
 * Text selection info from transcript highlighting
 */
export interface TextSelectionInfo {
  text: string;
  textQuoteSelector: TextQuoteSelectorValue;
  textPositionSelector: TextPositionSelectorValue;
  selectedCueIndices: number[];
  startTime?: number;
  endTime?: number;
}

/**
 * Media selection info from video/audio range selection
 */
export interface MediaSelectionInfo {
  startTime: number;
  endTime: number;
  fragmentSelector: FragmentSelectorValue;
}

/**
 * Union type for any selection
 */
export type SelectionInfo = TextSelectionInfo | MediaSelectionInfo;

/**
 * Type guard for text selection
 */
export function isTextSelection(selection: SelectionInfo | null): selection is TextSelectionInfo {
  return selection !== null && 'textQuoteSelector' in selection;
}

/**
 * Type guard for media selection
 */
export function isMediaSelection(selection: SelectionInfo | null): selection is MediaSelectionInfo {
  return selection !== null && 'fragmentSelector' in selection;
}

/**
 * Type guard for combined text selector value
 */
export function isCombinedTextSelector(value: SelectorValue | null | undefined): value is CombinedTextSelectorValue {
  return value !== null && value !== undefined && 'textPosition' in value && 'textQuote' in value;
}
