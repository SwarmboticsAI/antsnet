import { randomUUIDv7 } from "bun";
import type { Request, Response } from "express";
import { GeoPoint } from "@swarmbotics/protos/sbai_geographic_protos/geo_point.ts";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";
import type { BehaviorServiceClient } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/behavior_service.ts";

export const startDefendBehavior = async (req: Request, res: Response) => {
  try {
    const { participatingRobotIds, geoPoint, defendRadiusM } = req.body;
    const uuid = randomUUIDv7();

    if (!participatingRobotIds || !geoPoint || !defendRadiusM) {
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

    const geoPointProto = GeoPoint.create({
      latitude: geoPoint.latitude,
      longitude: geoPoint.longitude,
    });

    // Use Promise.all to handle all client requests
    const requestPromises = behaviorClients.map((behaviorClient) => {
      return new Promise((resolve, reject) => {
        behaviorClient.requestDefend(
          {
            behaviorRequestId: uuid,
            participatingRobotIds,
            geoPoint: geoPointProto,
            defendRadiusM: defendRadiusM,
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
        message: `Defend behavior started successfully, ${uuid}`,
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
      message: "An error occurred while starting the defend behavior",
      error: (error as Error).message,
    });
  }
};
