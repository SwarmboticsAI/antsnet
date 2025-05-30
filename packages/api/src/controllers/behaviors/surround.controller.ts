import type { Request, Response, NextFunction } from "express";
import { GeoPoint } from "@swarmbotics/protos/sbai_geographic_protos/geo_point.ts";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";
import { randomUUID } from "crypto";

export const startSurroundBehavior = async (req: Request, res: Response) => {
  try {
    const { participatingRobotIds, geoPoint, surroundRadiusM } = req.body;
    const uuid = randomUUID();

    if (!participatingRobotIds || !geoPoint || !surroundRadiusM) {
      res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
      return;
    }

    // Create the geoPoint once
    const geoPointProto = GeoPoint.create({
      latitude: geoPoint.latitude,
      longitude: geoPoint.longitude,
    });

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

    // Use Promise.all to handle all surround requests
    const requestPromises = behaviorClients.map(({ robotId, client }) => {
      return new Promise((resolve, reject) => {
        client.surroundPoint(
          {
            header: {
              clientName: "web-app",
            },
            behaviorRequestId: uuid,
            participatingRobotIds,
            geoPoint: geoPointProto,
            surroundRadiusM: surroundRadiusM,
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
        message: `Surround behavior started successfully with ID ${uuid}`,
        results: results,
      });
    } catch (error) {
      // Handle any errors from the promises
      const { robotId, error: surroundError } = error as {
        robotId: string;
        error: Error;
      };
      res.status(500).json({
        success: false,
        message: `Error starting surround behavior for robot ID ${robotId}: ${surroundError.message}`,
      });
    }
  } catch (error) {
    console.error("Error in startSurroundBehavior:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};
