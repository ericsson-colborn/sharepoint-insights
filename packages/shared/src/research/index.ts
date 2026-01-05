/**
 * @cluster/research
 *
 * Research-specific extension types
 * Custom vocabulary at https://research-annotations.io/ns/research.jsonld
 */

import type { Annotation } from '@cluster/w3c';
import type { StorageProvider } from '../db';

// ============================================================================
// Study Types
// ============================================================================

export type StudyStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface Study {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  status: StudyStatus;
  sharepointFolderUrl?: string;
  settings: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Research Annotations
// ============================================================================

export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Research-specific motivation extensions
 */
export type ResearchMotivation =
  | 'research:insight'
  | 'research:evidence'
  | 'research:theme'
  | 'research:quote'
  | 'research:action'
  | 'research:synthesis';

/**
 * Insight annotation with research metadata
 */
export interface Insight extends Annotation {
  type: ['Annotation', 'research:Insight'];
  'research:confidence'?: ConfidenceLevel;
  'research:impact'?: ImpactLevel;
  'research:recommendation'?: string;
}

/**
 * Annotation with research context
 */
export interface ResearchAnnotation extends Annotation {
  'research:study'?: string;
  'research:participant'?: string;
  'research:session'?: string;
}

// ============================================================================
// Affinity Mapping
// ============================================================================

export interface AffinityGroup {
  id: string;
  studyId: string;
  boardId?: string;
  name: string;
  color?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Taxonomy & Tags
// ============================================================================

export interface Taxonomy {
  id: string;
  orgId: string;
  studyId?: string;
  name: string;
  description?: string;
  isGlobal: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  taxonomyId: string;
  parentId?: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
}

// ============================================================================
// File References
// ============================================================================

export interface FileRef {
  id: string;
  orgId: string;
  studyId?: string;
  provider: StorageProvider;
  sharepointDriveId: string;
  sharepointItemId: string;
  sharepointSiteId?: string;
  name: string;
  mimeType?: string;
  sizeBytes?: number;
  webUrl?: string;
  contentHash?: string;
  lastSyncedAt?: string;
  transcriptFileId?: string;
  createdAt: string;
  updatedAt: string;
}

// Re-export for convenience
export type { StorageProvider } from '../db';
