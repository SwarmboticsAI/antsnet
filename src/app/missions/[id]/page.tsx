"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Trash2Icon } from "lucide-react";
import { RobotMap } from "@/components/map";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useDeleteMission, useGetMission } from "@/hooks/use-missions";
import { useMapContext } from "@/providers/map-provider";
import { MissionPrepWizard } from "./mission-prep-wizard";
import { useMissionRunner } from "@/hooks/use-mission-runner";
import { MissionRunnerDashboard } from "./mission-runner-dashboard";
import { useRobots } from "@/providers/robot-provider";

import { useMissionLayer } from "@/hooks/use-mission-layer";
import { useStandardLayers } from "@/hooks/use-standard-layers";

export default function MissionOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { robotList } = useRobots();
  const standardLayers = useStandardLayers();
  const { flyTo } = useMapContext();
  const { data: mission, isLoading } = useGetMission(id);
  const { mutateAsync: deleteMission } = useDeleteMission();
  const { startMission, runnerState, currentPhase } = useMissionRunner(
    mission?.data ?? null
  );

  const [missionReady, setMissionReady] = useState(false);

  const missionLayers = useMissionLayer(mission?.data ?? null);

  useEffect(() => {
    if (!isLoading && mission?.data) {
      const { phases } = mission.data;
      const startLocation = phases[0]?.behaviors[0]?.params?.geoPoints?.[0];

      if (startLocation) {
        flyTo([startLocation[1], startLocation[0]]);
      }
    }
  }, [isLoading, flyTo, mission]);

  return (
    <div className="overflow-hidden">
      <SidebarProvider>
        <Sidebar>
          <>
            <div className="flex items-center justify-between p-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  router.push("/missions");
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold uppercase w-full ml-2">
                {mission?.data.name}
              </h2>
            </div>

            <div></div>

            <Button
              variant="destructive"
              className="w-full mt-4 items-center justify-center"
              onClick={async () => {
                if (!id) return;
                try {
                  await deleteMission(id);
                  router.push("/missions");
                } catch (err) {
                  console.error("❌ Failed to delete mission:", err);
                  alert("Failed to delete mission");
                }
              }}
            >
              <Trash2Icon className="h-4 w-4" />
              Delete mission
            </Button>
          </>
        </Sidebar>
      </SidebarProvider>

      <RobotMap
        robots={robotList}
        layers={[...missionLayers, ...standardLayers]}
        onDeckClick={() => {}}
      />

      {mission?.data && !missionReady && (
        <div className="fixed bottom-0 right-0 m-4">
          <MissionPrepWizard
            mission={mission.data}
            startMission={() => setMissionReady(true)}
          />
        </div>
      )}

      {mission?.data && missionReady && (
        <MissionRunnerDashboard
          startMission={startMission}
          runnerState={runnerState}
          currentPhase={currentPhase}
        />
      )}
    </div>
  );
}
