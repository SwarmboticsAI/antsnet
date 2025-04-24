import { BoomButtonStatus } from "@/protos/generated/sbai_control_protos/sbai_control_protos/boom_button_status";
import { CanStatus } from "@/protos/generated/sbai_control_protos/sbai_control_protos/can_status";
import { EcuStatus } from "@/protos/generated/sbai_control_protos/sbai_control_protos/ecu_status";
import { EmergencyStopStatus } from "@/protos/generated/sbai_control_protos/sbai_control_protos/emergency_stop_status";
import { OakStatus } from "@/protos/generated/sbai_perception_protos/sbai_perception_protos/oak_status";
import { StateChangeResult } from "@/protos/generated/sbai_cortex_protos/sbai_cortex_protos/state_change_result";

// Define proto types mapping
export const systemMessageTypeMap = {
  state_change_result: StateChangeResult,
  ecu_status: EcuStatus,
  emergency_stop_status: EmergencyStopStatus,
  can_status: CanStatus,
  oak_status: OakStatus,
  boom_button_status: BoomButtonStatus,
};

// Define conversion keys mapping
export const keyConversionMap = {
  boom_button_status: {
    convertedKey: "boomButtonStatus",
    valueKey: "boomButtonState",
  },
  ecu_status: {
    convertedKey: "ecuStatus",
    valueKey: "ecuState",
  },
  emergency_stop_status: {
    convertedKey: "emergencyStopStatus",
    valueKey: "emergencyStopState",
  },
  can_status: {
    convertedKey: "canStatus",
    valueKey: "canState",
  },
  oak_status: {
    convertedKey: "cameraStatus",
    valueKey: "oakState",
  },
  state_change_result: {
    convertedKey: "stateChangeResult",
    valueKey: "newState",
  },
};
