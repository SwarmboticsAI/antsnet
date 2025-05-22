import type { Empty } from "@swarmbotics/protos/google/protobuf/empty.ts";
import type { ChangeStateServiceClient } from "@swarmbotics/protos/payload/sbai_api_protos/sbai_api_protos/state_change_service.ts";
import type { TeleopServiceClient } from "@swarmbotics/protos/payload/sbai_api_protos/sbai_api_protos/teleop_service.ts";
import { CortexState } from "@swarmbotics/protos/ros2_interfaces/sbai_cortex_protos/sbai_cortex_protos/cortex_state_update.ts";
import type { Joy } from "@swarmbotics/protos/ros2_interfaces/sbai_sensor_protos/sbai_sensor_protos/joy.ts";
import { CortexStateUpdate } from "@swarmbotics/protos/sbai_cortex_protos/cortex_state_update.ts";

export class TeleopStream {
  private teleopClient: TeleopServiceClient;
  private stateChangeClient: ChangeStateServiceClient;
  private stream: any = null;
  private isActive: boolean = false;
  private isInTeleopMode: boolean = false;
  private robotId: string;
  private pendingCommands: Joy[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectInterval: number = 2000;

  constructor(
    robotId: string,
    teleopClient: TeleopServiceClient,
    stateChangeClient: ChangeStateServiceClient
  ) {
    this.robotId = robotId;
    this.teleopClient = teleopClient;
    this.stateChangeClient = stateChangeClient;
  }

  public async setTeleopMode(): Promise<boolean> {
    if (this.isInTeleopMode) {
      return true;
    }

    return new Promise<boolean>((resolve, reject) => {
      const stateUpdate = CortexStateUpdate.create({
        newState: CortexState.CORTEX_STATE_TELEOP,
      });

      this.stateChangeClient.changeState(stateUpdate, (error, response) => {
        if (error) {
          console.error(
            `Failed to set teleop mode for robot ${this.robotId}:`,
            error
          );
          reject(error);
          return;
        }

        console.log(`Robot ${this.robotId} is now in teleop mode`);
        this.isInTeleopMode = true;
        resolve(true);
      });
    });
  }

  public async start(): Promise<boolean> {
    if (this.isActive) {
      console.log(`Teleop stream for robot ${this.robotId} is already active`);
      return true;
    }

    try {
      const teleopModeSet = await this.setTeleopMode();
      if (!teleopModeSet) {
        console.error(`Failed to set robot ${this.robotId} to teleop mode`);
        return false;
      }

      console.log(`Starting teleop stream for robot ${this.robotId}`);

      this.stream = this.teleopClient.teleop(
        (error: Error | null, response: Empty) => {
          if (error) {
            console.error(
              `Teleop stream for ${this.robotId} ended with error:`,
              error
            );
            this.handleStreamError(error);
          } else {
            console.log(
              `Teleop stream for ${this.robotId} completed successfully`
            );
            this.isActive = false;
          }
        }
      );

      this.stream.on("error", (error: Error) => {
        console.error(`Error in teleop stream for ${this.robotId}:`, error);
        this.handleStreamError(error);
      });

      this.stream.on("end", () => {
        console.log(`Teleop stream for ${this.robotId} ended`);
        this.isActive = false;
      });

      this.isActive = true;

      if (this.pendingCommands.length > 0) {
        console.log(`Sending ${this.pendingCommands.length} pending commands`);
        this.pendingCommands.forEach((cmd) => this.sendCommand(cmd));
        this.pendingCommands = [];
      }

      return true;
    } catch (error) {
      console.error(
        `Failed to start teleop stream for ${this.robotId}:`,
        error
      );
      this.handleStreamError(error);
      return false;
    }
  }

  public sendCommand(joy: Joy): boolean {
    if (!this.isActive || !this.stream) {
      console.log(`Stream not active, queueing command for ${this.robotId}`);
      this.pendingCommands.push(joy);

      if (!this.isActive) {
        this.start();
      }

      return false;
    }

    try {
      return this.stream.write(joy);
    } catch (error) {
      console.error(`Error sending command to ${this.robotId}:`, error);
      this.pendingCommands.push(joy);
      this.handleStreamError(error);
      return false;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isActive || !this.stream) {
      return;
    }

    console.log(`Stopping teleop stream for ${this.robotId}`);

    try {
      this.stream.end();
    } catch (error) {
      console.error(`Error stopping teleop stream for ${this.robotId}:`, error);
    }

    this.isActive = false;
    this.stream = null;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    try {
      const stateUpdate = CortexStateUpdate.create({
        newState: CortexState.CORTEX_STATE_AUTO,
      });

      await new Promise<void>((resolve, reject) => {
        this.stateChangeClient.changeState(stateUpdate, (error, response) => {
          if (error) {
            console.error(
              `Failed to set idle mode for robot ${this.robotId}:`,
              error
            );
          }

          this.isInTeleopMode = false;
          resolve();
        });
      });
    } catch (error) {
      console.error(
        `Error setting robot ${this.robotId} back to idle mode:`,
        error
      );
    }
  }

  private handleStreamError(error: any): void {
    this.isActive = false;
    this.stream = null;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect teleop stream for ${this.robotId}`);
      this.start();
    }, this.reconnectInterval);
  }

  public isStreamActive(): boolean {
    return this.isActive;
  }
}

export class TeleopManager {
  private streams: Map<string, TeleopStream> = new Map();

  public getStream(
    robotId: string,
    teleopClient: TeleopServiceClient,
    stateChangeClient: ChangeStateServiceClient
  ): TeleopStream {
    let stream = this.streams.get(robotId);

    if (!stream) {
      stream = new TeleopStream(robotId, teleopClient, stateChangeClient);
      this.streams.set(robotId, stream);
    }

    return stream;
  }

  public async sendCommand(
    robotId: string,
    joy: Joy,
    teleopClient: TeleopServiceClient,
    stateChangeClient: ChangeStateServiceClient
  ): Promise<boolean> {
    const stream = this.getStream(robotId, teleopClient, stateChangeClient);

    if (!stream.isStreamActive()) {
      await stream.start();
    }

    return stream.sendCommand(joy);
  }

  public async stopStream(robotId: string): Promise<void> {
    const stream = this.streams.get(robotId);
    if (stream) {
      await stream.stop();
      this.streams.delete(robotId);
    }
  }

  public async stopAllStreams(): Promise<void> {
    const promises = Array.from(this.streams.entries()).map(
      async ([robotId, stream]) => {
        await stream.stop();
      }
    );

    await Promise.all(promises);
    this.streams.clear();
  }
}

export const teleopManager = new TeleopManager();
