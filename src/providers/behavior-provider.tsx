"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  ReactNode,
  useReducer,
} from "react";
import { KeyExpr } from "@eclipse-zenoh/zenoh-ts";
import { useZenoh } from "@/providers/zenoh-provider";
import { useSessions } from "@/providers/session-provider";
import { v4 as uuidv4 } from "uuid";

import {
  BehaviorRequest,
  Behavior,
} from "@/protos/generated/sbai_behavior_protos/sbai_behavior_protos/behavior_request";
import { CredentialedBehaviorRequest } from "@/protos/generated/sbai_tak_protos/sbai_tak_protos/credentialed_behavior_request";
import { CredentialedCancelBehavior } from "@/protos/generated/sbai_tak_protos/sbai_tak_protos/credentialed_cancel_behavior";
import { AuthenticationHeader } from "@/protos/generated/sbai_tak_protos/sbai_tak_protos/authentication_header";
import { GeoPoint } from "@/protos/generated/sbai_geographic_protos/sbai_geographic_protos/geo_point";
import { RallyParameters } from "@/protos/generated/sbai_behavior_protos/sbai_behavior_protos/rally_parameters";
import { SurroundParameters } from "@/protos/generated/sbai_behavior_protos/sbai_behavior_protos/surround_parameters";
import { DefendParameters } from "@/protos/generated/sbai_behavior_protos/sbai_behavior_protos/defend_parameters";
import { MultiWaypointNavigationParameters } from "@/protos/generated/sbai_behavior_protos/sbai_behavior_protos/multi_waypoint_navigation_parameters";
import { AreaCoverageParameters } from "@/protos/generated/sbai_behavior_protos/sbai_behavior_protos/area_coverage_parameters";
import { LineFormationParameters } from "@/protos/generated/sbai_behavior_protos/sbai_behavior_protos/line_formation_parameters";

import { String as StringProto } from "@/protos/generated/sbai_std_protos/sbai_std_protos/string";
import { Any } from "@/protos/generated/google/protobuf/any";

import {
  behaviorReducer,
  initialBehaviorState,
  BehaviorStatusUI,
  BehaviorInfo,
} from "@/reducers/behavior-reducer";
import { BehaviorParams } from "@/types/Behavior";

const BEHAVIOR_REQUEST_ROUTE = (robotId: string) =>
  `ants/${robotId}/behavior_requests`;
const CANCEL_BEHAVIOR_ROUTE = (robotId: string) =>
  `ants/${robotId}/cancel_behavior`;

interface BehaviorContextType {
  dispatch: React.Dispatch<any>;
  behaviors: Record<string, BehaviorInfo>;
  activeBehaviorId: string | null;
  activeBehavior: BehaviorInfo | null;
  requestBehavior: (
    behaviorType: Behavior,
    robotIds: string[],
    params: BehaviorParams
  ) => Promise<string | null>;
  cancelBehavior: (behaviorId: string) => Promise<boolean>;
  getBehaviorInfo: (behaviorId: string) => BehaviorInfo | undefined;
  behaviorsByStatus: Record<BehaviorStatusUI, BehaviorInfo[]>;
}

const BehaviorContext = createContext<BehaviorContextType | null>(null);

export const BehaviorProvider = ({ children }: { children: ReactNode }) => {
  const { session, isConnected } = useZenoh();
  const { clientTakId, sessions } = useSessions();
  const [state, dispatch] = useReducer(behaviorReducer, initialBehaviorState);

  const getBehaviorInfo = useCallback(
    (behaviorId: string) => state.behaviors[behaviorId],
    [state.behaviors]
  );

  const activeBehavior = useMemo(() => {
    return state.activeBehaviorId
      ? state.behaviors[state.activeBehaviorId]
      : null;
  }, [state.activeBehaviorId, state.behaviors]);

  const behaviorsByStatus = useMemo(() => {
    const result: Record<BehaviorStatusUI, BehaviorInfo[]> = {
      [BehaviorStatusUI.UNSPECIFIED]: [],
      [BehaviorStatusUI.ACCEPTED]: [],
      [BehaviorStatusUI.ACTIVE]: [],
      [BehaviorStatusUI.COMPLETED]: [],
      [BehaviorStatusUI.FAILED]: [],
      [BehaviorStatusUI.CANCELED]: [],
    };

    Object.values(state.behaviors).forEach((behavior: BehaviorInfo) => {
      result[behavior.status].push(behavior);
    });

    return result;
  }, [state.behaviors]);

  const requestBehavior = useCallback(
    async (
      behaviorType: Behavior,
      robotIds: string[],
      params: BehaviorParams
    ): Promise<string | null> => {
      console.log("requesting behavior", behaviorType, robotIds, params);

      if (!isConnected || !session) return null;
      if (robotIds.length === 0) return null;

      const behaviorId = uuidv4();

      console.log("are we here", behaviorId);
      try {
        const geoPoints = (params.geoPoints || []).map(
          ([lat, lng]: [number, number]) =>
            GeoPoint.fromPartial({ latitude: lat, longitude: lng })
        );

        const participatingRobotIds = robotIds.map((id) =>
          StringProto.fromPartial({ data: id })
        );

        let behaviorParams: Any;

        switch (behaviorType) {
          case Behavior.BEHAVIOR_RALLY: {
            const proto = RallyParameters.fromPartial({
              rallyRadiusM: params.rallyRadiusM ?? 5,
            });
            behaviorParams = {
              typeUrl:
                "type.googleapis.com/sbai_behavior_protos.RallyParameters",
              value: Buffer.from(RallyParameters.encode(proto).finish()),
            };
            break;
          }

          case Behavior.BEHAVIOR_SURROUND: {
            const proto = SurroundParameters.fromPartial({
              surroundRadiusM: params.surroundRadiusM ?? 10,
            });
            behaviorParams = {
              typeUrl:
                "type.googleapis.com/sbai_behavior_protos.SurroundParameters",
              value: Buffer.from(SurroundParameters.encode(proto).finish()),
            };
            break;
          }

          case Behavior.BEHAVIOR_DEFEND: {
            const proto = DefendParameters.fromPartial({
              defendRadiusM: params.defendRadiusM ?? 15,
            });
            behaviorParams = {
              typeUrl:
                "type.googleapis.com/sbai_behavior_protos.DefendParameters",
              value: Buffer.from(DefendParameters.encode(proto).finish()),
            };
            break;
          }

          case Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION: {
            const proto = MultiWaypointNavigationParameters.fromPartial({
              desiredFinalYawDeg: params.desiredFinalYawDeg ?? 0,
            });
            behaviorParams = {
              typeUrl:
                "type.googleapis.com/sbai_behavior_protos.MultiWaypointNavigationParameters",
              value: Buffer.from(
                MultiWaypointNavigationParameters.encode(proto).finish()
              ),
            };
            break;
          }

          case Behavior.BEHAVIOR_AREA_COVERAGE: {
            console.log("Area coverage params", params);
            const proto = AreaCoverageParameters.fromPartial({
              laneWidthM: params.laneWidthM ?? 5,
            });
            behaviorParams = {
              typeUrl:
                "type.googleapis.com/sbai_behavior_protos.AreaCoverageParameters",
              value: Buffer.from(AreaCoverageParameters.encode(proto).finish()),
            };
            break;
          }

          case Behavior.BEHAVIOR_LINE_FORMATION: {
            const proto = LineFormationParameters.fromPartial({
              separationDistanceM: params.separationDistanceM ?? 2,
              lineYawDeg: params.lineYawDeg ?? 0,
              robotYawDeg: params.robotYawDeg ?? 0,
            });
            behaviorParams = {
              typeUrl:
                "type.googleapis.com/sbai_behavior_protos.LineFormationParameters",
              value: Buffer.from(
                LineFormationParameters.encode(proto).finish()
              ),
            };
            break;
          }

          default: {
            console.warn(
              "⚠️ No params encoded for behavior type",
              behaviorType
            );
            behaviorParams = Any.fromPartial({});
          }
        }

        const behaviorRequest = BehaviorRequest.fromPartial({
          requestedBehavior: behaviorType,
          behaviorRequestId: behaviorId,
          participatingRobotIds,
          geoPoints,
          behaviorParams,
        });

        const behavior: BehaviorInfo = {
          behaviorId,
          behaviorType,
          robotIds,
          params,
          createdAt: new Date(),
          status: BehaviorStatusUI.UNSPECIFIED,
          robotStatuses: {},
          robotPaths: {},
        };

        robotIds.forEach((robotId) => {
          behavior.robotStatuses[robotId] = {
            robotId,
            status: BehaviorStatusUI.UNSPECIFIED,
            lastUpdate: new Date(),
          };
        });

        dispatch({ type: "REGISTER_BEHAVIOR", behavior });
        dispatch({ type: "SET_ACTIVE_BEHAVIOR", behaviorId });
        console.log("Behavior registered:", behavior);

        for (const robotId of robotIds) {
          const sessionInfo = sessions[robotId];
          if (!sessionInfo?.token) continue;

          const authHeader = AuthenticationHeader.fromPartial({
            takId: clientTakId,
            sessionToken: sessionInfo.token,
          });

          const credentialed = CredentialedBehaviorRequest.fromPartial({
            authenticationHeader: authHeader,
            internalMessage: behaviorRequest,
          });

          const encoded =
            CredentialedBehaviorRequest.encode(credentialed).finish();
          const route = new KeyExpr(BEHAVIOR_REQUEST_ROUTE(robotId));
          await session.put(route, encoded);
        }

        return behaviorId;
      } catch (e) {
        dispatch({ type: "FAIL_BEHAVIOR", behaviorId });
        console.error("Error requesting behavior:", e);
        return null;
      }
    },
    [isConnected, session, sessions, clientTakId]
  );

  const cancelBehavior = useCallback(
    async (behaviorId: string): Promise<boolean> => {
      if (!isConnected || !session) return false;

      const behavior = state.behaviors[behaviorId];
      if (!behavior) return false;

      try {
        for (const robotId of behavior.robotIds) {
          const sessionInfo = sessions[robotId];
          if (!sessionInfo?.token) continue;

          const authHeader = AuthenticationHeader.fromPartial({
            takId: clientTakId,
            sessionToken: sessionInfo.token,
          });

          const behaviorIdMessage = StringProto.fromPartial({
            data: behaviorId,
          });

          const credentialedCancel = CredentialedCancelBehavior.fromPartial({
            authenticationHeader: authHeader,
            internalMessage: behaviorIdMessage,
          });

          const encoded =
            CredentialedCancelBehavior.encode(credentialedCancel).finish();
          const cancelRoute = new KeyExpr(CANCEL_BEHAVIOR_ROUTE(robotId));
          await session.put(cancelRoute, encoded);
        }

        dispatch({ type: "CANCEL_BEHAVIOR", behaviorId });
        return true;
      } catch (e) {
        console.error("Error canceling behavior:", e);
        return false;
      }
    },
    [isConnected, session, state.behaviors, sessions, clientTakId]
  );

  const contextValue = useMemo<BehaviorContextType>(
    () => ({
      dispatch,
      behaviors: state.behaviors,
      activeBehaviorId: state.activeBehaviorId,
      activeBehavior,
      requestBehavior,
      cancelBehavior,
      getBehaviorInfo,
      behaviorsByStatus,
    }),
    [
      dispatch,
      state.behaviors,
      state.activeBehaviorId,
      activeBehavior,
      requestBehavior,
      cancelBehavior,
      getBehaviorInfo,
      behaviorsByStatus,
    ]
  );

  return (
    <BehaviorContext.Provider value={contextValue}>
      {children}
    </BehaviorContext.Provider>
  );
};

export const useBehaviors = (): BehaviorContextType => {
  const context = useContext(BehaviorContext);
  if (!context) {
    throw new Error("useBehaviors must be used within a BehaviorProvider");
  }
  return context;
};

export default BehaviorProvider;
