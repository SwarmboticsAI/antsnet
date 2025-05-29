import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { CanState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/can_status";
import { BoomButtonState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/boom_button_status";
import { ParkingBrakeState } from "@swarmbotics/protos/ros2_interfaces/sbai_tak_heartbeat_publisher_protos/sbai_tak_heartbeat_publisher_protos/to_tak_heartbeat";
import { EmergencyStopState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/emergency_stop_status";
import { EcuState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/ecu_status";
import { OakState } from "@swarmbotics/protos/ros2_interfaces/sbai_perception_protos/sbai_perception_protos/oak_status";
import { useRobotSystemStore } from "@/stores/system-store";
import { type Robot } from "@/types/robot";

export function HardwareTab({ robot }: { robot: Robot }) {
  const { getSystemTable } = useRobotSystemStore();
  const systemTable = getSystemTable(robot.robotId);

  return (
    <TabsContent value="hardware">
      <Table className="text-sm mb-2">
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">CAN Status</TableCell>
            <TableCell>
              {systemTable?.can_status != null
                ? CanState[systemTable?.can_status.canState]
                : "CAN_STATE_UNSPECIFIED"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Oak Status</TableCell>
            <TableCell>
              {systemTable?.oak_status != null
                ? OakState[systemTable.oak_status.oakState]
                : "Unknown"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Boom Button Status</TableCell>
            <TableCell>
              {systemTable?.boom_button_status?.boomButtonState != null
                ? BoomButtonState[
                    systemTable.boom_button_status.boomButtonState
                  ]
                : "Unknown"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Emergency Stop</TableCell>
            <TableCell>
              {systemTable?.emergency_stop_status != null
                ? EmergencyStopState[
                    systemTable.emergency_stop_status.emergencyStopState
                  ]
                : "Unknown"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">ECU Status</TableCell>
            <TableCell>
              {systemTable?.ecu_status != null
                ? EcuState[systemTable.ecu_status.ecuState]
                : "Unknown"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TabsContent>
  );
}
