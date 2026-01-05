/**
 * Motivation UI Metadata
 *
 * UI-specific metadata for displaying annotation motivations.
 * This includes labels, icons, and colors for visual representation.
 */

import type { AnnotationMotivation } from '@cluster/w3c';
import type { ResearchMotivation } from '@cluster/core';

/**
 * Combined motivation type (W3C + research extensions)
 */
export type AllMotivation = AnnotationMotivation | ResearchMotivation;

/**
 * Motivation metadata for UI display
 */
export interface MotivationInfo {
  /** Motivation identifier */
  id: AllMotivation;
  /** Human-readable label */
  label: string;
  /** Description of the motivation */
  description: string;
  /** Lucide icon name */
  icon: string;
  /** Color for visual distinction (hex) */
  color?: string;
  /** Whether this is a research extension */
  isExtension?: boolean;
}

/**
 * Metadata for W3C standard motivations
 */
export const MOTIVATION_INFO: Record<AnnotationMotivation, MotivationInfo> = {
  assessing: {
    id: 'assessing',
    label: 'Assessment',
    description: 'An assessment or evaluation of the target',
    icon: 'check-circle',
  },
  bookmarking: {
    id: 'bookmarking',
    label: 'Bookmark',
    description: 'Saved for later reference',
    icon: 'bookmark',
  },
  classifying: {
    id: 'classifying',
    label: 'Classification',
    description: 'Categorization using a taxonomy',
    icon: 'folder',
  },
  commenting: {
    id: 'commenting',
    label: 'Comment',
    description: 'A comment or note about the target',
    icon: 'message-square',
  },
  describing: {
    id: 'describing',
    label: 'Description',
    description: 'A description of the target',
    icon: 'file-text',
  },
  editing: {
    id: 'editing',
    label: 'Edit Suggestion',
    description: 'A suggested edit or correction',
    icon: 'edit',
  },
  highlighting: {
    id: 'highlighting',
    label: 'Highlight',
    description: 'Marking an important section',
    icon: 'highlighter',
    color: '#fef08a',
  },
  identifying: {
    id: 'identifying',
    label: 'Identification',
    description: 'Identifying what the target represents',
    icon: 'tag',
  },
  linking: {
    id: 'linking',
    label: 'Link',
    description: 'Creating a connection to another resource',
    icon: 'link',
  },
  moderating: {
    id: 'moderating',
    label: 'Moderation',
    description: 'Moderation-related annotation',
    icon: 'shield',
  },
  questioning: {
    id: 'questioning',
    label: 'Question',
    description: 'A question about the target',
    icon: 'help-circle',
  },
  replying: {
    id: 'replying',
    label: 'Reply',
    description: 'A response to another annotation',
    icon: 'corner-up-left',
  },
  tagging: {
    id: 'tagging',
    label: 'Tag',
    description: 'Adding keywords or labels',
    icon: 'hash',
  },
};

/**
 * Metadata for research extension motivations
 */
export const RESEARCH_MOTIVATION_INFO: Record<ResearchMotivation, MotivationInfo> = {
  'research:insight': {
    id: 'research:insight',
    label: 'Insight',
    description: 'A key finding or insight',
    icon: 'lightbulb',
    color: '#fde047',
    isExtension: true,
  },
  'research:evidence': {
    id: 'research:evidence',
    label: 'Evidence',
    description: 'Supporting evidence for a claim',
    icon: 'check-square',
    color: '#86efac',
    isExtension: true,
  },
  'research:theme': {
    id: 'research:theme',
    label: 'Theme',
    description: 'A recurring theme or pattern',
    icon: 'layers',
    color: '#c4b5fd',
    isExtension: true,
  },
  'research:quote': {
    id: 'research:quote',
    label: 'Quote',
    description: 'A notable quote for reference',
    icon: 'quote',
    color: '#fca5a5',
    isExtension: true,
  },
  'research:action': {
    id: 'research:action',
    label: 'Action Item',
    description: 'A follow-up action or task',
    icon: 'play-circle',
    color: '#93c5fd',
    isExtension: true,
  },
  'research:synthesis': {
    id: 'research:synthesis',
    label: 'Synthesis',
    description: 'A synthesis or summary',
    icon: 'git-merge',
    color: '#fdba74',
    isExtension: true,
  },
};

/**
 * Get motivation info by ID
 */
export function getMotivationInfo(motivation: AllMotivation): MotivationInfo | undefined {
  if (motivation.startsWith('research:')) {
    return RESEARCH_MOTIVATION_INFO[motivation as ResearchMotivation];
  }
  return MOTIVATION_INFO[motivation as AnnotationMotivation];
}

/**
 * Check if a motivation is a standard W3C motivation
 */
export function isStandardMotivation(motivation: string): motivation is AnnotationMotivation {
  return motivation in MOTIVATION_INFO;
}

/**
 * Check if a motivation is a research extension
 */
export function isResearchMotivation(motivation: string): motivation is ResearchMotivation {
  return motivation.startsWith('research:');
}

/**
 * Get primary motivation from an array
 * Standard motivations take precedence over research extensions
 */
export function getPrimaryMotivation(
  motivations: AllMotivation | AllMotivation[]
): AllMotivation {
  const list = Array.isArray(motivations) ? motivations : [motivations];
  const standard = list.find(isStandardMotivation);
  return standard ?? list[0] ?? 'commenting';
}
