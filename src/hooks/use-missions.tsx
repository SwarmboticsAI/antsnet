import { MissionDraft } from "@/providers/mission-draft-provider";
import { normalizeMission } from "@/utils/normalize-mission";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAllMissions = () =>
  useQuery({
    queryKey: ["missions"],
    queryFn: async () => {
      const res = await fetch("/api/missions");
      if (!res.ok) throw new Error("Failed to load missions");
      const missions = await res.json();
      return missions.map(normalizeMission);
    },
  });

export const useCreateMission = () =>
  useMutation({
    mutationFn: async (mission: MissionDraft) => {
      const res = await fetch("/api/missions", {
        method: "POST",
        body: JSON.stringify(mission),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Create failed");
      return res.json();
    },
  });

export const useGetMission = (id?: string) =>
  useQuery({
    queryKey: ["mission", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/missions/${id}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      return normalizeMission(data);
    },
    enabled: !!id,
  });

export const useUpdateMission = () =>
  useMutation({
    mutationFn: async ({
      id,
      mission,
    }: {
      id: string;
      mission: MissionDraft;
    }) => {
      const res = await fetch(`/api/missions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(mission),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
  });

export const useDeleteMission = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/missions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
  });
