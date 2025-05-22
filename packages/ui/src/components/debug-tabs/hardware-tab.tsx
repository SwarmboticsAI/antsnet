import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { CanState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/can_status";
import { BoomButtonState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/boom_button_status";
import { ParkingBrakeState } from "@swarmbotics/protos/ros2_interfaces/sbai_tak_heartbeat_publisher_protos/sbai_tak_heartbeat_publisher_protos/to_tak_heartbeat";
import { EmergencyStopState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/emergency_stop_status";
import { EcuState } from "@swarmbotics/protos/ros2_interfaces/sbai_control_protos/sbai_control_protos/ecu_status";
import { OakState } from "@swarmbotics/protos/ros2_interfaces/sbai_perception_protos/sbai_perception_protos/oak_status";
import { type Robot } from "@/types/robot";

export function HardwareTab({ robot }: { robot: Robot }) {
  return (
    <TabsContent value="hardware">
      <Table className="text-sm mb-2">
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">CAN Status</TableCell>
            <TableCell>
              {robot.canStatus != null
                ? CanState[robot.canStatus] || robot.canStatus
                : "CAN_STATE_UNSPECIFIED"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Oak Status</TableCell>
            <TableCell>
              {robot.oakStatus != null
                ? OakState[robot.oakStatus] || robot.oakStatus
                : "Unknown"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Boom Button Status</TableCell>
            <TableCell>
              {robot.boomButtonStatus != null
                ? BoomButtonState[robot.boomButtonStatus] ||
                  robot.boomButtonStatus
                : "Unknown"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Parking Brake</TableCell>
            <TableCell>
              {ParkingBrakeState[robot.parkingBrakeState] ||
                "PARKING_BRAKE_STATE_ERROR"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Emergency Stop</TableCell>
            <TableCell>
              {robot.emergencyStopStatus != null
                ? EmergencyStopState[robot.emergencyStopStatus] ||
                  robot.emergencyStopStatus
                : "Unknown"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">ECU Status</TableCell>
            <TableCell>
              {robot.ecuStatus != null
                ? EcuState[robot.ecuStatus] || robot.ecuStatus
                : "Unknown"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TabsContent>
  );
}
