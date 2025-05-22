import { randomUUIDv7 } from "bun";
import type { Request, Response, NextFunction } from "express";
import { GeoPoint } from "@swarmbotics/protos/sbai_geographic_protos/geo_point.ts";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";

export const startRallyBehavior = async (req: Request, res: Response) => {
  try {
    const { participatingRobotIds, geoPoint, rallyPointToleranceM } = req.body;
    const uuid = randomUUIDv7();

    if (!participatingRobotIds || !geoPoint || !rallyPointToleranceM) {
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

    // Collect all behavior clients first
    const behaviorClients = [];
    for (const robotId of participatingRobotIds) {
      const behaviorClient =
        grpcServiceDirectory.getBehaviorServiceClient(robotId);

      if (!behaviorClient) {
        res.status(404).json({
          success: false,
          message: `Behavior client not found for robot ID ${robotId}`,
        });
        return;
      }

      behaviorClients.push({ robotId, client: behaviorClient });
    }

    // Use Promise.all to handle all rally requests
    const requestPromises = behaviorClients.map(({ robotId, client }) => {
      return new Promise((resolve, reject) => {
        client.requestRally(
          {
            behaviorRequestId: uuid,
            participatingRobotIds,
            geoPoint: geoPointProto,
            rallyPointToleranceM,
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
        message: `Rally behavior started successfully with ID ${uuid}`,
        results: results,
      });
    } catch (error) {
      // Handle any errors from the promises
      const { robotId, error: rallyError } = error as {
        robotId: string;
        error: Error;
      };
      res.status(500).json({
        success: false,
        message: `Error starting rally behavior for robot ID ${robotId}: ${rallyError.message}`,
      });
    }
  } catch (error) {
    console.error("Error in startRallyBehavior:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};
