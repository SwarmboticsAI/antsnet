import { type ReactNode, useCallback } from "react";
import {
  CircleDotDashed,
  LockIcon,
  MoveHorizontal,
  TargetIcon,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useRallyRequest } from "@/hooks/behavior-requests/use-rally-request";
import { useSurroundRequest } from "@/hooks/behavior-requests/use-surround-request";
import { useDefendRequest } from "@/hooks/behavior-requests/use-defend-request";
import { Behavior } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/behavior_request";

interface MapRightClickMenuProps {
  children: ReactNode;
  clickedCoords: { lng: number; lat: number } | null;
  selectedRobotIds: string[];
  selectedRobotId?: string;
}

export function MapRightClickMenu({
  children,
  clickedCoords,
  selectedRobotIds,
  selectedRobotId,
}: MapRightClickMenuProps) {
  const { sendRallyRequest, loading: rallyRequestLoading } = useRallyRequest();
  const { sendSurroundRequest, loading: surroundRequestLoading } =
    useSurroundRequest();
  const { sendDefendRequest, loading: defendRequestLoading } =
    useDefendRequest();

  const createBehaviorDirectly = useCallback(
    async (behaviorType: Behavior, params: Record<string, any> = {}) => {
      if (!clickedCoords || selectedRobotIds.length === 0) return;

      const participatingRobots = selectedRobotId
        ? [selectedRobotId]
        : selectedRobotIds;

      if (behaviorType === Behavior.BEHAVIOR_RALLY) {
        await sendRallyRequest({
          geoPoint: {
            longitude: clickedCoords.lng,
            latitude: clickedCoords.lat,
            altitude: 0,
          },
          participatingRobotIds: participatingRobots,
          rallyPointToleranceM: params.rallyPointToleranceM || 3,
        });
        return;
      }

      if (behaviorType === Behavior.BEHAVIOR_SURROUND) {
        await sendSurroundRequest({
          geoPoint: {
            longitude: clickedCoords.lng,
            latitude: clickedCoords.lat,
            altitude: 0,
          },
          participatingRobotIds: participatingRobots,
          surroundRadiusM: params.surroundRadiusM || 2,
        });
        return;
      }

      if (behaviorType === Behavior.BEHAVIOR_DEFEND) {
        await sendDefendRequest({
          geoPoint: {
            longitude: clickedCoords.lng,
            latitude: clickedCoords.lat,
            altitude: 0,
          },
          participatingRobotIds: participatingRobots,
          defendRadiusM: params.defendRadiusM || 2,
        });
        return;
      }
    },
    [
      clickedCoords,
      selectedRobotIds,
      selectedRobotId,
      sendDefendRequest,
      sendRallyRequest,
      sendSurroundRequest,
    ]
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem
          onClick={() =>
            createBehaviorDirectly(Behavior.BEHAVIOR_RALLY, {
              rallyRadiusM: selectedRobotId ? 2 : 2 * selectedRobotIds.length,
            })
          }
          disabled={selectedRobotIds.length === 0}
        >
          <TargetIcon className="w-4 h-4" /> Rally Here
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            createBehaviorDirectly(Behavior.BEHAVIOR_DEFEND, {
              defendRadiusM: selectedRobotId ? 2 : 2 * selectedRobotIds.length,
            })
          }
          disabled={selectedRobotIds.length === 0}
        >
          <LockIcon className="w-4 h-4" /> Defend This Location
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            createBehaviorDirectly(Behavior.BEHAVIOR_SURROUND, {
              surroundRadiusM: selectedRobotId
                ? 2
                : 2 * selectedRobotIds.length,
            })
          }
          disabled={selectedRobotIds.length === 0}
        >
          <CircleDotDashed className="w-4 h-4" /> Surround This Location
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            createBehaviorDirectly(Behavior.BEHAVIOR_LINE_FORMATION, {
              separationDistanceM: 5,
              lineYawDeg: 90,
              robotYawDeg: 0,
            })
          }
          disabled={selectedRobotIds.length < 2}
        >
          <MoveHorizontal className="w-4 h-4" /> Form Line Here
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
