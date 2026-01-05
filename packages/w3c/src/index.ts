/**
 * @cluster/w3c
 *
 * Pure W3C Web Annotation Data Model types
 * @see https://www.w3.org/TR/annotation-model/
 */

// Selector types
export type {
  Selector,
  SelectorType,
  TextQuoteSelector,
  TextPositionSelector,
  FragmentSelector,
  CssSelector,
  XPathSelector,
  RangeSelector,
} from './selector';

export { MEDIA_FRAGMENTS_URI } from './selector';

// Annotation types
export type {
  Annotation,
  AnnotationMotivation,
  AnnotationBody,
  AnnotationTarget,
  AnnotationCollection,
  AnnotationPage,
  Agent,
  TextualBody,
  SpecificResource,
} from './annotation';

export { ANNOTATION_CONTEXT } from './annotation';
