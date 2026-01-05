/**
 * W3C Web Annotation Data Model Types
 * @see https://www.w3.org/TR/annotation-model/
 */

import type { Selector } from './selector';

/**
 * W3C Standard Annotation Motivations
 * @see https://www.w3.org/TR/annotation-vocab/#named-individuals
 */
export type AnnotationMotivation =
  | 'assessing'
  | 'bookmarking'
  | 'classifying'
  | 'commenting'
  | 'describing'
  | 'editing'
  | 'highlighting'
  | 'identifying'
  | 'linking'
  | 'moderating'
  | 'questioning'
  | 'replying'
  | 'tagging';

/**
 * W3C Annotation Context URL
 */
export const ANNOTATION_CONTEXT = 'http://www.w3.org/ns/anno.jsonld';

/**
 * Agent - creator or generator of an annotation
 * @see https://www.w3.org/TR/annotation-model/#agents
 */
export interface Agent {
  id?: string;
  type: 'Person' | 'Organization' | 'Software';
  name?: string;
  nickname?: string;
  email?: string;
  homepage?: string;
}

/**
 * TextualBody - Text content as the annotation body
 * @see https://www.w3.org/TR/annotation-model/#embedded-textual-body
 */
export interface TextualBody {
  type: 'TextualBody';
  value: string;
  format?: string;
  language?: string;
  purpose?: AnnotationMotivation;
}

/**
 * SpecificResource - Reference to external resource with optional selector
 * @see https://www.w3.org/TR/annotation-model/#specific-resources
 */
export interface SpecificResource {
  type: 'SpecificResource';
  source: string;
  purpose?: AnnotationMotivation;
  selector?: Selector | Selector[];
}

/**
 * Union of all valid annotation body types
 */
export type AnnotationBody = TextualBody | SpecificResource | string;

/**
 * AnnotationTarget - The resource being annotated
 * @see https://www.w3.org/TR/annotation-model/#bodies-and-targets
 */
export interface AnnotationTarget {
  source: string;
  selector?: Selector | Selector[];
}

/**
 * Core Annotation type following W3C Web Annotation Data Model
 * @see https://www.w3.org/TR/annotation-model/#annotations
 */
export interface Annotation {
  '@context': typeof ANNOTATION_CONTEXT | string | string[];
  id: string;
  type: 'Annotation' | ['Annotation', ...string[]];
  motivation?: AnnotationMotivation | AnnotationMotivation[];
  creator?: Agent;
  created?: string;
  modified?: string;
  generated?: string;
  generator?: Agent;
  body?: AnnotationBody | AnnotationBody[];
  target: AnnotationTarget | AnnotationTarget[] | string;
  /** Allow custom extension properties */
  [key: string]: unknown;
}

/**
 * AnnotationCollection - A collection of annotations
 * @see https://www.w3.org/TR/annotation-model/#annotation-collection
 */
export interface AnnotationCollection {
  '@context': typeof ANNOTATION_CONTEXT | string | string[];
  id: string;
  type: 'AnnotationCollection';
  label?: string;
  total?: number;
  first?: AnnotationPage | string;
  last?: AnnotationPage | string;
}

/**
 * AnnotationPage - A page within an annotation collection
 * @see https://www.w3.org/TR/annotation-model/#annotation-page
 */
export interface AnnotationPage {
  '@context': typeof ANNOTATION_CONTEXT | string | string[];
  id: string;
  type: 'AnnotationPage';
  partOf?: string;
  next?: string;
  prev?: string;
  startIndex?: number;
  items: Annotation[];
}
