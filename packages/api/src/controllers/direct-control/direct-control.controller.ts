import type { Request, Response } from "express";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";
import { SessionManager } from "@/services/session-manager.service";

export interface DirectControlStartRequest {
  controllingDeviceId: string;
  controllingDeviceIp: string;
}

export const startDirectControlRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const { robotId, controllingDeviceId, controllingDeviceIp } = req.body;

    if (!robotId || !controllingDeviceId || !controllingDeviceIp) {
      res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
      return;
    }

    try {
      if (SessionManager.findSessionsByRobot(robotId).length > 0) {
        console.warn(
          `A session for robot ${robotId} already exists. Overwriting the stream.`
        );
        // If a session already exists, we can end the previous stream
        const existingSession = SessionManager.findSessionsByRobot(robotId)[0];
        if (existingSession?.stream) {
          existingSession.stream.end();
        }
      }
    } catch (streamErr) {
      console.error(
        `Error ending previous stream for robot ${robotId}:`,
        streamErr
      );
      return res.status(500).json({
        success: false,
        message: "Failed to end previous stream",
        error: (streamErr as Error).message,
      });
    }

    const directControlClient =
      grpcServiceDirectory.getDirectControlClient(robotId);

    directControlClient.startDirectControlSession(
      {
        controllingDeviceId: controllingDeviceId,
        controllingDeviceIp: controllingDeviceIp,
      },
      (error: any, response: any) => {
        if (error) {
          res.status(500).json({
            success: false,
            message: "Failed to start direct control session",
            error: error.message,
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: "Direct control session started successfully",
          data: response,
        });

        const token = response.directControlToken;

        // Create a client-side stream for teleop commands
        const teleopStream = directControlClient.commandDirectControl(
          (streamErr: any, streamResponse: any) => {
            if (streamErr) {
              console.error(`Stream error for session ${token}:`, streamErr);

              if (SessionManager.hasSession(token ?? "")) {
                SessionManager.endSession(token ?? "", false); // Don't try to close stream again
              }
            }
          }
        );

        // Handle stream errors
        teleopStream.on("error", (streamErr: any) => {
          console.error(`Stream error for session ${token}:`, streamErr);
          SessionManager.endSession(token ?? "", false); // Don't try to close stream again
        });

        teleopStream.on("end", () => {
          console.log(`Stream ended for session ${token}`);
          SessionManager.endSession(token ?? "", false); // Don't try to close stream again
        });

        // Store the session info using our manager
        SessionManager.createSession(token ?? "", {
          robotId,
          userId: controllingDeviceId, // Using controlling device ID as userId
          stream: teleopStream,
          controllingDeviceIp, // Store additional data
        });
      }
    );
  } catch (error) {
    console.error("Error starting direct control session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const stopDirectControlRequest = async (req: Request, res: Response) => {
  try {
    const { robotId, controllingDeviceId } = req.body;

    if (!robotId) {
      res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
      return;
    }

    const directControlClient =
      grpcServiceDirectory.getDirectControlClient(robotId);

    const session = SessionManager.findSessionsByRobot(robotId);

    console.log(session);

    directControlClient.stopDirectControlSession(
      {
        directControlToken: session[0]?.token ?? "",
        controllingDeviceId: controllingDeviceId, // Use the controlling device ID stored in the session
      },
      (error: any, response: any) => {
        if (error) {
          res.status(500).json({
            success: false,
            message: "Failed to stop direct control session",
            error: error.message,
          });
          return;
        }

        console.log(`Direct control session stopped: ${session[0]?.token}`);

        // Now try to end the stream
        try {
          if (session[0]?.token) {
            session[0].stream.end();
          }

          // Close all WebSocket connections
          SessionManager.closeAllWebSockets(
            session[0]?.token ?? "",
            1000,
            "Session ended by user"
          );

          // End the session in our manager but don't close the stream yet
          SessionManager.endSession(session[0]?.token ?? "", false);
        } catch (streamErr) {
          console.error(
            `Error ending stream for session ${session[0]?.token}:`,
            streamErr
          );
          // Non-fatal error, continue
        }

        res.status(200).json({
          success: true,
          message: "Direct control session stopped successfully",
          data: response,
        });
      }
    );
  } catch (error) {
    console.error("Error stopping direct control session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getSessionStatus = (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!SessionManager.hasSession(token ?? "")) {
      res.status(404).json({
        success: false,
        message: "Session not found",
      });
      return;
    }

    const session = SessionManager.getSession(token ?? "");

    res.status(200).json({
      success: true,
      data: {
        status: "active",
        token: session?.token,
        robotId: session?.robotId,
        userId: session?.userId,
        startTime: session?.startTime,
        lastActivity: session?.lastActivity,
        connections: session?.wsConnections.size,
        controllingDeviceIp: session?.controllingDeviceIp,
      },
    });
  } catch (error) {
    console.error("Error getting session status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const listActiveSessions = (req: Request, res: Response) => {
  try {
    const sessions = SessionManager.getAllSessions();
    const sessionList = [];

    for (const [_token, session] of sessions.entries()) {
      sessionList.push({
        token: session.token,
        robotId: session.robotId,
        userId: session.userId,
        startTime: session.startTime,
        lastActivity: session.lastActivity,
        connections: session.wsConnections.size,
        controllingDeviceIp: session.controllingDeviceIp,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        count: sessionList.length,
        sessions: sessionList,
      },
    });
  } catch (error) {
    console.error("Error listing active sessions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
