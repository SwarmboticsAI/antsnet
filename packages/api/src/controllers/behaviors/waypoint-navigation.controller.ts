import type { Request, Response } from "express";
import { GeoPoint } from "@swarmbotics/protos/sbai_geographic_protos/geo_point.ts";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";
import { randomUUIDv7 } from "bun";

export const startWaypointNavigationBehavior = async (
  req: Request,
  res: Response
) => {
  try {
    const { participatingRobotId, geoPoints, desiredFinalYawDeg } = req.body;
    const uuid = randomUUIDv7();

    if (!participatingRobotId || !geoPoints || !Array.isArray(geoPoints)) {
      res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
      return;
    }

    const behaviorClient =
      grpcServiceDirectory.getBehaviorServiceClient(participatingRobotId);

    const geoPointsProto: () => GeoPoint[] = () =>
      geoPoints.map((point: { latitude: number; longitude: number }) =>
        GeoPoint.create({
          latitude: point.latitude,
          longitude: point.longitude,
        })
      ) as GeoPoint[];

    behaviorClient.requestMultiWaypointNavigation(
      {
        behaviorRequestId: uuid,
        participatingRobotId: participatingRobotId,
        geoPoints: geoPointsProto(),
        desiredFinalYawDeg,
      },
      (error: any, response: any) => {
        if (error) {
          return error;
        }

        res.json({
          success: true,
          message: "Waypoint behavior started successfully",
          response,
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error starting waypoint navigation behavior: ${
        (error as Error).message
      }`,
    });
  }
};
