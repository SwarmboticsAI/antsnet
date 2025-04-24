export enum SessionStatus {
  NONE = "none",
  REQUESTING = "requesting",
  ACTIVE = "active",
  FAILED = "failed",
  REJECTED = "rejected",
  TERMINATED = "terminated",
  EXPIRED = "expired",
}

export interface SessionInfo {
  robotId: string;
  takId: string;
  token: string | null;
  status: SessionStatus;
  startTime: Date | null;
  lastKeepalive: Date | null;
  error?: string;
  sequenceNumber?: number;
}

export interface SessionState {
  sessions: Record<string, SessionInfo>;
  lastUpdate: number;
}

export interface SessionContextType {
  sessions: Record<string, SessionInfo>;
  robotSessions: SessionInfo[];
  activeRobotIds: string[];
  requestSession: (robotId: string, takId: string) => Promise<boolean>;
  terminateSession: (robotId: string) => Promise<boolean>;
  hasActiveSession: (robotId: string) => boolean;
  getSessionInfo: (robotId: string) => SessionInfo | undefined;
  sessionsByStatus: Record<SessionStatus, SessionInfo[]>;
  clientTakId: string;
}

type Action =
  | {
      type: "SESSION_REQUEST_INITIATED";
      robotId: string;
      takId: string;
      sequenceNumber: number;
    }
  | { type: "SESSION_STARTED"; robotId: string; takId: string; token: string }
  | { type: "SESSION_REJECTED"; robotId: string; takId: string; error?: string }
  | { type: "SESSION_TERMINATED"; robotId: string }
  | { type: "SESSION_FAILED"; robotId: string; takId: string; error: string }
  | { type: "KEEPALIVE_SENT"; robotId: string; sequenceNumber: number };

export function sessionReducer(
  state: SessionState,
  action: Action
): SessionState {
  const now = Date.now();
  switch (action.type) {
    case "SESSION_REQUEST_INITIATED":
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.robotId]: {
            robotId: action.robotId,
            takId: action.takId,
            token: null,
            status: SessionStatus.REQUESTING,
            startTime: null,
            lastKeepalive: null,
            sequenceNumber: action.sequenceNumber,
          },
        },
        lastUpdate: now,
      };
    case "SESSION_STARTED":
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.robotId]: {
            ...state.sessions[action.robotId],
            token: action.token,
            status: SessionStatus.ACTIVE,
            startTime: new Date(),
            lastKeepalive: new Date(),
          },
        },
        lastUpdate: now,
      };
    case "SESSION_REJECTED":
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.robotId]: {
            ...state.sessions[action.robotId],
            token: null,
            status: SessionStatus.REJECTED,
            error: action.error || "Session rejected",
          },
        },
        lastUpdate: now,
      };
    case "SESSION_TERMINATED":
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.robotId]: {
            ...state.sessions[action.robotId],
            status: SessionStatus.TERMINATED,
            token: null,
          },
        },
        lastUpdate: now,
      };
    case "SESSION_FAILED":
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.robotId]: {
            robotId: action.robotId,
            takId: action.takId,
            token: null,
            status: SessionStatus.FAILED,
            startTime: null,
            lastKeepalive: null,
            error: action.error,
          },
        },
        lastUpdate: now,
      };
    case "KEEPALIVE_SENT":
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.robotId]: {
            ...state.sessions[action.robotId],
            lastKeepalive: new Date(),
            sequenceNumber: action.sequenceNumber,
          },
        },
      };
    default:
      return state;
  }
}
