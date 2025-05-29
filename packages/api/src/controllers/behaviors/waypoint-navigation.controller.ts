import type { Request, Response } from "express";
import { GeoPoint } from "@swarmbotics/protos/sbai_geographic_protos/geo_point.ts";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";
import { randomUUID } from "crypto"; // Fix #1: Change from Bun import

export const startWaypointNavigationBehavior = async (
  req: Request,
  res: Response
) => {
  try {
    const { participatingRobotId, geoPoints, desiredFinalYawDeg } = req.body;
    const uuid = randomUUID();

    if (!participatingRobotId || !geoPoints || !Array.isArray(geoPoints)) {
      res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
      return;
    }

    // Fix #3: Add proper error handling for async client creation
    let behaviorClient;
    try {
      behaviorClient = await grpcServiceDirectory.getBehaviorServiceClient(
        participatingRobotId
      );
    } catch (error) {
      console.error(
        `Failed to get behavior client for robot ${participatingRobotId}:`,
        error
      );
      res.status(404).json({
        success: false,
        message: `Behavior client not found for robot ID ${participatingRobotId}: ${
          (error as Error).message
        }`,
      });
      return;
    }

    // Fix #4: Simplify geoPoints creation (no need for function wrapper)
    const geoPointsProto = geoPoints.map(
      (point: { latitude: number; longitude: number }) =>
        GeoPoint.create({
          latitude: point.latitude,
          longitude: point.longitude,
        })
    );

    // Fix #5: Wrap in Promise for better async handling
    const navigationPromise = new Promise((resolve, reject) => {
      behaviorClient.requestMultiWaypointNavigation(
        {
          behaviorRequestId: uuid,
          participatingRobotId: participatingRobotId,
          geoPoints: geoPointsProto,
          desiredFinalYawDeg,
        },
        (error: any, response: any) => {
          if (error) {
            reject(error); // Fix #6: Properly reject instead of "return error"
          } else {
            resolve(response);
          }
        }
      );
    });

    try {
      const response = await navigationPromise;

      res.json({
        success: true,
        message: `Waypoint navigation behavior started successfully with ID ${uuid}`,
        response,
      });
    } catch (grpcError) {
      console.error(`gRPC error for robot ${participatingRobotId}:`, grpcError);
      res.status(500).json({
        success: false,
        message: `Error starting waypoint navigation behavior: ${
          (grpcError as Error).message
        }`,
      });
    }
  } catch (error) {
    console.error("Error in startWaypointNavigationBehavior:", error);
    res.status(500).json({
      success: false,
      message: `Error starting waypoint navigation behavior: ${
        (error as Error).message
      }`,
    });
  }
};
