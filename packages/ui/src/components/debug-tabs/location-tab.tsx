import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { TerrainMapHealthStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_perception_protos/sbai_perception_protos/terrain_map_status";
import { GpsState } from "@swarmbotics/protos/localization/ublox/ublox_protos/ublox_protos/gps_status";
import { FixState } from "@swarmbotics/protos/localization/ublox/ublox_protos/ublox_protos/fix_status";
import { type Robot } from "@/types/robot";
import { useRobotSystemStore } from "@/stores/system-store";
import { useRobotLocalizationStore } from "@/stores/localization-store";

export function LocationTab({ robot }: { robot: Robot }) {
  const { getSystemTable } = useRobotSystemStore();
  const { getLocalizationTable } = useRobotLocalizationStore();
  const systemTable = getSystemTable(robot.robotId);
  const localizationTable = getLocalizationTable(robot.robotId);

  return (
    <TabsContent value="perception">
      <Table className="text-sm mb-2">
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Latitude</TableCell>
            <TableCell>
              {localizationTable?.localization_data?.gpsCoordinate?.latitude.toFixed(
                7
              ) ?? "n/a"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Longitude</TableCell>
            <TableCell>
              {localizationTable?.localization_data?.gpsCoordinate?.longitude.toFixed(
                7
              ) ?? "n/a"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Altitude</TableCell>
            <TableCell>
              {localizationTable?.localization_data?.gpsCoordinate?.altitude !=
              null
                ? `${localizationTable?.localization_data?.gpsCoordinate.altitude.toFixed(
                    2
                  )} m`
                : "n/a"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Heading</TableCell>
            <TableCell>
              {localizationTable?.localization_data?.magneticHeadingDeg.toFixed(
                2
              )}
              °
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Speed</TableCell>
            <TableCell>
              {localizationTable?.localization_data?.bodySpeedMPerS.toFixed(1)}{" "}
              m/s
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">GPS Status</TableCell>
            <TableCell>
              {systemTable?.gps_status?.gpsState != null
                ? GpsState[systemTable?.gps_status?.gpsState ?? 0]
                : "unknown"}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">GPS Fix</TableCell>
            <TableCell>
              {systemTable?.fix_status?.fixState != null
                ? FixState[systemTable?.fix_status?.fixState ?? 0]
                : "unknown"}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">Vertical Accuracy</TableCell>
            <TableCell>
              {systemTable?.fix_status?.verticalAccuracyM != null
                ? `${systemTable?.fix_status?.verticalAccuracyM.toFixed(2)} m`
                : "unknown"}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">Horizontal Accuracy</TableCell>
            <TableCell>
              {systemTable?.fix_status?.horizontalAccuracyM != null
                ? `${systemTable?.fix_status?.horizontalAccuracyM.toFixed(2)} m`
                : "unknown"}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">Terrain Map Status</TableCell>
            <TableCell>
              {systemTable?.terrain_map_status?.healthStatus != null
                ? TerrainMapHealthStatus[
                    systemTable?.terrain_map_status?.healthStatus ?? 0
                  ] || systemTable?.terrain_map_status?.healthStatus
                : "Unknown"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TabsContent>
  );
}
