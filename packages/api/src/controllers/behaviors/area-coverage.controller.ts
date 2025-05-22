import type { Request, Response } from "express";
import { randomUUIDv7 } from "bun";
import { GeoPoint } from "@swarmbotics/protos/sbai_geographic_protos/geo_point.ts";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";
import type { BehaviorServiceClient } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/behavior_service.ts";

export const startAreaCoverageBehavior = async (
  req: Request,
  res: Response
) => {
  try {
    const { participatingRobotIds, coverageArea, laneWidthM } = req.body;
    const uuid = randomUUIDv7();

    if (!participatingRobotIds || !laneWidthM || !coverageArea) {
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

    // Create geo points array once
    const geoPointsProto = coverageArea.map(
      (point: { latitude: number; longitude: number }) =>
        GeoPoint.create({
          latitude: point.latitude,
          longitude: point.longitude,
        })
    ) as GeoPoint[];

    // Use Promise.all to handle all area coverage requests
    const requestPromises = behaviorClients.map((behaviorClient) => {
      return new Promise((resolve, reject) => {
        behaviorClient.requestAreaCoverage(
          {
            behaviorRequestId: uuid,
            participatingRobotIds,
            coverageArea: geoPointsProto,
            laneWidthM,
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
        message: `Area coverage behavior started successfully, ${uuid}`,
        responses: results,
      });
    } catch (error) {
      // Handle any errors from the promises
      res.status(500).json({
        success: false,
        message: "Error in behavior client request",
        error: (error as Error).message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error starting area coverage behavior: ${
        (error as Error).message
      }`,
    });
  }
};
