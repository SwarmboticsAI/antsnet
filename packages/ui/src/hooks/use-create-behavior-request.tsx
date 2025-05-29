import { Behavior } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/behavior_request";
import { useRallyRequest } from "@/hooks/behavior-requests/use-rally-request";
import { useDefendRequest } from "@/hooks/behavior-requests/use-defend-request";
import { useSurroundRequest } from "@/hooks/behavior-requests/use-surround-request";
import { useAreaCoverageRequest } from "@/hooks/behavior-requests/use-area-coverage-request";
import { usePatrolRequest } from "@/hooks/behavior-requests/use-patrol-request";
import { useMultiWaypointNavigationRequest } from "@/hooks/behavior-requests/use-multi-waypoint-navigation-request";
import { useRobotSelection } from "@/providers/robot-selection-provider";
import { useBehaviorCreator } from "@/providers/behavior-creator-provider";

export function useCreateBehaviorRequest(selectedRobotId?: string) {
  const { selectedRobotIds } = useRobotSelection();
  const { state, drawState } = useBehaviorCreator();

  const {
    sendRallyRequest,
    loading: rallyLoading,
    error: rallyError,
  } = useRallyRequest();
  const {
    sendDefendRequest,
    loading: defendLoading,
    error: defendError,
  } = useDefendRequest();
  const {
    sendSurroundRequest,
    loading: surroundLoading,
    error: surroundError,
  } = useSurroundRequest();
  const {
    sendAreaCoverageRequest,
    loading: areaCoverageLoading,
    error: areaCoverageError,
  } = useAreaCoverageRequest();
  const {
    sendPatrolRequest,
    loading: patrolLoading,
    error: patrolError,
  } = usePatrolRequest();
  const {
    sendMultiWaypointNavigationRequest,
    loading: multiWaypointLoading,
    error: multiWaypointError,
  } = useMultiWaypointNavigationRequest();

  const handleCreateBehavior = async () => {
    if (selectedRobotIds.length === 0) return;

    const participatingRobots = selectedRobotId
      ? [selectedRobotId]
      : selectedRobotIds;

    if (state.selectedBehavior === Behavior.BEHAVIOR_RALLY) {
      await sendRallyRequest({
        geoPoint: {
          longitude: drawState?.geoPoints?.[0]?.[1] ?? 0,
          latitude: drawState?.geoPoints?.[0]?.[0] ?? 0,
          altitude: 0,
        },
        participatingRobotIds: participatingRobots,
        rallyPointToleranceM: state.params.rallyRadiusM || 3,
      });
      return;
    }

    if (state.selectedBehavior === Behavior.BEHAVIOR_SURROUND) {
      await sendSurroundRequest({
        geoPoint: {
          longitude: drawState?.geoPoints?.[0]?.[1] ?? 0,
          latitude: drawState?.geoPoints?.[0]?.[0] ?? 0,
          altitude: 0,
        },
        participatingRobotIds: participatingRobots,
        surroundRadiusM: state.params.surroundRadiusM || 2,
      });
      return;
    }

    if (state.selectedBehavior === Behavior.BEHAVIOR_DEFEND) {
      await sendDefendRequest({
        geoPoint: {
          longitude: drawState?.geoPoints?.[0]?.[1] ?? 0,
          latitude: drawState?.geoPoints?.[0]?.[0] ?? 0,
          altitude: 0,
        },
        participatingRobotIds: participatingRobots,
        defendRadiusM: state.params.defendRadiusM || 2,
      });
      return;
    }

    if (state.selectedBehavior === Behavior.BEHAVIOR_AREA_COVERAGE) {
      await sendAreaCoverageRequest({
        coverageArea: drawState.geoPoints.map((p) => ({
          longitude: p[1],
          latitude: p[0],
          altitude: 0,
        })),
        participatingRobotIds: participatingRobots,
        laneWidthM: state.params.laneWidthM || 2,
      });
      return;
    }

    if (state.selectedBehavior === Behavior.BEHAVIOR_PATROL) {
      await sendPatrolRequest({
        patrolPerimeterPoints: drawState.geoPoints.map((p) => ({
          longitude: p[1],
          latitude: p[0],
          altitude: 0,
        })),
        participatingRobotIds: participatingRobots,
      });
      return;
    }

    if (
      state.selectedBehavior === Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION
    ) {
      await sendMultiWaypointNavigationRequest({
        geoPoints: drawState.geoPoints.map((p) => ({
          longitude: p[1],
          latitude: p[0],
          altitude: 0,
        })),
        participatingRobotId: selectedRobotId ?? selectedRobotIds[0] ?? "",
        desiredFinalYawDeg: state.params.desiredFinalYawDeg || 0,
      });
      return;
    }
  };

  return {
    sendBehaviorRequest: handleCreateBehavior,
    loading:
      rallyLoading ||
      defendLoading ||
      surroundLoading ||
      areaCoverageLoading ||
      patrolLoading ||
      multiWaypointLoading,
    error:
      rallyError ||
      defendError ||
      surroundError ||
      areaCoverageError ||
      patrolError ||
      multiWaypointError,
  };
}
