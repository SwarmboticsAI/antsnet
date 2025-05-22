import { Network, Satellite, Wifi, Smartphone } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { StarlinkState } from "@swarmbotics/protos/ros2_interfaces/sbai_network_protos/sbai_network_protos/starlink_status";
import { type Robot } from "@/types/robot";
import { useRobotNetworkStore } from "@/stores/network-store";

export function NetworkTab({ robot }: { robot: Robot }) {
  const networkTable = useRobotNetworkStore((state) =>
    state.getNetworkTable(robot.robotId)
  );
  return (
    <TabsContent value="network">
      <Table className="text-sm mb-2">
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">IP Address</TableCell>
            <TableCell>{robot.ipAddress || "n/a"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">VPN IP Address</TableCell>
            <TableCell>{robot.vpnIpAddress || "n/a"}</TableCell>
          </TableRow>

          <TableRow className="border-t border-t-gray-200 dark:border-t-gray-700">
            <TableCell
              colSpan={2}
              className="font-semibold flex items-center gap-1"
            >
              <Satellite className="h-4 w-4" />
              <span>Starlink Status</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium pl-6">State</TableCell>
            <TableCell>
              {networkTable?.starlink_status?.starlinkState != null
                ? StarlinkState[networkTable.starlink_status.starlinkState] ||
                  networkTable.starlink_status.starlinkState
                : "n/a"}
            </TableCell>
          </TableRow>
          {networkTable?.starlink_status?.alertInfo &&
            networkTable.starlink_status.alertInfo.length > 0 && (
              <TableRow>
                <TableCell className="font-medium pl-6">Alerts</TableCell>
                <TableCell>
                  <ul className="list-disc list-inside">
                    {networkTable.starlink_status.alertInfo.map((alert, i) => (
                      <li key={i}>{alert}</li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            )}
          {networkTable?.starlink_status?.popPingDropRate != null && (
            <TableRow>
              <TableCell className="font-medium pl-6">Packet Loss</TableCell>
              <TableCell>
                {(networkTable.starlink_status.popPingDropRate * 100).toFixed(
                  1
                )}
                %
              </TableCell>
            </TableRow>
          )}
          {networkTable?.starlink_status?.popPingLatencyMs != null && (
            <TableRow>
              <TableCell className="font-medium pl-6">Latency</TableCell>
              <TableCell>
                {networkTable.starlink_status.popPingLatencyMs.toFixed(0)} ms
              </TableCell>
            </TableRow>
          )}
          {networkTable?.starlink_status?.fractionObstructed != null && (
            <TableRow>
              <TableCell className="font-medium pl-6">Obstructed</TableCell>
              <TableCell>
                {(
                  networkTable.starlink_status.fractionObstructed * 100
                ).toFixed(1)}
                %
              </TableCell>
            </TableRow>
          )}

          {networkTable?.satellite_metrics && (
            <>
              <TableRow className="border-t border-t-gray-200 dark:border-t-gray-700">
                <TableCell
                  colSpan={2}
                  className="font-semibold flex items-center gap-1"
                >
                  <Wifi className="h-4 w-4" />
                  <span>Satellite Metrics</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">
                  Test Internet IP
                </TableCell>
                <TableCell>
                  {networkTable.satellite_metrics.testInternetIp || "n/a"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">
                  Link Detected
                </TableCell>
                <TableCell>
                  {networkTable.satellite_metrics.isLinkDetected ? "Yes" : "No"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">
                  RTT (min/avg/max)
                </TableCell>
                <TableCell>
                  {networkTable.satellite_metrics.minRttMs?.toFixed(1) || "n/a"}{" "}
                  /
                  {networkTable.satellite_metrics.avgRttMs?.toFixed(1) || "n/a"}{" "}
                  /
                  {networkTable.satellite_metrics.maxRttMs?.toFixed(1) || "n/a"}{" "}
                  ms
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">
                  RTT Standard Deviation
                </TableCell>
                <TableCell>
                  {networkTable.satellite_metrics.stdDevRttMs?.toFixed(2) ||
                    "n/a"}{" "}
                  ms
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">Packet Loss</TableCell>
                <TableCell>
                  {networkTable.satellite_metrics.packetLossPercent?.toFixed(
                    1
                  ) || "n/a"}
                  %
                </TableCell>
              </TableRow>
            </>
          )}

          {networkTable?.cell_metrics && (
            <>
              <TableRow className="border-t border-t-gray-200 dark:border-t-gray-700">
                <TableCell
                  colSpan={2}
                  className="font-semibold flex items-center gap-1"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Cellular Metrics</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">
                  Test Internet IP
                </TableCell>
                <TableCell>
                  {networkTable.cell_metrics.testInternetIp || "n/a"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">
                  Link Detected
                </TableCell>
                <TableCell>
                  {networkTable.cell_metrics.isLinkDetected ? "Yes" : "No"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">
                  RTT (min/avg/max)
                </TableCell>
                <TableCell>
                  {networkTable.cell_metrics.minRttMs?.toFixed(1) || "n/a"} /
                  {networkTable.cell_metrics.avgRttMs?.toFixed(1) || "n/a"} /
                  {networkTable.cell_metrics.maxRttMs?.toFixed(1) || "n/a"} ms
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">
                  RTT Standard Deviation
                </TableCell>
                <TableCell>
                  {networkTable.cell_metrics.stdDevRttMs?.toFixed(2) || "n/a"}{" "}
                  ms
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">Packet Loss</TableCell>
                <TableCell>
                  {networkTable.cell_metrics.packetLossPercent?.toFixed(1) ||
                    "n/a"}
                  %
                </TableCell>
              </TableRow>
            </>
          )}

          {networkTable?.full_path_metrics?.linksMetrics && (
            <>
              <TableRow className="border-t border-t-gray-200 dark:border-t-gray-700">
                <TableCell
                  colSpan={2}
                  className="font-semibold flex items-center gap-1"
                >
                  <Network className="h-4 w-4" />
                  <span>Path Metrics</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">Links</TableCell>
                <TableCell>
                  <ul className="list-disc list-inside">
                    {Array.isArray(
                      networkTable?.full_path_metrics?.linksMetrics
                    ) &&
                      networkTable.full_path_metrics.linksMetrics.map(
                        (link, i) => (
                          <li key={i} className="mb-2">
                            <div>
                              <strong>Link {i + 1}:</strong>{" "}
                              {link.linkType || "Unknown"}
                            </div>
                            {link.testInternetIp && (
                              <div className="ml-4">
                                IP: {link.testInternetIp}
                              </div>
                            )}
                            {(link.minRttMs !== undefined ||
                              link.avgRttMs !== undefined ||
                              link.maxRttMs !== undefined) && (
                              <div className="ml-4">
                                RTT: {link.minRttMs?.toFixed(1) || "?"} /
                                {link.avgRttMs?.toFixed(1) || "?"} /
                                {link.maxRttMs?.toFixed(1) || "?"} ms
                              </div>
                            )}
                            {link.packetLossPercent !== undefined && (
                              <div>
                                Packet Loss: {link.packetLossPercent.toFixed(1)}
                                %
                              </div>
                            )}
                          </li>
                        )
                      )}
                  </ul>
                </TableCell>
              </TableRow>
            </>
          )}

          <TableRow className="border-t border-t-gray-200 dark:border-t-gray-700">
            <TableCell
              colSpan={2}
              className="font-semibold flex items-center gap-1"
            >
              <Network className="h-4 w-4" />
              <span>ZeroTier Connection</span>
            </TableCell>
          </TableRow>
          {networkTable?.zerotier_connection ? (
            <>
              <TableRow>
                <TableCell className="font-medium pl-6">Peer ID</TableCell>
                <TableCell>
                  {networkTable?.zerotier_connection.peerId || "n/a"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">Bonded</TableCell>
                <TableCell>
                  {networkTable?.zerotier_connection.isBonded ? "Yes" : "No"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">Relayed</TableCell>
                <TableCell>
                  {networkTable?.zerotier_connection.isRelayed ? "Yes" : "No"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">
                  Internet Type
                </TableCell>
                <TableCell>
                  {networkTable?.zerotier_connection.activeInternetType ||
                    "n/a"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">
                  Gateway Owner
                </TableCell>
                <TableCell>
                  {networkTable?.zerotier_connection.activeGatewayOwner ||
                    "n/a"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium pl-6">
                  Path Eligible
                </TableCell>
                <TableCell>
                  {networkTable?.zerotier_connection.activeEligible
                    ? "Yes"
                    : "No"}
                </TableCell>
              </TableRow>
              {networkTable?.zerotier_connection.backupPaths?.length > 0 && (
                <TableRow>
                  <TableCell className="font-medium pl-6">
                    Backup Paths
                  </TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {networkTable?.zerotier_connection.backupPaths.map(
                        (path, i) => (
                          <li key={i}>
                            {path.backupInternetType} via{" "}
                            {path.backupGatewayOwner} ({path.numEligiblePaths}{" "}
                            eligible paths)
                          </li>
                        )
                      )}
                    </ul>
                  </TableCell>
                </TableRow>
              )}
            </>
          ) : (
            <TableRow>
              <TableCell
                colSpan={2}
                className="text-center text-muted-foreground"
              >
                No ZeroTier data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TabsContent>
  );
}
