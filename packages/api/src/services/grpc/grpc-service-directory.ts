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
      // Validate the robot info
      if (!info.id || !info.address) {
        console.error(`Invalid robot info provided:`, info);
        return false;
      }

      // Validate IP address format (basic check)
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(info.address)) {
        console.error(
          `Invalid IP address for robot ${info.id}: ${info.address}`
        );
        return false;
      }

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

      console.log(`✅ Robot registered: ${info.id} (${info.address})`);
      return true;
    } catch (error) {
      console.error(`Error registering robot ${info.id}:`, error);
      return false;
    }
  }

  private isValidGrpcAddress(address: string): boolean {
    // More comprehensive validation
    if (!address || typeof address !== "string") {
      console.error(`Address is not a string:`, address);
      return false;
    }

    if (address.includes("undefined") || address.includes("null")) {
      console.error(`Address contains undefined/null:`, address);
      return false;
    }

    // Check for numeric-only addresses (like just "2954")
    if (/^\d+$/.test(address)) {
      console.error(`Address is just a number:`, address);
      return false;
    }

    const regex = /^[\d\.]+(:\d+)?$/;
    const isValid = regex.test(address);

    if (!isValid) {
      console.error(`Address failed regex validation:`, address);
    }

    return isValid;
  }

  private async createClientWithRetry<T extends keyof RobotServices>(
    robotId: string,
    serviceType: T,
    createFn: (
      address: string,
      credentials: grpc.ChannelCredentials
    ) => RobotServices[T],
    ipAddress: string,
    maxRetries: number = 3
  ): Promise<NonNullable<RobotServices[T]>> {
    const cacheKey = `${robotId}:${String(serviceType)}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `Creating ${String(
            serviceType
          )} client for robot ${robotId} (attempt ${attempt + 1})`
        );

        const address = `${ipAddress}:50051`;

        // Validate address format before creating client
        if (!this.isValidGrpcAddress(address)) {
          throw new Error(`Invalid gRPC address: ${address}`);
        }

        const client = createFn(address, grpc.credentials.createInsecure());

        // Store successful client
        this.clientCache.set(cacheKey, client);

        console.log(
          `✅ Successfully created ${String(
            serviceType
          )} client for robot ${robotId}`
        );
        return client as NonNullable<RobotServices[T]>;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `Attempt ${attempt + 1} failed for ${robotId}:${String(
            serviceType
          )}:`,
          error
        );

        if (attempt < maxRetries) {
          const delay = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s delays
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(
      `Failed to create ${String(
        serviceType
      )} client for robot ${robotId} after ${
        maxRetries + 1
      } attempts. Last error: ${lastError?.message}`
    );
  }

  private async getServiceClient<T extends keyof RobotServices>(
    robotId: string,
    serviceType: T,
    createFn: (
      address: string,
      credentials: grpc.ChannelCredentials
    ) => RobotServices[T]
  ): Promise<NonNullable<RobotServices[T]>> {
    const robot = robotRegistryService.getRobot(robotId);

    if (!robot) {
      throw new Error(`Robot ${robotId} not registered`);
    }

    console.log(`Robot data for ${robotId}:`, robot); // Debug log

    if (!robot.vpnIpAddress) {
      throw new Error(`Robot ${robotId} has no VPN IP address`);
    }

    // Additional validation
    if (typeof robot.vpnIpAddress !== "string") {
      throw new Error(
        `Robot ${robotId} VPN IP address is not a string: ${typeof robot.vpnIpAddress} - ${
          robot.vpnIpAddress
        }`
      );
    }

    const cacheKey = `${robotId}:${String(serviceType)}`;

    // Check if we already have a cached client
    if (this.clientCache.has(cacheKey)) {
      return this.clientCache.get(cacheKey);
    }

    // Create new client with retry logic
    return await this.createClientWithRetry(
      robotId,
      serviceType,
      createFn,
      robot.vpnIpAddress
    );
  }

  public async getDataStreamClient(
    robotId: string
  ): Promise<DataServiceClient> {
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

  public async getDirectControlClient(
    robotId: string
  ): Promise<DirectControlServiceClient> {
    return this.getServiceClient(
      robotId,
      "directControl",
      (address, credentials) => {
        return new DirectControlServiceClient(address, credentials);
      }
    );
  }

  public async getNavigateToPoseClient(
    robotId: string
  ): Promise<NavigateToPoseServiceClient> {
    return this.getServiceClient(
      robotId,
      "navigateToPose",
      (address, credentials) => {
        return new NavigateToPoseServiceClient(address, credentials);
      }
    );
  }

  public async getBehaviorServiceClient(
    robotId: string
  ): Promise<BehaviorServiceClient> {
    return this.getServiceClient(
      robotId,
      "behaviors",
      (address, credentials) => {
        return new BehaviorServiceClient(address, credentials);
      }
    );
  }

  public async getPayloadClient(
    robotId: string
  ): Promise<PayloadServiceClient> {
    return this.getServiceClient(robotId, "payload", (address, credentials) => {
      return new PayloadServiceClient(address, credentials);
    });
  }

  public async getBoomClient(robotId: string): Promise<BoomServiceClient> {
    return this.getServiceClient(robotId, "boom", (address, credentials) => {
      return new BoomServiceClient(address, credentials);
    });
  }

  public async getTeleopClient(robotId: string): Promise<TeleopServiceClient> {
    return this.getServiceClient(robotId, "teleop", (address, credentials) => {
      return new TeleopServiceClient(address, credentials);
    });
  }

  public async getStateChangeClient(
    robotId: string
  ): Promise<ChangeStateServiceClient> {
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
