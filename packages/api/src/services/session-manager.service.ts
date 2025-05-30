import { WebSocket } from "ws";
import type { ClientWritableStream } from "@grpc/grpc-js";
import type { DirectControlCommandStreamRequest } from "@swarmbotics/protos/sbai_protos/direct_control.ts";

export interface TeleopSession {
  token: string;
  robotId: string;
  userId: string;
  stream: ClientWritableStream<DirectControlCommandStreamRequest>;
  startTime: Date;
  lastActivity: Date;
  wsConnections: Set<WebSocket>;
  [key: string]: any;
}

export interface SessionData {
  robotId: string;
  userId: string;
  stream: ClientWritableStream<DirectControlCommandStreamRequest>;
  [key: string]: any;
}

export interface Logger {
  info(msg: string, ...meta: any[]): void;
  warn(msg: string, ...meta: any[]): void;
  error(msg: string, ...meta: any[]): void;
  debug?(msg: string, ...meta: any[]): void;
}

class SessionManagerClass {
  private static instance: SessionManagerClass;
  private sessions = new Map<string, TeleopSession>();
  private logger: Logger;

  private constructor(logger: Logger = console) {
    this.logger = logger;
    this.logger.info("SessionManager initialized");
  }

  public static getInstance(logger?: Logger): SessionManagerClass {
    if (!SessionManagerClass.instance) {
      SessionManagerClass.instance = new SessionManagerClass(logger ?? console);
    }
    return SessionManagerClass.instance;
  }

  createSession(token: string, data: SessionData): TeleopSession {
    if (!token) throw new Error("Token required");

    if (this.sessions.has(token)) {
      this.logger.warn(`Session with token ${token} already exists`);
      return this.sessions.get(token)!;
    }

    const session: TeleopSession = {
      token,
      startTime: new Date(),
      lastActivity: new Date(),
      wsConnections: new Set(),
      ...data,
    };

    this.sessions.set(token, session);
    this.logger.info(`Session created for robot ${data.robotId}: ${token}`);
    return session;
  }

  getSession(token: string): TeleopSession | null {
    return this.sessions.get(token) ?? null;
  }

  hasSession(token: string): boolean {
    return this.sessions.has(token);
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  getAllSessions(): Map<string, TeleopSession> {
    return this.sessions;
  }

  getActiveTokens(): string[] {
    return Array.from(this.sessions.keys());
  }

  updateActivity(token: string): boolean {
    const session = this.sessions.get(token);
    if (!session) return false;
    session.lastActivity = new Date();
    return true;
  }

  addWebSocket(token: string, ws: WebSocket): boolean {
    const session = this.sessions.get(token);
    if (!session) return false;
    session.wsConnections.add(ws);
    this.updateActivity(token);
    this.logger.info(`WebSocket added to session ${token}`);
    return true;
  }

  removeWebSocket(token: string, ws: WebSocket): boolean {
    const session = this.sessions.get(token);
    if (!session) return false;
    const removed = session.wsConnections.delete(ws);
    if (removed) {
      this.logger.info(`WebSocket removed from session ${token}`);
    }
    return removed;
  }

  closeAllWebSockets(
    token: string,
    code = 1000,
    reason = "Session ended"
  ): number {
    const session = this.sessions.get(token);
    if (!session) return 0;

    let count = 0;
    for (const ws of session.wsConnections) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(code, reason);
          count++;
        }
      } catch (err) {
        this.logger.warn(`Error closing ws for ${token}`, err);
      }
    }
    session.wsConnections.clear();
    this.logger.info(`Closed ${count} WebSockets for ${token}`);
    return count;
  }

  endSession(token: string, closeStream = true): boolean {
    const session = this.sessions.get(token);
    if (!session) return false;

    this.closeAllWebSockets(token);

    if (closeStream && session.stream) {
      try {
        session.stream.end();
        this.logger.info(`gRPC stream ended for session ${token}`);
      } catch (err) {
        this.logger.error(`Failed to end gRPC stream for ${token}`, err);
      }
    }

    this.sessions.delete(token);
    this.logger.info(`Session ended: ${token}`);
    return true;
  }

  cleanupInactiveSessions(maxInactiveMs: number = 5 * 60_000): number {
    const now = Date.now();
    let count = 0;

    for (const [token, session] of this.sessions.entries()) {
      const age = now - session.lastActivity.getTime();
      if (age > maxInactiveMs) {
        this.logger.info(
          `Cleaning inactive session ${token} (age ${Math.floor(age / 1000)}s)`
        );
        this.endSession(token);
        count++;
      }
    }

    return count;
  }

  findSessions(predicate: (s: TeleopSession) => boolean): TeleopSession[] {
    return Array.from(this.sessions.values()).filter(predicate);
  }

  findSessionsByRobot(robotId: string): TeleopSession[] {
    return this.findSessions((s) => s.robotId === robotId);
  }

  findSessionsByUser(userId: string): TeleopSession[] {
    return this.findSessions((s) => s.userId === userId);
  }
}

export const SessionManager = SessionManagerClass.getInstance();
export { SessionManagerClass };
