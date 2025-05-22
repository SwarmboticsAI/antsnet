import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { TerrainMapHealthStatus } from "@swarmbotics/protos/ros2_interfaces/sbai_perception_protos/sbai_perception_protos/terrain_map_status";
import { GpsState } from "@swarmbotics/protos/localization/ublox/ublox_protos/ublox_protos/gps_status";
import { FixState } from "@swarmbotics/protos/localization/ublox/ublox_protos/ublox_protos/fix_status";
import { type Robot } from "@/types/robot";

export function LocationTab({ robot }: { robot: Robot }) {
  return (
    <TabsContent value="perception">
      <Table className="text-sm mb-2">
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Latitude</TableCell>
            <TableCell>
              {robot.gpsCoordinates?.latitude.toFixed(7) ?? "n/a"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Longitude</TableCell>
            <TableCell>
              {robot.gpsCoordinates?.longitude.toFixed(7) ?? "n/a"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Altitude</TableCell>
            <TableCell>
              {robot.gpsCoordinates?.altitude != null
                ? `${robot.gpsCoordinates.altitude.toFixed(2)} m`
                : "n/a"}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Heading</TableCell>
            <TableCell>{robot.heading.toFixed(2)}°</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Speed</TableCell>
            <TableCell>{robot.speed.toFixed(1)} m/s</TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">GPS Status</TableCell>
            <TableCell>
              {robot?.gpsStatus
                ? GpsState[robot.gpsStatus.gpsState]
                : "unknown"}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">GPS Fix</TableCell>
            <TableCell>
              {robot.fixStatus?.fixState != null
                ? FixState[robot.fixStatus.fixState]
                : "unknown"}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">Vertical Accuracy</TableCell>
            <TableCell>
              {robot.fixStatus?.verticalAccuracyM != null
                ? `${robot.fixStatus.verticalAccuracyM.toFixed(2)} m`
                : "unknown"}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">Horizontal Accuracy</TableCell>
            <TableCell>
              {robot.fixStatus?.horizontalAccuracyM != null
                ? `${robot.fixStatus.horizontalAccuracyM.toFixed(2)} m`
                : "unknown"}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-medium">Terrain Map Status</TableCell>
            <TableCell>
              {robot.terrainMapStatus != null
                ? TerrainMapHealthStatus[robot.terrainMapStatus] ||
                  robot.terrainMapStatus
                : "Unknown"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TabsContent>
  );
}
