import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { CortexState } from "@swarmbotics/protos/ros2_interfaces/sbai_cortex_protos/sbai_cortex_protos/cortex_state_update";
import { type Robot } from "@/types/robot";
import { useRobotSystemStore } from "@/stores/system-store";

export function GeneralTab({ robot }: { robot: Robot }) {
  const { getSystemTable } = useRobotSystemStore();
  const systemTable = getSystemTable(robot.robotId);

  return (
    <TabsContent value="basic">
      <Table className="text-sm mb-2">
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Robot ID</TableCell>
            <TableCell>{robot.robotId}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">Platform Type</TableCell>
            <TableCell>{robot.platformType || "n/a"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Battery</TableCell>
            <TableCell>
              {systemTable?.battery_percentage != null
                ? `${systemTable.battery_percentage.batteryPercentage?.toFixed(
                    0
                  )}%`
                : "n/a"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Mode</TableCell>
            <TableCell>
              {typeof systemTable?.state_change_result?.newState === "number"
                ? CortexState[systemTable.state_change_result.newState] ??
                  systemTable.state_change_result.newState
                : "n/a"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Last Seen</TableCell>
            <TableCell>
              {robot.lastSeen
                ? new Date(robot.lastSeen).toLocaleString()
                : "n/a"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Controlling TAK ID</TableCell>
            <TableCell>
              {systemTable?.controlling_device_id?.controllingDeviceId ??
                "None"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TabsContent>
  );
}
