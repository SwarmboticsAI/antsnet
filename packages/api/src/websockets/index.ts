import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { SessionManager } from "@/services/session-manager.service";
import { Joy } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/joy.ts";
import type { DirectControlCommandStreamRequest } from "@swarmbotics/protos/sbai_protos/direct_control.ts";
import { emitter } from "@/routes/robot/register";

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface TeleopCommandMessage extends WebSocketMessage {
  axes: number[];
  robotId: string;
}

// Maps robotId -> session token (for quicker lookups)
const activeRobotSessions = new Map<string, string>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  // WebSocket upgrade
  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
    }
  });

  // Now the emitter is sending already decoded data from protobuf
  // We just need to pass it through to the clients
  emitter.on("networkUpdate", (event) => {
    console.log("Network table update:", event.robotId);
    broadcastToClients(wss, {
      type: "network-table-update",
      payload: event,
    });
  });

  emitter.on("systemUpdate", (event) => {
    console.log("System table update:", event.robotId);
    broadcastToClients(wss, {
      type: "system-table-update",
      payload: event,
    });
  });

  emitter.on("taskUpdate", (event) => {
    console.log("Task table update:", event.robotId);
    broadcastToClients(wss, {
      type: "task-table-update",
      payload: event,
    });
  });

  emitter.on("localizationUpdate", (event) => {
    console.log("Localization update:", event.robotId);
    broadcastToClients(wss, {
      type: "localization-table-update",
      payload: event,
    });
  });

  // New client connection
  wss.on("connection", (ws: WebSocket) => {
    console.log("🔌 WebSocket client connected");

    ws.on("message", (messageBuffer: WebSocket.RawData) => {
      try {
        const message = JSON.parse(
          messageBuffer.toString()
        ) as WebSocketMessage;

        switch (message.type) {
          case "teleop":
            handleTeleopCommand(ws, message as TeleopCommandMessage);
            break;

          case "echo":
            ws.send(
              JSON.stringify({
                type: "echo-response",
                message: message.message || "Echo",
              })
            );
            break;

          default:
            ws.send(`Echo: ${messageBuffer.toString()}`);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
        sendError(ws, "Invalid message format");
      }
    });

    ws.on("close", () => {
      console.log("❌ WebSocket client disconnected");
      cleanupWebSocketFromSessions(ws);
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  });

  // Periodic session cleanup
  setInterval(() => {
    const cleaned = SessionManager.cleanupInactiveSessions(5 * 60_000);
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} inactive sessions`);
    }

    // Clean up stale robotId → token mappings
    for (const [robotId, token] of activeRobotSessions.entries()) {
      if (!SessionManager.hasSession(token)) {
        activeRobotSessions.delete(robotId);
      }
    }
  }, 60 * 1000);

  return wss;
}

// Handles a teleop message from a WebSocket client
function handleTeleopCommand(ws: WebSocket, data: TeleopCommandMessage) {
  const { robotId, axes } = data;
  if (!robotId) return sendError(ws, "robotId is required");

  let token = activeRobotSessions.get(robotId);
  let session = token ? SessionManager.getSession(token) : null;

  if (!session) {
    const sessions = SessionManager.findSessionsByRobot(robotId);
    if (sessions.length === 0) {
      console.warn(`No active teleop session for robot ${robotId}`);
      return sendError(ws, "No active teleop session for this robot");
    }

    session = sessions[0] ?? null;
    if (!session) {
      console.warn(`No active teleop session for robot ${robotId}`);
      return sendError(ws, "No active teleop session for this robot");
    }
    token = session.token;
    activeRobotSessions.set(robotId, token);
  }

  SessionManager.addWebSocket(token ?? "", ws);
  processCommand(ws, token ?? "", axes);
}

// Writes a command to the robot's stream
function processCommand(ws: WebSocket, token: string, axes: number[]) {
  const session = SessionManager.getSession(token);
  if (!session) return sendError(ws, "Session not found");

  SessionManager.updateActivity(token);

  const validAxes =
    Array.isArray(axes) && axes.length >= 2 ? axes.slice(0, 2) : [0, 0];
  const joyCommand: DirectControlCommandStreamRequest = {
    header: {
      clientName: "web-app",
    },
    directControlToken: token,
    joystick: Joy.create({ axes: validAxes }),
  };

  try {
    const success = session.stream.write(joyCommand);
    if (!success) {
      console.warn(`⚠️ Buffer full for session ${token}`);
    }

    ws.send(JSON.stringify({ type: "ack", robotId: session.robotId }));
  } catch (err) {
    console.error(`Error writing to stream for session ${token}:`, err);
    sendError(ws, "Failed to send command to robot");
  }
}

function broadcastToClients(wss: WebSocketServer, message: object) {
  const data = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

function sendError(ws: WebSocket, message: string) {
  ws.send(JSON.stringify({ type: "error", message }));
}

// Removes a WebSocket from any sessions it was attached to
function cleanupWebSocketFromSessions(ws: WebSocket) {
  for (const [token, session] of SessionManager.getAllSessions()) {
    if (session.wsConnections.has(ws)) {
      SessionManager.removeWebSocket(token, ws);
      console.log(`Cleaned up ws from session ${token}`);
    }
  }
}

// Manual helpers for external session registration
export function registerSession(robotId: string, token: string): void {
  activeRobotSessions.set(robotId, token);
  console.log(`✅ Registered session: ${robotId} → ${token}`);
}

export function unregisterSession(robotId: string): void {
  activeRobotSessions.delete(robotId);
  console.log(`❌ Unregistered session for robot ${robotId}`);
}
