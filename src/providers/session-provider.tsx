"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { KeyExpr } from "@eclipse-zenoh/zenoh-ts";
import { useProfile } from "@/providers/profile-provider";
import { useZenoh } from "@/providers/zenoh-provider";
import {
  SessionRequest,
  SessionRequestType,
} from "@/protos/generated/sbai_tak_protos/sbai_tak_protos/session_request";
import {
  SessionEvent,
  SessionEventType,
} from "@/protos/generated/sbai_tak_protos/sbai_tak_protos/session_event";
import {
  sessionReducer,
  SessionStatus,
  SessionInfo,
} from "@/reducers/session-reducer";

interface SessionContextType {
  sessions: Record<string, SessionInfo>;
  robotSessions: SessionInfo[];
  activeRobotIds: string[];
  requestSession: (robotId: string, takId: string) => Promise<boolean>;
  requestMultipleSessions: (
    robotIds: string[]
  ) => Promise<Record<string, boolean>>;
  terminateSession: (robotId: string) => Promise<boolean>;
  terminateMultipleSessions: (
    robotIds: string[]
  ) => Promise<Record<string, boolean>>;
  hasActiveSession: (robotId: string) => boolean;
  getSessionInfo: (robotId: string) => SessionInfo | undefined;
  sessionsByStatus: Record<SessionStatus, SessionInfo[]>;
  clientTakId: string;
}

const SESSION_REQUEST_ROUTE = (robotId: string) =>
  `ants/${robotId}/session_requests`;
const SESSION_EVENTS_ROUTE = "tak/session_events";

const SessionContext = createContext<SessionContextType | null>(null);

interface SessionProviderProps {
  children: ReactNode;
  keepaliveIntervalMs?: number;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
  keepaliveIntervalMs = 2000,
}) => {
  const { session, isConnected } = useZenoh();
  const [state, dispatch] = useReducer(sessionReducer, {
    sessions: {},
    lastUpdate: Date.now(),
  });
  const { profile } = useProfile();
  const sequenceRef = useRef(1);
  const subscribersRef = useRef<Record<string, any>>({});

  const getNextSequence = useCallback(() => sequenceRef.current++, []);

  const takId = useMemo(() => {
    if (!profile || !profile.takId) {
      console.warn(
        "No TAK ID found in profile, using default 'default-tak-id'"
      );
      return "default-tak-id";
    }
    return profile.takId;
  }, [profile]);

  const robotSessions = useMemo(
    () =>
      Object.values(state.sessions).sort((a, b) =>
        a.robotId?.localeCompare(b.robotId)
      ),
    [state.sessions]
  );

  const sessionsByStatus = useMemo(() => {
    const groups: Record<SessionStatus, SessionInfo[]> = {
      [SessionStatus.NONE]: [],
      [SessionStatus.REQUESTING]: [],
      [SessionStatus.ACTIVE]: [],
      [SessionStatus.FAILED]: [],
      [SessionStatus.REJECTED]: [],
      [SessionStatus.TERMINATED]: [],
      [SessionStatus.EXPIRED]: [],
    };
    robotSessions.forEach((session) => groups[session.status].push(session));
    return groups;
  }, [robotSessions]);

  const activeRobotIds = useMemo(
    () => sessionsByStatus[SessionStatus.ACTIVE].map((s) => s.robotId),
    [sessionsByStatus]
  );

  const hasActiveSession = useCallback(
    (robotId: string) =>
      state.sessions[robotId]?.status === SessionStatus.ACTIVE,
    [state.sessions]
  );

  const getSessionInfo = useCallback(
    (robotId: string) => state.sessions[robotId],
    [state.sessions]
  );

  const handleSessionEvent = useCallback(
    (event: SessionEvent) => {
      const robotId = event.robotId;
      if (!robotId || event.takId !== takId) return;

      switch (event.eventType) {
        case SessionEventType.SESSION_EVENT_TYPE_SESSION_STARTED:
          dispatch({
            type: "SESSION_STARTED",
            robotId,
            takId,
            token: event.sessionToken ?? "",
          });
          break;
        case SessionEventType.SESSION_EVENT_TYPE_REQUEST_REJECTED:
          dispatch({ type: "SESSION_REJECTED", robotId, takId });
          break;
        case SessionEventType.SESSION_EVENT_TYPE_SESSION_TERMINATED:
          dispatch({ type: "SESSION_TERMINATED", robotId });
          break;
      }
    },
    [takId]
  );

  const handleSessionEventSample = useCallback(
    (sample: any) => {
      try {
        const buffer = new Uint8Array(Object.values(sample._payload._buffer));
        const event = SessionEvent.decode(buffer);
        handleSessionEvent(event);
      } catch (err) {
        console.error("Failed to decode session event", err);
      }
    },
    [handleSessionEvent]
  );

  useEffect(() => {
    if (
      !isConnected ||
      !session ||
      subscribersRef.current[SESSION_EVENTS_ROUTE]
    )
      return;

    console.log("[SessionProvider] Subscribing to SESSION_EVENTS_ROUTE");

    const keyExpr = new KeyExpr(SESSION_EVENTS_ROUTE);

    const subscriber = session.declare_subscriber(keyExpr, {
      handler: async (sample) => handleSessionEventSample(sample),
    });

    subscribersRef.current[SESSION_EVENTS_ROUTE] = subscriber;

    return () => {
      const sub = subscribersRef.current[SESSION_EVENTS_ROUTE];
      if (sub) {
        sub.close();
        delete subscribersRef.current[SESSION_EVENTS_ROUTE];
        console.log("[SessionProvider] Unsubscribed from SESSION_EVENTS_ROUTE");
      }
    };
  }, [isConnected, session, handleSessionEventSample]);

  useEffect(() => {
    if (!isConnected || !session) return;
    const interval = setInterval(() => {
      Object.values(state.sessions).forEach(({ robotId, token, status }) => {
        if (status !== SessionStatus.ACTIVE || !token) return;
        const sequence = getNextSequence();
        const req = SessionRequest.fromPartial({
          requestType: SessionRequestType.SESSION_REQUEST_TYPE_KEEP,
          takId,
          robotId,
          sessionToken: token,
          sequenceNumber: sequence,
        });
        const encoded = SessionRequest.encode(req).finish();
        session.put(new KeyExpr(SESSION_REQUEST_ROUTE(robotId)), encoded);
        dispatch({ type: "KEEPALIVE_SENT", robotId, sequenceNumber: sequence });
      });
    }, keepaliveIntervalMs);
    return () => clearInterval(interval);
  }, [
    isConnected,
    session,
    state.sessions,
    takId,
    getNextSequence,
    keepaliveIntervalMs,
  ]);

  // Add effect to handle browser refresh/close
  useEffect(() => {
    if (!isConnected || !session) return;

    const handleBeforeUnload = () => {
      // Synchronously terminate all active sessions on browser refresh/close
      Object.values(state.sessions)
        .filter((session) => session.status === SessionStatus.ACTIVE)
        .forEach(({ robotId, token }) => {
          if (!token) return;

          try {
            const req = SessionRequest.fromPartial({
              requestType: SessionRequestType.SESSION_REQUEST_TYPE_TERMINATE,
              takId,
              robotId,
              sessionToken: token,
              sequenceNumber: getNextSequence(),
            });
            const encoded = SessionRequest.encode(req).finish();
            // Use a synchronous method since this is in beforeunload
            session.put(new KeyExpr(SESSION_REQUEST_ROUTE(robotId)), encoded);
            console.log(`Terminated session for ${robotId} during page unload`);
          } catch (err) {
            console.error(`Failed to terminate session for ${robotId}`, err);
          }
        });
    };

    // Add event listener for beforeunload
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isConnected, session, state.sessions, takId, getNextSequence]);

  useEffect(() => {
    console.log(activeRobotIds, "are active");
  }, [activeRobotIds]);

  const requestSession = useCallback(
    async (robotId: string, takId: string) => {
      if (!isConnected || !session) return false;
      const sequence = getNextSequence();
      dispatch({
        type: "SESSION_REQUEST_INITIATED",
        robotId,
        takId,
        sequenceNumber: sequence,
      });
      try {
        const req = SessionRequest.fromPartial({
          requestType: SessionRequestType.SESSION_REQUEST_TYPE_START,
          takId,
          robotId,
          sequenceNumber: sequence,
        });
        const encoded = SessionRequest.encode(req).finish();
        await session.put(new KeyExpr(SESSION_REQUEST_ROUTE(robotId)), encoded);
        return true;
      } catch (err: any) {
        dispatch({
          type: "SESSION_FAILED",
          robotId,
          takId,
          error: err.message || "Unknown error",
        });
        return false;
      }
    },
    [isConnected, session, getNextSequence]
  );

  const terminateSession = useCallback(
    async (robotId: string) => {
      if (!isConnected || !session) return false;
      const info = state.sessions[robotId];
      if (!info?.token) return false;
      const sequence = getNextSequence();
      try {
        const req = SessionRequest.fromPartial({
          requestType: SessionRequestType.SESSION_REQUEST_TYPE_TERMINATE,
          takId,
          robotId,
          sessionToken: info.token,
          sequenceNumber: sequence,
        });
        const encoded = SessionRequest.encode(req).finish();
        await session.put(new KeyExpr(SESSION_REQUEST_ROUTE(robotId)), encoded);
        dispatch({ type: "SESSION_TERMINATED", robotId });
        return true;
      } catch (err) {
        console.error("Failed to terminate session", err);
        return false;
      }
    },
    [isConnected, session, state.sessions, takId, getNextSequence]
  );

  const requestMultipleSessions = async (
    robotIds: string[]
  ): Promise<Record<string, boolean>> => {
    const results: Record<string, boolean> = {};
    await Promise.all(
      robotIds.map(async (robotId) => {
        const success = await requestSession(robotId, takId);
        results[robotId] = success;
      })
    );
    return results;
  };

  const terminateMultipleSessions = async (
    robotIds: string[]
  ): Promise<Record<string, boolean>> => {
    const results: Record<string, boolean> = {};
    await Promise.all(
      robotIds.map(async (robotId) => {
        const success = await terminateSession(robotId);
        results[robotId] = success;
      })
    );
    return results;
  };

  const contextValue = useMemo(
    () => ({
      sessions: state.sessions,
      robotSessions,
      activeRobotIds,
      requestSession,
      requestMultipleSessions,
      terminateSession,
      terminateMultipleSessions,
      hasActiveSession,
      getSessionInfo,
      sessionsByStatus,
      clientTakId: takId,
    }),
    [
      state.sessions,
      robotSessions,
      activeRobotIds,
      requestSession,
      requestMultipleSessions,
      terminateSession,
      terminateMultipleSessions,
      hasActiveSession,
      getSessionInfo,
      sessionsByStatus,
      takId,
    ]
  );

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;

export const useSessions = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context)
    throw new Error("useSessions must be used within a SessionProvider");
  return context;
};
