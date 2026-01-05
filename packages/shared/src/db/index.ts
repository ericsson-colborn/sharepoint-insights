/**
 * @cluster/db
 *
 * Database and API types for stored annotations
 */

import type { Annotation, AnnotationMotivation, Selector, SelectorType } from '@cluster/w3c';

// ============================================================================
// Enums
// ============================================================================

/**
 * Storage provider for file references
 */
export type StorageProvider = 'sharepoint' | 'googledrive' | 'onedrive' | 'local';

// ============================================================================
// File References
// ============================================================================

/**
 * File reference as stored in database
 */
export interface StoredFileRef {
  id: string;
  orgId: string;
  studyId: string | null;
  provider: StorageProvider;
  sharepointDriveId: string;
  sharepointItemId: string;
  sharepointSiteId: string | null;
  name: string;
  mimeType: string | null;
  sizeBytes: number | null;
  webUrl: string | null;
  contentHash: string | null;
  lastSyncedAt: string | null;
  transcriptFileId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Minimal file reference for embedding in responses
 */
export interface FileRefSummary {
  id: string;
  name: string;
  mimeType: string | null;
  webUrl: string | null;
  provider: StorageProvider;
  sharepointDriveId?: string;
  sharepointItemId?: string;
  sharepointSiteId?: string;
}

// ============================================================================
// Annotation Targets
// ============================================================================

/**
 * Combined text selector value (our storage format for text annotations)
 */
export interface CombinedTextSelector {
  textQuote: {
    type?: 'TextQuoteSelector';
    exact: string;
    prefix?: string;
    suffix?: string;
  };
  textPosition: {
    type?: 'TextPositionSelector';
    start: number;
    end: number;
  };
}

/**
 * Annotation target as stored in database
 */
export interface StoredAnnotationTarget {
  id: string;
  annotationId: string;
  fileRefId: string;
  selectorType: SelectorType;
  selectorValue: Selector | CombinedTextSelector;
  exactText: string | null;
  startTime: number | null;
  endTime: number | null;
  createdAt: string;
  /** Joined file reference data */
  fileRef?: FileRefSummary;
}

// ============================================================================
// Annotations
// ============================================================================

/**
 * Annotation as stored in database and returned by API
 */
export interface StoredAnnotation {
  id: string;
  orgId: string;
  studyId: string | null;
  motivation: AnnotationMotivation[];
  creatorId: string | null;
  createdAt: string;
  modifiedAt: string;
  participantId: string | null;
  sessionId: string | null;
  /** Full W3C JSON-LD representation */
  jsonld: Annotation;
  /** Denormalized body text for display */
  bodyText: string | null;
  deletedAt: string | null;
  /** Annotation targets (joined) */
  targets: StoredAnnotationTarget[];
  /** Associated tag IDs (joined) */
  tagIds: string[];
}

// ============================================================================
// Input Types (for API requests)
// ============================================================================

/**
 * Input for creating an annotation target
 */
export interface CreateAnnotationTargetInput {
  /** Drive/container ID (provider-agnostic) */
  driveId: string;
  /** Item ID within the drive */
  itemId: string;
  /** Storage provider */
  provider?: StorageProvider;
  /** Selector type */
  selectorType: SelectorType;
  /** Selector value */
  selectorValue: Selector | CombinedTextSelector;
  /** Exact selected text */
  exactText?: string;
  /** Start time for media (in seconds) */
  startTime?: number;
  /** End time for media (in seconds) */
  endTime?: number;
  /** File metadata for upsert */
  fileMetadata?: {
    name: string;
    mimeType?: string;
    size?: number;
    webUrl?: string;
    siteId?: string;
  };
}

/**
 * Input for creating an annotation
 */
export interface CreateAnnotationInput {
  motivation: AnnotationMotivation[];
  bodyText?: string;
  targets: CreateAnnotationTargetInput[];
  tagIds?: string[];
  studyId?: string;
  participantId?: string;
  sessionId?: string;
}

/**
 * Input for updating an annotation
 */
export interface UpdateAnnotationInput {
  motivation?: AnnotationMotivation[];
  bodyText?: string;
  tagIds?: string[];
  studyId?: string;
  participantId?: string;
  sessionId?: string;
}

/**
 * Filters for listing annotations
 */
export interface AnnotationFilters {
  studyId?: string;
  fileRefId?: string;
  tagIds?: string[];
  limit?: number;
  offset?: number;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a selector value is our combined text format
 */
export function isCombinedTextSelector(
  value: Selector | CombinedTextSelector | null | undefined
): value is CombinedTextSelector {
  if (!value || typeof value !== 'object') return false;
  return 'textQuote' in value && 'textPosition' in value;
}

// Re-export W3C types for convenience
export type { Annotation, AnnotationMotivation, Selector, SelectorType } from '@cluster/w3c';
