import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { CortexState } from "@swarmbotics/protos/ros2_interfaces/sbai_cortex_protos/sbai_cortex_protos/cortex_state_update";
import { type Robot } from "@/types/robot";

export function GeneralTab({ robot }: { robot: Robot }) {
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
              {robot.battery != null ? `${robot.battery.toFixed(0)}%` : "n/a"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Mode</TableCell>
            <TableCell>
              {robot.mode != null
                ? CortexState[robot.mode] || robot.mode
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
            <TableCell>{robot.controllingTakId || "None"}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TabsContent>
  );
}
