import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";

// Define known message types and their protos
const knownMessageTypes: {
  [key: string]: { proto: string; package: string; message: string };
} = {
  // Control protos
  boom_button_status: {
    proto: "boom_button_status.proto",
    package: "sbai_control_protos",
    message: "BoomButtonStatus",
  },
  can_status: {
    proto: "can_status.proto",
    package: "sbai_control_protos",
    message: "CanStatus",
  },
  ecu_status: {
    proto: "ecu_status.proto",
    package: "sbai_control_protos",
    message: "EcuStatus",
  },
  emergency_stop_status: {
    proto: "emergency_stop_status.proto",
    package: "sbai_control_protos",
    message: "EmergencyStopStatus",
  },

  // Perception protos
  oak_status: {
    proto: "oak_status.proto",
    package: "sbai_perception_protos",
    message: "OakStatus",
  },
  terrain_map_status: {
    proto: "terrain_map_status.proto",
    package: "sbai_perception_protos",
    message: "TerrainMapStatus",
  },

  // Cortex protos
  state_change_result: {
    proto: "state_change_result.proto",
    package: "sbai_cortex_protos",
    message: "StateChangeResult",
  },
};

// Cache for loaded proto types
const protoCache: { [key: string]: any } = {};

/**
 * Table Parser class to decode binary table data
 */
export class TableParser {
  private protosDir: string;

  constructor(protosDir: string = "./protos") {
    this.protosDir = protosDir;
  }

  /**
   * Parse a table entry based on its key and binary data
   */
  parseTableEntry(key: string, binaryData: Uint8Array): any {
    // Get message type info
    const messageTypeInfo = this.getMessageTypeInfo(key);
    if (!messageTypeInfo) {
      console.warn(`Unknown message type for key: ${key}`);
      return { raw: Buffer.from(binaryData).toString("hex") };
    }

    try {
      // Load proto type if not cached
      if (!protoCache[key]) {
        protoCache[key] = this.loadProtoType(
          messageTypeInfo.proto,
          messageTypeInfo.package,
          messageTypeInfo.message
        );
      }

      // Decode the binary data
      const decoded = protoCache[key].decode(binaryData);

      // Convert to plain object with enum name resolution
      return this.convertToPlainObject(decoded, key);
    } catch (error) {
      console.error(`Error parsing table entry for key ${key}:`, error);
      return {
        error: "Failed to parse",
        raw: Buffer.from(binaryData).toString("hex"),
      };
    }
  }

  /**
   * Get message type info for a key
   */
  private getMessageTypeInfo(
    key: string
  ): { proto: string; package: string; message: string } | null {
    // Direct match
    if (knownMessageTypes[key]) {
      return knownMessageTypes[key];
    }

    // Try to match with normalized key (strip spaces, etc.)
    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, "_");
    for (const [knownKey, info] of Object.entries(knownMessageTypes)) {
      if (normalizedKey.includes(knownKey)) {
        return info;
      }
    }

    return null;
  }

  /**
   * Load a proto type
   */
  private loadProtoType(
    protoFile: string,
    packageName: string,
    messageName: string
  ): any {
    const protoPath = path.join(this.protosDir, protoFile);

    // Load the proto file
    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [this.protosDir],
    });

    // Get the package
    const proto = grpc.loadPackageDefinition(packageDefinition);
    const pkg = proto[packageName];

    if (!pkg) {
      throw new Error(
        `Package ${packageName} not found in proto file ${protoFile}`
      );
    }

    // Get the message type
    const messageType = (pkg as grpc.GrpcObject)[messageName];
    if (!messageType) {
      throw new Error(
        `Message ${messageName} not found in package ${packageName}`
      );
    }

    return messageType;
  }

  /**
   * Convert a protobuf message to a plain object with enum name resolution
   */
  private convertToPlainObject(message: any, key: string): any {
    if (!message) return null;

    const result: any = {};

    // Handle specific types differently based on the key
    switch (key) {
      case "boom_button_status":
        result.state = this.resolveBoomButtonState(message.boom_button_state);
        result.stateValue = message.boom_button_state;
        break;

      case "can_status":
        result.state = this.resolveCanState(message.can_state);
        result.stateValue = message.can_state;
        break;

      case "ecu_status":
        result.state = this.resolveEcuState(message.ecu_state);
        result.stateValue = message.ecu_state;
        break;

      case "emergency_stop_status":
        result.state = this.resolveEmergencyStopState(
          message.emergency_stop_state
        );
        result.stateValue = message.emergency_stop_state;
        break;

      case "oak_status":
        result.state = this.resolveOakState(message.oak_state);
        result.stateValue = message.oak_state;
        break;

      case "terrain_map_status":
        result.state = this.resolveTerrainMapHealthStatus(
          message.health_status
        );
        result.stateValue = message.health_status;
        break;

      case "state_change_result":
        result.newState = message.new_state;
        result.wasSuccessful = message.was_state_change_successful?.value;
        break;

      default:
        // For unknown types, just return the raw message
        for (const [k, v] of Object.entries(message)) {
          result[k] = v;
        }
    }

    return result;
  }

  /**
   * Resolve BoomButtonState enum
   */
  private resolveBoomButtonState(state: string | number): string {
    const states: { [key: string]: string } = {
      "0": "UNSPECIFIED",
      "1": "ENGAGED",
      "2": "DISENGAGED",
    };
    return states[state?.toString()] || "UNKNOWN";
  }

  /**
   * Resolve CanState enum
   */
  private resolveCanState(state: string | number): string {
    const states: { [key: string]: string } = {
      "0": "UNSPECIFIED",
      "1": "NORMAL",
      "2": "ERROR",
    };
    return states[state?.toString()] || "UNKNOWN";
  }

  /**
   * Resolve EcuState enum
   */
  private resolveEcuState(state: string | number): string {
    const states: { [key: string]: string } = {
      "0": "UNSPECIFIED",
      "1": "NORMAL",
      "2": "ERROR",
    };
    return states[state?.toString()] || "UNKNOWN";
  }

  /**
   * Resolve EmergencyStopState enum
   */
  private resolveEmergencyStopState(state: string | number): string {
    const states: { [key: string]: string } = {
      "0": "UNSPECIFIED",
      "1": "ENGAGED",
      "2": "DISENGAGED",
    };
    return states[state?.toString()] || "UNKNOWN";
  }

  /**
   * Resolve OakState enum
   */
  private resolveOakState(state: string | number): string {
    const states: { [key: string]: string } = {
      "0": "UNSPECIFIED",
      "1": "NORMAL",
      "2": "ERROR",
    };
    return states[state?.toString()] || "UNKNOWN";
  }

  /**
   * Resolve TerrainMapHealthStatus enum
   */
  private resolveTerrainMapHealthStatus(state: string | number): string {
    const states: { [key: string]: string } = {
      "0": "UNSPECIFIED",
      "1": "HEALTHY",
      "2": "DEGRADED",
      "3": "BLIND",
      "4": "ERROR",
    };
    return states[state?.toString()] || "UNKNOWN";
  }
}

// Export a singleton instance
export const tableParser = new TableParser();
export default tableParser;
