interface RobotRecord {
  robotId: string;
  vpnIpAddress: string;
  // Add a status field if you want to track connection status
  status?: "connected" | "disconnected" | "streaming";
}

class RobotRegistryService {
  private registry = new Map<string, RobotRecord>();
  private streamInitTimers = new Map<string, NodeJS.Timeout>();
  // Add a map to store all interval IDs for each robot
  private robotIntervals = new Map<string, NodeJS.Timeout[]>();

  addRobot(robotId: string, vpnIpAddress: string): void {
    if (this.registry.has(robotId)) {
      console.warn(
        `[Registry] Robot ${robotId} already registered. Skipping re-add.`
      );
      return;
    }

    this.registry.set(robotId, {
      robotId,
      vpnIpAddress,
      status: "connected",
    });
  }

  getRobot(robotId: string): RobotRecord | undefined {
    return this.registry.get(robotId);
  }

  getAllRobots(): RobotRecord[] {
    return Array.from(this.registry.values());
  }

  /**
   * Store interval IDs associated with a robot for later cleanup
   */
  storeIntervals(robotId: string, intervals: NodeJS.Timeout[]): void {
    // If we already have intervals for this robot, merge them
    const existingIntervals = this.robotIntervals.get(robotId) || [];
    this.robotIntervals.set(robotId, [...existingIntervals, ...intervals]);

    // Update the robot status if it exists
    const robot = this.registry.get(robotId);
    if (robot) {
      robot.status = "streaming";
      this.registry.set(robotId, robot);
    }
  }

  /**
   * Get all interval IDs associated with a robot
   */
  getIntervals(robotId: string): NodeJS.Timeout[] {
    return this.robotIntervals.get(robotId) || [];
  }

  /**
   * Clear all intervals associated with a robot
   */
  clearIntervals(robotId: string): void {
    const intervals = this.robotIntervals.get(robotId);
    if (intervals && intervals.length > 0) {
      intervals.forEach((interval) => clearInterval(interval));
      this.robotIntervals.delete(robotId);
    }
  }

  removeRobot(robotId: string): boolean {
    try {
      // Clear any pending stream initialization
      const timerId = this.streamInitTimers.get(robotId);
      if (timerId) {
        clearTimeout(timerId);
        this.streamInitTimers.delete(robotId);
      }

      // Clear all intervals associated with this robot
      this.clearIntervals(robotId);

      // Remove from registry
      this.registry.delete(robotId);

      return true;
    } catch (error) {
      console.error(`Error removing robot ${robotId}:`, error);
      return false;
    }
  }

  updateRobotStatus(
    robotId: string,
    status: "connected" | "disconnected" | "streaming"
  ): boolean {
    const robot = this.registry.get(robotId);
    if (!robot) {
      return false;
    }

    robot.status = status;
    this.registry.set(robotId, robot);
    return true;
  }

  getRobotCount(): number {
    return this.registry.size;
  }
}

export const robotRegistryService = new RobotRegistryService();
export type { RobotRecord };
