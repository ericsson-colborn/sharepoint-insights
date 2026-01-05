/**
 * Annotation Serialization Utilities
 *
 * Functions for converting between internal annotation representations
 * and W3C Web Annotation JSON-LD format.
 */

import type {
  Annotation,
  TextualBody,
  SpecificResource,
  Selector,
  AnnotationMotivation,
  Agent,
} from '@cluster/w3c';
import { ANNOTATION_CONTEXT } from '@cluster/w3c';

/**
 * W3C Annotation Context URL
 */
const W3C_ANNOTATION_CONTEXT = ANNOTATION_CONTEXT;

/**
 * Research extension context URL
 */
const RESEARCH_ANNOTATION_CONTEXT = 'https://research-annotations.io/ns/research.jsonld';

/**
 * Generate a unique annotation ID in URN format
 */
function generateAnnotationId(): string {
  return `urn:uuid:${crypto.randomUUID()}`;
}

/**
 * Alias for backward compatibility
 */
type WebAnnotation = Annotation;

/**
 * Options for creating a W3C annotation
 */
export interface CreateAnnotationOptions {
  /** Annotation ID (generated if not provided) */
  id?: string;
  /** Motivation(s) for the annotation */
  motivation?: AnnotationMotivation | AnnotationMotivation[];
  /** Text body content */
  bodyText?: string;
  /** Body format (default: text/plain) */
  bodyFormat?: string;
  /** Target resource IRI */
  targetSource: string;
  /** Selector(s) for the target */
  selectors?: Selector | Selector[];
  /** Creator information */
  creator?: Agent;
  /** Include research context */
  includeResearchContext?: boolean;
  /** Additional properties */
  additionalProperties?: Record<string, unknown>;
}

/**
 * Create a W3C Web Annotation from options
 */
export function createWebAnnotation(options: CreateAnnotationOptions): WebAnnotation {
  const {
    id = generateAnnotationId(),
    motivation = 'highlighting',
    bodyText,
    bodyFormat = 'text/plain',
    targetSource,
    selectors,
    creator,
    includeResearchContext = false,
    additionalProperties = {},
  } = options;

  // Build context
  const context: string[] = [W3C_ANNOTATION_CONTEXT];
  if (includeResearchContext) {
    context.push(RESEARCH_ANNOTATION_CONTEXT);
  }

  // Build body
  let body: TextualBody | undefined;
  if (bodyText) {
    body = {
      type: 'TextualBody',
      value: bodyText,
      format: bodyFormat,
    };
  }

  // Build target
  let target: string | SpecificResource;
  if (selectors) {
    target = {
      type: 'SpecificResource',
      source: targetSource,
      selector: selectors,
    };
  } else {
    target = targetSource;
  }

  const annotation: WebAnnotation = {
    '@context': context.length === 1 ? context[0]! : context,
    id,
    type: 'Annotation',
    motivation,
    target,
    created: new Date().toISOString(),
    ...additionalProperties,
  };

  if (body) {
    annotation.body = body;
  }

  if (creator) {
    annotation.creator = creator;
  }

  return annotation;
}

/**
 * Internal annotation representation (as stored in database)
 */
export interface StoredAnnotation {
  id: string;
  motivation: string[];
  bodyText: string | null;
  targets: StoredAnnotationTarget[];
  creatorId: string;
  createdAt: string;
  modifiedAt: string;
  studyId?: string | null;
  participantId?: string | null;
  sessionId?: string | null;
  tagIds: string[];
}

/**
 * Internal target representation
 */
export interface StoredAnnotationTarget {
  id: string;
  fileRefId: string;
  selectorType: string;
  selectorValue: unknown;
  exactText: string | null;
  startTime: string | null;
  endTime: string | null;
}

/**
 * Convert stored annotation to W3C JSON-LD format
 */
export function toJsonLd(
  annotation: StoredAnnotation,
  options: {
    baseUrl?: string;
    includeResearchContext?: boolean;
  } = {}
): WebAnnotation {
  const { baseUrl = '', includeResearchContext = true } = options;

  const context: string[] = [W3C_ANNOTATION_CONTEXT];
  if (includeResearchContext) {
    context.push(RESEARCH_ANNOTATION_CONTEXT);
  }

  // Build targets
  const targets: SpecificResource[] = annotation.targets.map((t) => ({
    type: 'SpecificResource',
    source: `${baseUrl}/files/${t.fileRefId}`,
    selector: buildSelector(t),
  }));

  const jsonld: WebAnnotation = {
    '@context': context,
    id: `urn:uuid:${annotation.id}`,
    type: 'Annotation',
    motivation: annotation.motivation as AnnotationMotivation[],
    target: targets.length === 1 ? targets[0]! : targets,
    created: annotation.createdAt,
    modified: annotation.modifiedAt,
  };

  // Add body if present
  if (annotation.bodyText) {
    jsonld.body = {
      type: 'TextualBody',
      value: annotation.bodyText,
      format: 'text/plain',
    };
  }

  // Add research properties
  if (annotation.studyId) {
    jsonld['research:study'] = `${baseUrl}/studies/${annotation.studyId}`;
  }
  if (annotation.participantId) {
    jsonld['research:participant'] = annotation.participantId;
  }
  if (annotation.sessionId) {
    jsonld['research:session'] = annotation.sessionId;
  }

  return jsonld;
}

/**
 * Build a selector from stored target data
 */
function buildSelector(target: StoredAnnotationTarget): Selector | Selector[] {
  const value = target.selectorValue as Record<string, unknown>;

  switch (target.selectorType) {
    case 'TextQuoteSelector':
      if ('textQuote' in value && 'textPosition' in value) {
        // Combined format
        return [
          {
            type: 'TextQuoteSelector',
            ...(value.textQuote as Record<string, unknown>),
          } as Selector,
          {
            type: 'TextPositionSelector',
            ...(value.textPosition as Record<string, unknown>),
          } as Selector,
        ];
      }
      return {
        type: 'TextQuoteSelector',
        ...value,
      } as Selector;

    case 'FragmentSelector':
      return {
        type: 'FragmentSelector',
        value: value.value as string,
        conformsTo: value.conformsTo as string,
      };

    case 'TextPositionSelector':
      return {
        type: 'TextPositionSelector',
        start: value.start as number,
        end: value.end as number,
      };

    default:
      return {
        type: target.selectorType,
        ...value,
      } as Selector;
  }
}

/**
 * Extract body text from a W3C annotation
 */
export function extractBodyText(annotation: WebAnnotation): string | null {
  if (!annotation.body) return null;

  const body = Array.isArray(annotation.body) ? annotation.body[0] : annotation.body;

  if (typeof body === 'string') return null;
  if (body && 'value' in body && typeof body.value === 'string') {
    return body.value;
  }

  return null;
}

/**
 * Extract all selectors from a W3C annotation target
 */
export function extractSelectors(annotation: WebAnnotation): Selector[] {
  const targets = Array.isArray(annotation.target) ? annotation.target : [annotation.target];
  const selectors: Selector[] = [];

  for (const target of targets) {
    if (typeof target === 'object' && 'selector' in target) {
      const selectorValue = target.selector;
      if (Array.isArray(selectorValue)) {
        selectors.push(...selectorValue);
      } else if (selectorValue) {
        selectors.push(selectorValue);
      }
    }
  }

  return selectors;
}

/**
 * Validate that an object is a valid W3C annotation
 */
export function isValidAnnotation(obj: unknown): obj is WebAnnotation {
  if (typeof obj !== 'object' || obj === null) return false;

  const annotation = obj as Record<string, unknown>;

  // Required fields
  if (!annotation['@context']) return false;
  if (!annotation.id || typeof annotation.id !== 'string') return false;
  if (!annotation.type) return false;
  if (!annotation.target) return false;

  // Type must include 'Annotation'
  const type = annotation.type;
  if (typeof type === 'string' && type !== 'Annotation') return false;
  if (Array.isArray(type) && !type.includes('Annotation')) return false;

  return true;
}

/**
 * Export annotations as JSON-LD collection
 */
export function exportAsCollection(
  annotations: WebAnnotation[],
  collectionId: string,
  label?: string
): Record<string, unknown> {
  return {
    '@context': W3C_ANNOTATION_CONTEXT,
    id: collectionId,
    type: 'AnnotationCollection',
    label: label || 'Annotation Collection',
    total: annotations.length,
    first: {
      type: 'AnnotationPage',
      items: annotations,
    },
  };
}
