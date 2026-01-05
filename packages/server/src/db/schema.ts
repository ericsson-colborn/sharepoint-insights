/**
 * @cluster/server Database Schema
 *
 * Drizzle ORM schema definitions for the Cluster research platform.
 * This file defines all PostgreSQL tables, enums, indexes, and constraints.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  bigint,
  integer,
  decimal,
  pgEnum,
  uniqueIndex,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Cloud storage providers supported for file references.
 * Currently SharePoint is the primary provider, with planned support for
 * Google Drive, OneDrive personal, and local file system.
 */
export const storageProviderEnum = pgEnum('storage_provider', [
  'sharepoint',
  'googledrive',
  'onedrive',
  'local',
]);

/**
 * W3C Web Annotation motivation types.
 * These describe the intent behind creating an annotation, per the W3C spec.
 * @see https://www.w3.org/TR/annotation-model/#motivation-and-purpose
 */
export const annotationMotivationEnum = pgEnum('annotation_motivation', [
  'highlighting',
  'tagging',
  'classifying',
  'commenting',
  'describing',
  'linking',
  'questioning',
  'bookmarking',
]);

/**
 * W3C Web Annotation selector types.
 * Selectors identify the specific portion of a resource being annotated.
 * @see https://www.w3.org/TR/annotation-model/#selectors
 */
export const selectorTypeEnum = pgEnum('selector_type', [
  'TextQuoteSelector',
  'TextPositionSelector',
  'FragmentSelector',
  'CssSelector',
  'XPathSelector',
  'RangeSelector',
]);

// ============================================================================
// CORE ENTITIES
// ============================================================================

/**
 * Organizations (Tenants)
 *
 * Each organization represents a separate tenant with its own users, files,
 * and annotations. Organizations are identified by their Azure AD tenant ID,
 * enabling SSO and SharePoint integration.
 */
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  azureTenantId: varchar('azure_tenant_id', { length: 255 }).notNull().unique(),
  settings: jsonb('settings').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Users
 *
 * User accounts synced from Azure AD. Users belong to exactly one organization
 * and are uniquely identified by their Azure AD user ID within that org.
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  azureUserId: varchar('azure_user_id', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgUserIdx: uniqueIndex('users_org_user_idx').on(table.orgId, table.azureUserId),
}));

/**
 * Studies (Research Projects)
 *
 * A study represents a research project that groups related files, annotations,
 * and insights. Studies can optionally be linked to a SharePoint folder as
 * their source of research materials.
 */
export const studies = pgTable('studies', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  sharepointFolderUrl: varchar('sharepoint_folder_url', { length: 1000 }),
  settings: jsonb('settings').default({}).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// FILE REFERENCES
// ============================================================================

/**
 * File References (FileRef)
 *
 * PURPOSE:
 * FileRefs are lightweight, stable database records that reference files stored
 * in external cloud storage (SharePoint, Google Drive, etc.). They act as an
 * indirection layer between annotations and the actual files.
 *
 * WHY THIS EXISTS:
 * 1. Annotations need a stable foreign key target, but cloud file IDs can change
 *    (e.g., when a file is moved or restored from trash)
 * 2. We cache frequently-needed metadata (name, mimeType) to avoid repeated
 *    API calls to the storage provider
 * 3. We need to track which files belong to which org/study for access control
 *
 * WHAT FILEREF IS:
 * - A cached reference to an external file with enough info to locate it
 * - The target for annotation_targets foreign keys
 * - A way to track file-level metadata without storing file content
 *
 * WHAT FILEREF IS NOT:
 * - NOT a copy of the file content (files stay in cloud storage)
 * - NOT the source of truth for file metadata (that's the storage provider)
 * - NOT required to exist before browsing files (created on-demand when annotating)
 *
 * LIFECYCLE:
 * 1. User browses SharePoint files (no FileRef needed yet)
 * 2. User creates annotation on a file → FileRef created/upserted
 * 3. FileRef persists even if cloud file is moved (driveId+itemId may need update)
 * 4. If cloud file is deleted, FileRef becomes orphaned (annotations preserved)
 *
 * PROVIDER-SPECIFIC FIELDS:
 * Currently uses SharePoint-specific field names (sharepointDriveId, etc.) for
 * backward compatibility. Future multi-provider support may generalize these
 * to provider-agnostic names (driveId, itemId, containerId).
 */
export const fileRefs = pgTable('file_refs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  studyId: uuid('study_id').references(() => studies.id, { onDelete: 'set null' }),

  /** Storage provider (defaults to sharepoint for backward compatibility) */
  provider: storageProviderEnum('provider').default('sharepoint').notNull(),

  /**
   * SharePoint-specific identifiers.
   * - driveId: The SharePoint drive containing the file
   * - itemId: The file's unique ID within that drive
   * - siteId: Optional site ID for cross-site queries
   *
   * Together, (orgId, driveId, itemId) form a unique constraint.
   */
  sharepointDriveId: varchar('sharepoint_drive_id', { length: 255 }).notNull(),
  sharepointItemId: varchar('sharepoint_item_id', { length: 255 }).notNull(),
  sharepointSiteId: varchar('sharepoint_site_id', { length: 255 }),

  /** Cached file metadata (may become stale; re-sync from provider as needed) */
  name: varchar('name', { length: 500 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }),
  sizeBytes: bigint('size_bytes', { mode: 'number' }),
  webUrl: varchar('web_url', { length: 1000 }),

  /** Content verification for detecting changes */
  contentHash: varchar('content_hash', { length: 64 }),
  lastSyncedAt: timestamp('last_synced_at'),

  /** Optional link to transcript file for media files */
  transcriptFileId: uuid('transcript_file_id'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  /** Ensures one FileRef per file per org (upsert-friendly) */
  orgSharepointIdx: uniqueIndex('file_refs_org_sharepoint_idx').on(
    table.orgId,
    table.sharepointDriveId,
    table.sharepointItemId
  ),
  /** For lookups by SharePoint IDs without org context */
  sharepointIdx: index('idx_file_refs_sharepoint').on(table.sharepointDriveId, table.sharepointItemId),
}));

/**
 * File Views (Activity Tracking)
 *
 * Tracks when users view files, enabling "recently viewed" features and
 * activity analytics. Only the most recent view per user/file pair is stored.
 */
export const fileViews = pgTable('file_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  fileRefId: uuid('file_ref_id').references(() => fileRefs.id, { onDelete: 'cascade' }).notNull(),
  viewedAt: timestamp('viewed_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  /** One record per user/file pair (upsert on re-view) */
  userFileUnique: uniqueIndex('file_views_user_file_unique').on(table.userId, table.fileRefId),
  /** For "recently viewed" queries sorted by time */
  userViewedIdx: index('idx_file_views_user_viewed').on(table.userId, table.viewedAt),
  fileIdx: index('idx_file_views_file').on(table.fileRefId),
}));

// ============================================================================
// TAXONOMY & TAGS
// ============================================================================

/**
 * Taxonomies
 *
 * Hierarchical tag groupings that can be org-wide (global) or study-specific.
 * Each taxonomy contains a tree of tags for categorizing annotations.
 */
export const taxonomies = pgTable('taxonomies', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  studyId: uuid('study_id').references(() => studies.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isGlobal: boolean('is_global').default(false).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tags
 *
 * Individual tags within a taxonomy. Tags can be nested (parentId) to form
 * hierarchies like "Pain Points > Usability > Navigation".
 */
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  taxonomyId: uuid('taxonomy_id').references(() => taxonomies.id, { onDelete: 'cascade' }).notNull(),
  /** Self-referential for hierarchical tags */
  parentId: uuid('parent_id'),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  color: varchar('color', { length: 7 }),
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  taxonomySlugIdx: uniqueIndex('tags_taxonomy_slug_idx').on(table.taxonomyId, table.slug),
  taxonomyIdx: index('idx_tags_taxonomy').on(table.taxonomyId),
}));

// ============================================================================
// ANNOTATIONS (W3C Web Annotation Model)
// ============================================================================

/**
 * Annotations
 *
 * Core W3C Web Annotation records. An annotation connects a "body" (the comment,
 * tag, or insight) to one or more "targets" (specific locations in files).
 * The full W3C JSON-LD representation is stored in the `jsonld` column for
 * standards compliance and export.
 *
 * @see https://www.w3.org/TR/annotation-model/
 */
export const annotations = pgTable('annotations', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  studyId: uuid('study_id').references(() => studies.id, { onDelete: 'set null' }),

  /** W3C motivation(s) describing why the annotation was created */
  motivation: annotationMotivationEnum('motivation').array().notNull(),

  creatorId: uuid('creator_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  modifiedAt: timestamp('modified_at').defaultNow().notNull(),

  /** Research-specific metadata for participant/session tracking */
  participantId: varchar('participant_id', { length: 100 }),
  sessionId: varchar('session_id', { length: 100 }),

  /** Full W3C JSON-LD representation for export/interop */
  jsonld: jsonb('jsonld').notNull(),
  /** Denormalized body text for display and search */
  bodyText: text('body_text'),

  /** Soft delete timestamp (null = not deleted) */
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  orgIdx: index('idx_annotations_org').on(table.orgId),
  studyIdx: index('idx_annotations_study').on(table.studyId),
  creatorIdx: index('idx_annotations_creator').on(table.creatorId),
  createdIdx: index('idx_annotations_created').on(table.createdAt),
}));

/**
 * Annotation Targets
 *
 * Links an annotation to a specific location within a file. Each annotation
 * can have multiple targets (e.g., linking two transcript quotes together).
 * The selector defines the precise location (text range, time range, etc.).
 */
export const annotationTargets = pgTable('annotation_targets', {
  id: uuid('id').primaryKey().defaultRandom(),
  annotationId: uuid('annotation_id').references(() => annotations.id, { onDelete: 'cascade' }).notNull(),
  fileRefId: uuid('file_ref_id').references(() => fileRefs.id, { onDelete: 'cascade' }).notNull(),

  /** W3C selector type (TextQuoteSelector, FragmentSelector, etc.) */
  selectorType: selectorTypeEnum('selector_type').notNull(),
  /** Selector value as JSON (structure depends on selectorType) */
  selectorValue: jsonb('selector_value').notNull(),

  /** Denormalized fields for efficient queries and display */
  exactText: text('exact_text'),
  startTime: decimal('start_time', { precision: 10, scale: 3 }),
  endTime: decimal('end_time', { precision: 10, scale: 3 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  fileIdx: index('idx_annotation_targets_file').on(table.fileRefId),
}));

/**
 * Annotation Tags (Join Table)
 *
 * Many-to-many relationship between annotations and tags.
 */
export const annotationTags = pgTable('annotation_tags', {
  annotationId: uuid('annotation_id').references(() => annotations.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.annotationId, table.tagId] }),
}));

// ============================================================================
// INSIGHTS & SYNTHESIS
// ============================================================================

/**
 * Insights
 *
 * Evidence-backed research claims that synthesize multiple annotations into
 * actionable findings. Insights link to their supporting evidence (annotations)
 * and can include confidence levels and recommendations.
 */
export const insights = pgTable('insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  studyId: uuid('study_id').references(() => studies.id, { onDelete: 'set null' }),

  title: varchar('title', { length: 500 }).notNull(),
  bodyMarkdown: text('body_markdown'),

  /** Confidence and impact ratings for prioritization */
  confidence: varchar('confidence', { length: 50 }),
  impact: varchar('impact', { length: 50 }),
  recommendation: text('recommendation'),

  creatorId: uuid('creator_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  /** W3C JSON-LD representation (insights are also annotations) */
  jsonld: jsonb('jsonld'),
}, (table) => ({
  studyIdx: index('idx_insights_study').on(table.studyId),
}));

/**
 * Insight Evidence (Join Table)
 *
 * Links insights to the annotations that support them, with optional notes
 * explaining how each piece of evidence supports the insight.
 */
export const insightEvidence = pgTable('insight_evidence', {
  insightId: uuid('insight_id').references(() => insights.id, { onDelete: 'cascade' }).notNull(),
  annotationId: uuid('annotation_id').references(() => annotations.id, { onDelete: 'cascade' }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  note: text('note'),
}, (table) => ({
  pk: primaryKey({ columns: [table.insightId, table.annotationId] }),
}));

// ============================================================================
// AFFINITY MAPPING & CANVAS
// ============================================================================

/**
 * Affinity Groups
 *
 * Named clusters of annotations on the synthesis canvas. Groups have a position
 * and size for visual layout, and can be styled with colors.
 */
export const affinityGroups = pgTable('affinity_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  studyId: uuid('study_id').references(() => studies.id, { onDelete: 'cascade' }),
  boardId: uuid('board_id'),

  name: varchar('name', { length: 255 }).notNull(),
  color: varchar('color', { length: 7 }),

  /** Visual position and dimensions on the canvas */
  positionX: decimal('position_x', { precision: 10, scale: 2 }),
  positionY: decimal('position_y', { precision: 10, scale: 2 }),
  width: decimal('width', { precision: 10, scale: 2 }),
  height: decimal('height', { precision: 10, scale: 2 }),

  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Affinity Group Items (Join Table)
 *
 * Places annotations within affinity groups, with position for visual layout.
 */
export const affinityGroupItems = pgTable('affinity_group_items', {
  affinityGroupId: uuid('affinity_group_id').references(() => affinityGroups.id, { onDelete: 'cascade' }).notNull(),
  annotationId: uuid('annotation_id').references(() => annotations.id, { onDelete: 'cascade' }).notNull(),
  positionX: decimal('position_x', { precision: 10, scale: 2 }),
  positionY: decimal('position_y', { precision: 10, scale: 2 }),
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.affinityGroupId, table.annotationId] }),
}));

/**
 * Canvas Nodes
 *
 * Standalone annotation nodes on the organize canvas that aren't yet grouped.
 * These represent highlights that have been added to the canvas but not
 * assigned to an affinity group.
 */
export const canvasNodes = pgTable('canvas_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  studyId: uuid('study_id').references(() => studies.id, { onDelete: 'cascade' }),
  annotationId: uuid('annotation_id').references(() => annotations.id, { onDelete: 'cascade' }).notNull(),

  positionX: decimal('position_x', { precision: 10, scale: 2 }).notNull(),
  positionY: decimal('position_y', { precision: 10, scale: 2 }).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgStudyAnnotationIdx: index('idx_canvas_nodes_org_study_annotation').on(table.orgId, table.studyId, table.annotationId),
  orgIdx: index('idx_canvas_nodes_org').on(table.orgId),
  studyIdx: index('idx_canvas_nodes_study').on(table.studyId),
}));

/**
 * Canvas Snapshots
 *
 * Versioned saves of the entire canvas state (React Flow nodes, edges, viewport).
 * Enables undo/redo and history of the affinity mapping process.
 */
export const canvasSnapshots = pgTable('canvas_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  studyId: uuid('study_id').references(() => studies.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  versionNumber: integer('version_number').notNull(),

  /** Serialized React Flow state (nodes, edges, viewport) */
  canvasState: jsonb('canvas_state').notNull(),

  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  studyIdx: index('idx_canvas_snapshots_study').on(table.studyId),
  createdIdx: index('idx_canvas_snapshots_created').on(table.createdAt),
}));
