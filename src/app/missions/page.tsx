"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/sidebar";
import { RobotMap } from "@/components/map";

import { useStandardLayers } from "@/hooks/use-standard-layers";
import { useRobots } from "@/providers/robot-provider";
import { useGeoDrawing } from "@/providers/geo-drawing-provider";
import { useGeoDrawLayer } from "@/hooks/use-geo-draw-layer";
import { useMissionDraftLayer } from "@/hooks/use-mission-draft-layer";
import { useAllMissions } from "@/hooks/use-missions";
import { MissionRecord } from "@/providers/mission-provider";
import { MissionBuilder } from "./mission-builder";
import { useRouter } from "next/navigation";

export default function MissionsPage() {
  const { robotList: robots } = useRobots();
  const geoDrawLayer = useGeoDrawLayer();
  const missionDraftLayer = useMissionDraftLayer();
  const router = useRouter();

  const { data: missions, isLoading } = useAllMissions();
  const standardLayers = useStandardLayers();
  const {
    state: { mode },
    addPoint,
  } = useGeoDrawing();

  return (
    <div className="overflow-hidden">
      <SidebarProvider>
        <Sidebar>
          <div className="flex flex-col h-full">
            <div className="flex flex-col justify-between p-2">
              <h2 className="text-lg font-semibold mb-4">Missions</h2>
              {missions?.map((mission: MissionRecord) => (
                <div
                  key={mission._id}
                  className="border p-4 rounded-xs hover:bg-accent/10 cursor-pointer transition-colors mb-2"
                  onClick={() => {
                    router.push(`/missions/${mission._id}`);
                  }}
                >
                  <div className="flex flex-col justify-between">
                    <h3 className="font-medium">{mission.data.name}</h3>
                    <div className="flex items-center gap-1"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">
                      {mission.data.numberOfRobots}
                    </span>
                    <span className="text-xs">
                      {mission.data.phases?.length}
                    </span>
                    <span className="text-xs">{mission.data.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Sidebar>
      </SidebarProvider>
      <RobotMap
        robots={robots}
        layers={[
          ...standardLayers,
          ...geoDrawLayer,
          ...missionDraftLayer,
        ].flat()}
        onDeckClick={(info) => {
          if (!info.coordinate) return;

          if (mode === "drawing") {
            const [lng, lat] = info.coordinate;

            addPoint([lat, lng]);
          }
        }}
      />
      <MissionBuilder />
    </div>
  );
}
