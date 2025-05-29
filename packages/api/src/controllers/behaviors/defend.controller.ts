import { randomUUID } from "crypto";
import type { Request, Response } from "express";
import { GeoPoint } from "@swarmbotics/protos/sbai_geographic_protos/geo_point.ts";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";

export const startDefendBehavior = async (req: Request, res: Response) => {
  try {
    const { participatingRobotIds, geoPoint, defendRadiusM } = req.body;
    const uuid = randomUUID();

    if (!participatingRobotIds || !geoPoint || !defendRadiusM) {
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

    const geoPointProto = GeoPoint.create({
      latitude: geoPoint.latitude,
      longitude: geoPoint.longitude,
    });

    // Use Promise.all to handle all client requests
    const requestPromises = behaviorClients.map(({ robotId, client }) => {
      return new Promise((resolve, reject) => {
        client.requestDefend(
          {
            behaviorRequestId: uuid,
            participatingRobotIds,
            geoPoint: geoPointProto,
            defendRadiusM: defendRadiusM,
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
        message: `Defend behavior started successfully with ID ${uuid}`,
        results: results,
      });
    } catch (error) {
      // Handle any errors from the promises
      const { robotId, error: defendError } = error as {
        robotId: string;
        error: Error;
      };
      res.status(500).json({
        success: false,
        message: `Error starting defend behavior for robot ID ${robotId}: ${defendError.message}`,
      });
    }
  } catch (error) {
    console.error("Error in startDefendBehavior:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};
