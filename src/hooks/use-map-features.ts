import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchMapFeatures,
  createMapFeature,
  updateMapFeature,
  deleteMapFeature,
} from "@/lib/api/map-features";

import type { MapFeature } from "@/types/MapFeature";

export function useMapFeatures() {
  return useQuery<MapFeature[]>({
    queryKey: ["map-features"],
    queryFn: fetchMapFeatures,
  });
}

export function useCreateMapFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMapFeature,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["map-features"] }),
  });
}

export function useUpdateMapFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<MapFeature>;
    }) => updateMapFeature(id, updates),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["map-features"] }),
  });
}

export function useDeleteMapFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMapFeature,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["map-features"] }),
  });
}
