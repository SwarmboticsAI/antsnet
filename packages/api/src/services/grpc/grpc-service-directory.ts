import * as grpc from "@grpc/grpc-js";

import { BoomServiceClient } from "@swarmbotics/protos/payload/sbai_api_protos/sbai_api_protos/boom_service.ts";
import { ChangeStateServiceClient } from "@swarmbotics/protos/payload/sbai_api_protos/sbai_api_protos/state_change_service.ts";
import { NavigateToPoseServiceClient } from "@swarmbotics/protos/payload/sbai_api_protos/sbai_api_protos/navigate_to_pose_service.ts";
import { DataServiceClient } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/data_service.ts";
import { BehaviorServiceClient } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/behavior_service.ts";
import { DirectControlServiceClient } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/direct_control_service.ts";
import { TeleopServiceClient } from "@swarmbotics/protos/payload/sbai_api_protos/sbai_api_protos/teleop_service.ts";
import { PayloadServiceClient } from "@swarmbotics/protos/ros2_interfaces/sbai_protos/sbai_protos/payload_service.ts";
import { robotRegistryService } from "@/services/robots/robot-registry";

export interface RobotInfo {
  id: string;
  address: string;
  lastSeen: Date;
}

export interface RobotServices {
  boom?: BoomServiceClient;
  teleop?: TeleopServiceClient;
  stateChange?: ChangeStateServiceClient;
  navigateToPose?: NavigateToPoseServiceClient;
  dataStream?: DataServiceClient;
  behaviors?: BehaviorServiceClient;
  directControl?: DirectControlServiceClient;
  payload?: PayloadServiceClient;
}

export interface RobotEntry {
  info: RobotInfo;
  services: RobotServices;
}

export class GrpcServiceDirectory {
  private robots = new Map<string, RobotEntry>();
  private clientCache = new Map<string, any>();

  public registerRobot(info: RobotInfo): boolean {
    try {
      let entry = this.robots.get(info.id);

      if (entry) {
        entry.info = {
          ...info,
          lastSeen: new Date(),
        };
      } else {
        entry = {
          info: {
            ...info,
            lastSeen: new Date(),
          },
          services: {},
        };

        this.robots.set(info.id, entry);
      }

      return true;
    } catch (error) {
      console.error(`Error registering robot ${info.id}:`, error);
      return false;
    }
  }

  private getServiceClient<T extends keyof RobotServices>(
    robotId: string,
    serviceType: T,
    createFn: (
      address: string,
      credentials: grpc.ChannelCredentials
    ) => RobotServices[T]
  ): NonNullable<RobotServices[T]> {
    const robot = robotRegistryService.getRobot(robotId);

    if (!robot) {
      throw new Error(`Robot ${robotId} not registered`);
    }

    // Create a cache key using robotId and serviceType
    const cacheKey = `${robotId}:${String(serviceType)}`;

    // Check if we already have a cached client
    if (this.clientCache.has(cacheKey)) {
      return this.clientCache.get(cacheKey);
    }

    // Create a new client
    console.log(
      `Creating new ${String(serviceType)} client for robot ${robotId}`
    );
    const client = createFn(
      `${robot.vpnIpAddress}:50051`,
      grpc.credentials.createInsecure()
    );

    // Store it in the cache
    this.clientCache.set(cacheKey, client);

    return client as NonNullable<RobotServices[T]>;
  }

  public getDataStreamClient(robotId: string): DataServiceClient {
    return this.getServiceClient(
      robotId,
      "dataStream",
      (address, credentials) => {
        return new DataServiceClient(address, credentials);
      }
    );
  }

  public closeDataStreamClient(robotId: string): void {
    const entry = this.robots.get(robotId);
    if (entry && entry.services.dataStream) {
      entry.services.dataStream.close();
      delete entry.services.dataStream;
    }

    // Also remove from cache
    const cacheKey = `${robotId}:dataStream`;
    if (this.clientCache.has(cacheKey)) {
      const client = this.clientCache.get(cacheKey);
      if (client && typeof client.close === "function") {
        client.close();
      }
      this.clientCache.delete(cacheKey);
    }
  }

  public getDirectControlClient(robotId: string): DirectControlServiceClient {
    return this.getServiceClient(
      robotId,
      "directControl",
      (address, credentials) => {
        return new DirectControlServiceClient(address, credentials);
      }
    );
  }

  public getNavigateToPoseClient(robotId: string): NavigateToPoseServiceClient {
    return this.getServiceClient(
      robotId,
      "navigateToPose",
      (address, credentials) => {
        return new NavigateToPoseServiceClient(address, credentials);
      }
    );
  }

  public getBehaviorServiceClient(robotId: string): BehaviorServiceClient {
    return this.getServiceClient(
      robotId,
      "behaviors",
      (address, credentials) => {
        return new BehaviorServiceClient(address, credentials);
      }
    );
  }

  public getPayloadClient(robotId: string): PayloadServiceClient {
    return this.getServiceClient(robotId, "payload", (address, credentials) => {
      return new PayloadServiceClient(address, credentials);
    });
  }

  public getBoomClient(robotId: string): BoomServiceClient {
    return this.getServiceClient(robotId, "boom", (address, credentials) => {
      return new BoomServiceClient(address, credentials);
    });
  }

  public getTeleopClient(robotId: string): TeleopServiceClient {
    return this.getServiceClient(robotId, "teleop", (address, credentials) => {
      return new TeleopServiceClient(address, credentials);
    });
  }

  public getStateChangeClient(robotId: string): ChangeStateServiceClient {
    return this.getServiceClient(
      robotId,
      "stateChange",
      (address, credentials) => {
        return new ChangeStateServiceClient(address, credentials);
      }
    );
  }

  public hasRobot(robotId: string): boolean {
    return this.robots.has(robotId);
  }

  public getAllRobots(): RobotInfo[] {
    return Array.from(this.robots.values()).map((entry) => entry.info);
  }

  public removeRobot(robotId: string): boolean {
    // Close and remove any cached clients for this robot
    for (const [key, client] of this.clientCache.entries()) {
      if (key.startsWith(`${robotId}:`)) {
        if (client && typeof client.close === "function") {
          try {
            client.close();
          } catch (err) {
            console.warn(`Error closing client for ${key}:`, err);
          }
        }
        this.clientCache.delete(key);
      }
    }

    return this.robots.delete(robotId);
  }

  public cleanupStaleConnections(maxAgeMs: number = 60000): void {
    const now = new Date();

    for (const [id, entry] of this.robots.entries()) {
      const lastSeenMs = now.getTime() - entry.info.lastSeen.getTime();

      if (lastSeenMs > maxAgeMs) {
        console.log(
          `Removing stale robot connection: ${id}, last seen ${lastSeenMs}ms ago`
        );

        // Close and remove any cached clients for this robot
        for (const [key, client] of this.clientCache.entries()) {
          if (key.startsWith(`${id}:`)) {
            if (client && typeof client.close === "function") {
              try {
                client.close();
              } catch (err) {
                console.warn(`Error closing client for ${key}:`, err);
              }
            }
            this.clientCache.delete(key);
          }
        }

        this.robots.delete(id);
      }
    }
  }
}

export const grpcServiceDirectory = new GrpcServiceDirectory();
