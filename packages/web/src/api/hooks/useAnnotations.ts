/**
 * Annotation API Hooks
 *
 * React Query hooks for annotation CRUD operations with optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type {
  StoredAnnotation,
  StoredAnnotationTarget,
  CreateAnnotationInput,
  UpdateAnnotationInput,
  AnnotationFilters,
} from '@cluster/core';

// Re-export types for consumers (maintaining backward compatibility)
export type { StoredAnnotation as Annotation } from '@cluster/core';
export type { StoredAnnotationTarget as AnnotationTarget } from '@cluster/core';
export type { CreateAnnotationInput, UpdateAnnotationInput } from '@cluster/core';
export type { AnnotationFilters as AnnotationsListFilters } from '@cluster/core';

/**
 * Hook to fetch annotations with optional filters
 */
export function useAnnotations(
  filters: AnnotationFilters,
  accessToken: string | null
) {
  const queryParams = new URLSearchParams();

  if (filters.studyId) queryParams.set('studyId', filters.studyId);
  if (filters.fileRefId) queryParams.set('fileRefId', filters.fileRefId);
  if (filters.tagIds && filters.tagIds.length > 0) {
    queryParams.set('tagIds', filters.tagIds.join(','));
  }
  if (filters.limit) queryParams.set('limit', filters.limit.toString());
  if (filters.offset) queryParams.set('offset', filters.offset.toString());

  const queryString = queryParams.toString();
  const url = `/annotations${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: ['annotations', filters, accessToken],
    queryFn: () => apiClient.get<StoredAnnotation[]>(url, undefined, accessToken!),
    enabled: !!accessToken,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single annotation by ID
 */
export function useAnnotation(id: string | null, accessToken: string | null) {
  return useQuery({
    queryKey: ['annotation', id, accessToken],
    queryFn: () => apiClient.get<StoredAnnotation>(`/annotations/${id}`, undefined, accessToken!),
    enabled: !!id && !!accessToken,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to create a new annotation (with optimistic update)
 */
export function useCreateAnnotation(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAnnotationInput) =>
      apiClient.post<StoredAnnotation>('/annotations', input, accessToken!),
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['annotations'] });

      // Snapshot the previous value
      const queryCache = queryClient.getQueryCache();
      const annotationQueries = queryCache.findAll({ queryKey: ['annotations'] });
      const previousAnnotations = annotationQueries[0]?.state.data as StoredAnnotation[] | undefined;

      // Create optimistic annotation with temporary ID
      const tempId = `temp-${Date.now()}`;
      const optimisticAnnotation: StoredAnnotation = {
        id: tempId,
        orgId: '',
        studyId: input.studyId || null,
        motivation: input.motivation,
        creatorId: '',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        participantId: input.participantId || null,
        sessionId: input.sessionId || null,
        jsonld: {
          '@context': 'http://www.w3.org/ns/anno.jsonld',
          id: `urn:uuid:${tempId}`,
          type: 'Annotation',
          // Optimistic placeholder - will be replaced with server response
          motivation: 'highlighting',
          target: `temp:${tempId}`,
        },
        bodyText: input.bodyText || null,
        deletedAt: null,
        targets: input.targets.map((t, i): StoredAnnotationTarget => ({
          id: `temp-target-${i}`,
          annotationId: tempId,
          fileRefId: '',
          selectorType: t.selectorType,
          selectorValue: t.selectorValue,
          exactText: t.exactText || null,
          startTime: t.startTime ?? null,
          endTime: t.endTime ?? null,
          createdAt: new Date().toISOString(),
          fileRef: t.fileMetadata ? {
            id: '',
            name: t.fileMetadata.name,
            mimeType: t.fileMetadata.mimeType || null,
            webUrl: t.fileMetadata.webUrl || null,
            provider: 'sharepoint',
          } : undefined,
        })),
        tagIds: input.tagIds || [],
      };

      // Optimistically add annotation to all matching queries
      annotationQueries.forEach((query) => {
        queryClient.setQueryData<StoredAnnotation[]>(query.queryKey, (old) => {
          if (!old) return [optimisticAnnotation];
          return [optimisticAnnotation, ...old];
        });
      });

      return { previousAnnotations, optimisticId: optimisticAnnotation.id };
    },
    onSuccess: (data, _variables, context) => {
      // Replace optimistic annotation with real one from server
      const queryCache = queryClient.getQueryCache();
      const annotationQueries = queryCache.findAll({ queryKey: ['annotations'] });

      annotationQueries.forEach((query) => {
        queryClient.setQueryData<StoredAnnotation[]>(query.queryKey, (old) => {
          if (!old) return old;
          return old.map((annotation) =>
            annotation.id === context?.optimisticId ? data : annotation
          );
        });
      });
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousAnnotations) {
        const queryCache = queryClient.getQueryCache();
        const annotationQueries = queryCache.findAll({ queryKey: ['annotations'] });
        annotationQueries.forEach((query) => {
          queryClient.setQueryData(query.queryKey, context.previousAnnotations);
        });
      }
    },
  });
}

/**
 * Hook to update an annotation
 */
export function useUpdateAnnotation(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAnnotationInput }) =>
      apiClient.put<StoredAnnotation>(`/annotations/${id}`, input, accessToken!),
    onSuccess: (data) => {
      // Invalidate annotation queries
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
      queryClient.invalidateQueries({ queryKey: ['annotation', data.id] });
    },
  });
}

/**
 * Cluster item type for optimistic updates
 */
interface ClusterItem {
  annotationId: string;
  [key: string]: unknown;
}

/**
 * Cluster type for optimistic updates
 */
interface Cluster {
  items?: ClusterItem[];
  [key: string]: unknown;
}

/**
 * Hook to delete an annotation (with optimistic update)
 */
export function useDeleteAnnotation(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/annotations/${id}`, accessToken!),
    onMutate: async (annotationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['annotations'] });
      await queryClient.cancelQueries({ queryKey: ['clusters'] });

      // Snapshot the previous value
      const queryCache = queryClient.getQueryCache();
      const annotationQueries = queryCache.findAll({ queryKey: ['annotations'] });
      const previousAnnotations = annotationQueries[0]?.state.data as StoredAnnotation[] | undefined;

      // Optimistically remove annotation from all matching queries
      annotationQueries.forEach((query) => {
        queryClient.setQueryData<StoredAnnotation[]>(query.queryKey, (old) => {
          if (!old) return old;
          return old.filter((annotation) => annotation.id !== annotationId);
        });
      });

      // Remove annotation from all clusters
      const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });
      const previousClusters = clusterQueries[0]?.state.data;

      clusterQueries.forEach((query) => {
        queryClient.setQueryData(query.queryKey, (old: Cluster[] | Cluster | undefined) => {
          if (!old) return old;
          // Handle both ClusterWithItems[] and single ClusterWithItems
          if (Array.isArray(old)) {
            return old.map((cluster) => ({
              ...cluster,
              items: cluster.items?.filter((item) => item.annotationId !== annotationId) || [],
            }));
          }
          return old;
        });
      });

      return { previousAnnotations, previousClusters };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      const queryCache = queryClient.getQueryCache();

      if (context?.previousAnnotations) {
        const annotationQueries = queryCache.findAll({ queryKey: ['annotations'] });
        annotationQueries.forEach((query) => {
          queryClient.setQueryData(query.queryKey, context.previousAnnotations);
        });
      }

      if (context?.previousClusters) {
        const clusterQueries = queryCache.findAll({ queryKey: ['clusters'] });
        clusterQueries.forEach((query) => {
          queryClient.setQueryData(query.queryKey, context.previousClusters);
        });
      }
    },
    // Don't refetch on success - optimistic update is the source of truth
    onSuccess: () => {
      // Silent success
    },
  });
}
