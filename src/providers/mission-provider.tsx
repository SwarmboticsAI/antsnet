"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  useCreateMission,
  useUpdateMission,
  useDeleteMission,
  useGetMission,
} from "@/hooks/use-missions";
import { useMissionDraft } from "./mission-draft-provider";

import {
  MissionPhase,
  RobotGroup,
  StagingArea,
  MissionDraft,
} from "./mission-draft-provider";
import { normalizeMission } from "@/utils/normalize-mission";

export interface MissionRecord {
  _id: string; // Mongo ID
  data: MissionDraft;
  createdAt: Date;
  updatedAt: Date;
}

interface MissionContextType {
  currentMissionId?: string;
  loadMission: (id: string) => Promise<void>;
  saveMission: () => Promise<void>;
  deleteMission: (id: string) => Promise<void>;
  runMission: () => Promise<void>;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider = ({ children }: { children: ReactNode }) => {
  const [currentMissionId, setCurrentMissionId] = useState<
    string | undefined
  >();
  const { state: draftState, dispatch } = useMissionDraft();

  const { mutateAsync: createMission } = useCreateMission();
  const { mutateAsync: updateMission } = useUpdateMission();
  const { mutateAsync: deleteMissionById } = useDeleteMission();
  const { data: loadedMission, refetch } = useGetMission(currentMissionId);

  // 🧩 Inject API-loaded mission into draft reducer
  const injectToDraft = (mission: MissionDraft) => {
    dispatch({ type: "RESET_DRAFT" });

    dispatch({ type: "SET_NAME", name: mission.name });
    dispatch({
      type: "SET_DESCRIPTION",
      description: mission.description || "",
    });

    mission.stagingAreas.forEach((area: StagingArea) => {
      dispatch({ type: "ADD_STAGING_AREA", area });
    });

    mission.robotGroups.forEach((group: RobotGroup) => {
      dispatch({ type: "ADD_GROUP", group });
    });

    mission.phases.forEach((phase: MissionPhase) => {
      dispatch({ type: "ADD_PHASE", name: phase.name });
      phase.behaviors.forEach((behavior) => {
        dispatch({
          type: "ADD_BEHAVIOR",
          phaseId: phase.id,
          behavior,
        });
      });
    });
  };

  const loadMission = async (mongoId: string) => {
    setCurrentMissionId(mongoId);
    const res = await fetch(`/api/missions/${mongoId}`);
    if (!res.ok) throw new Error("Failed to load mission");

    const raw = await res.json();
    const mission: MissionRecord = normalizeMission(raw);

    injectToDraft(mission.data); // inject clean draft
    setCurrentMissionId(mission._id); // store Mongo ID
  };

  const saveMission = async () => {
    const mission = draftState.mission;
    if (currentMissionId) {
      await updateMission({ id: currentMissionId, mission });
    } else {
      const newMission = await createMission(mission);
      setCurrentMissionId(newMission._id);
    }
  };

  const deleteMission = async (id: string) => {
    await deleteMissionById(id);
    if (id === currentMissionId) {
      dispatch({ type: "RESET_DRAFT" });
      setCurrentMissionId(undefined);
    }
  };

  const runMission = async () => {
    // 💣 Stub — will handle real execution logic later
    console.log("🧠 Running mission:", draftState.mission.name);
    alert("Run mission not yet implemented");
  };

  const value = useMemo(
    () => ({
      currentMissionId,
      loadMission,
      saveMission,
      deleteMission,
      runMission,
    }),
    [currentMissionId, draftState]
  );

  return (
    <MissionContext.Provider value={value}>{children}</MissionContext.Provider>
  );
};

export const useMission = () => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error("useMission must be used within a MissionProvider");
  }
  return context;
};
