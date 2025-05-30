import type { Request, Response, NextFunction } from "express";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";
import { BehaviorControl } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/behavior_control_command.ts";

export const restartBehavior = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { behaviorRequestId, participatingRobotIds } = req.body;

    if (!behaviorRequestId || !participatingRobotIds) {
      res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
      return;
    }

    // FIX: Use the same pattern as rally - await each client creation with error handling
    const behaviorClients = [];
    for (const robotId of participatingRobotIds) {
      try {
        const behaviorClient =
          await grpcServiceDirectory.getBehaviorServiceClient(robotId);
        behaviorClients.push({ robotId, client: behaviorClient });
      } catch (error) {
        console.error(
          `Failed to get behavior client for robot ${robotId}:`,
          error
        );
        res.status(404).json({
          success: false,
          message: `Behavior client not found for robot ID ${robotId}: ${
            (error as Error).message
          }`,
        });
        return;
      }
    }

    // Use Promise.all to handle all restart requests
    const requestPromises = behaviorClients.map(({ robotId, client }) => {
      return new Promise((resolve, reject) => {
        client.restartBehavior(
          {
            header: {
              clientName: "web-app",
            },
            behaviorRequestId,
          },
          (error: any, response: any) => {
            if (error) {
              reject({ robotId, error });
            } else {
              resolve({ robotId, response });
            }
          }
        );
      });
    });

    try {
      // Wait for all requests to complete
      const results = await Promise.all(requestPromises);

      // Send a single response with all results
      res.json({
        success: true,
        message: `Behavior ${behaviorRequestId} restarted successfully`,
        results: results,
      });
    } catch (error) {
      // Handle any errors from the promises
      const { robotId, error: restartError } = error as {
        robotId: string;
        error: Error;
      };
      res.status(500).json({
        success: false,
        message: `Error restarting behavior for robot ID ${robotId}: ${restartError.message}`,
      });
    }
  } catch (error) {
    console.error("Error in restartBehavior:", error);
    next(error);
  }
};
