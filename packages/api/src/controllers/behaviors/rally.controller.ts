import { randomUUID } from "crypto";
import type { Request, Response } from "express";
import { GeoPoint } from "@swarmbotics/protos/sbai_geographic_protos/geo_point.ts";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";

export const startRallyBehavior = async (req: Request, res: Response) => {
  try {
    const { participatingRobotIds, geoPoint, rallyPointToleranceM } = req.body;
    const uuid = randomUUID();

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

    // Fix #3: Add proper error handling for async client creation
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

    // Use Promise.all to handle all rally requests
    const requestPromises = behaviorClients.map(({ robotId, client }) => {
      return new Promise((resolve, reject) => {
        client.rallyTo(
          {
            header: {
              clientName: "web-app",
            },
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
