import type { Request, Response, NextFunction } from "express";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";
import { BehaviorControl } from "@swarmbotics/protos/sbai_protos/behavior_control_command.ts";
import type { BehaviorServiceClient } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/behavior_service.ts";

export const resumeBehavior = async (
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

    const getBehaviorClients: () => BehaviorServiceClient[] = () =>
      participatingRobotIds.map((id: string) =>
        grpcServiceDirectory.getBehaviorServiceClient(id)
      );

    const behaviorClients = getBehaviorClients();

    // Check if any clients are missing
    const missingClients = behaviorClients.some((client) => !client);
    if (missingClients) {
      res.status(404).json({
        success: false,
        message: "One or more behavior clients not found",
      });
      return;
    }

    // Use Promise.all to handle all resume requests
    const requestPromises = behaviorClients.map((behaviorClient) => {
      return new Promise((resolve, reject) => {
        behaviorClient.issueBehaviorCommand(
          {
            command: BehaviorControl.BEHAVIOR_CONTROL_RESUME,
            behaviorRequestId,
          },
          (error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          }
        );
      });
    });

    // Wait for all requests to complete
    try {
      const results = await Promise.all(requestPromises);

      // Now send a single response with all results
      res.json({
        success: true,
        message: `Behavior ${behaviorRequestId} resumed successfully`,
        responses: results,
      });
    } catch (error) {
      // Handle any errors from the promises
      res.status(500).json({
        success: false,
        message: "Error in behavior client request",
        error: (error as Error).message,
      });
      console.error("Error in behavior client request:", error);
    }
  } catch (error) {
    next(error);
  }
};
