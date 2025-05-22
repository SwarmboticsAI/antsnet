import express from "express";
import http from "http";
import cors from "cors";
import router from "@/routes";
import { setupWebSocket } from "@/websockets";
import { SessionManager } from "@/services/session-manager.service";

// Create Express app and server
const app = express();
app.use(express.json());
app.use(cors());
app.use(router);

const server = http.createServer(app);

// Setup WebSocket handlers
const wss = setupWebSocket(server);

// Setup graceful shutdown
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

function gracefulShutdown() {
  console.log("Shutting down server...");

  // Close all active direct control sessions
  try {
    const sessions = SessionManager.getAllSessions();
    if (sessions.size > 0) {
      console.log(`Closing ${sessions.size} active direct control sessions`);
      for (const [token, _] of sessions) {
        SessionManager.endSession(token);
      }
    }
  } catch (error) {
    console.error("Error closing sessions:", error);
  }

  // Close WebSocket server
  wss.close(() => {
    console.log("WebSocket server closed");
  });

  // Close the server
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });

  // Force close after timeout
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 5000);
}

// Start the server
const port = 4000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`HTTP API: http://localhost:${port}/api`);
  console.log(`WebSocket: ws://localhost:${port}/ws`);
});
