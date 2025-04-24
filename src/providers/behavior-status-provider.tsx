"use client";

import { useEffect, ReactNode, useCallback } from "react";
import { useZenoh } from "@/providers/zenoh-provider";
import { useBehaviors } from "@/providers/behavior-provider";
import { AggregatedTable } from "@/protos/generated/sbai_system_alert_protos/sbai_system_alert_protos/aggregated_table";
import { BehaviorStatus } from "@/protos/generated/sbai_task_protos/sbai_task_protos/behavior_status";
import { BehaviorStatusUI } from "@/reducers/behavior-reducer";

// translate from proto enum (int) to UI status
function toBehaviorStatusUI(protoStatus: number): BehaviorStatusUI {
  switch (protoStatus) {
    case 1:
      return BehaviorStatusUI.ACCEPTED;
    case 2:
      return BehaviorStatusUI.ACTIVE;
    case 3:
      return BehaviorStatusUI.COMPLETED;
    case 4:
      return BehaviorStatusUI.FAILED;
    case 5:
      return BehaviorStatusUI.CANCELED;
    default:
      return BehaviorStatusUI.UNSPECIFIED;
  }
}

export function BehaviorStatusProvider({ children }: { children: ReactNode }) {
  const { session, isConnected } = useZenoh();
  const { behaviors } = useBehaviors(); // for robot lookup
  const { cancelBehavior } = useBehaviors(); // optional if you want to auto-cancel

  const { dispatch } = useBehaviors();

  const handleTaskTableSample = useCallback(
    async (sample: any): Promise<void> => {
      try {
        const rawData = new Uint8Array(Object.values(sample._payload._buffer));
        const table = AggregatedTable.decode(rawData);

        console.log(`Received AggregatedTable from ${table.robotId}`);

        // Log registered behaviors for debugging
        console.log("Currently registered behaviors:", Object.keys(behaviors));

        for (const [tableKey, bytes] of Object.entries(table.table)) {
          console.log(`Processing entry: ${tableKey}`, bytes, "TABLE KEY");

          // Only process behavior status updates
          if (tableKey === "behavior_status") {
            // Skip empty data
            if (!bytes || bytes.length === 0) {
              console.log("⚠️ Empty behavior status data");
              continue;
            }

            const behaviorStatus = BehaviorStatus.decode(bytes as Uint8Array);
            console.log(behaviorStatus, "BEHAVIOR STATUS");

            // Skip entries without a behavior ID
            if (!behaviorStatus.behaviorId) {
              console.log("⚠️ Empty behavior ID");
              continue;
            }

            const behaviorId = behaviorStatus.behaviorId;
            const statusUI = toBehaviorStatusUI(behaviorStatus.behaviorState);

            // Check if we know about this behavior
            const behavior = behaviors[behaviorId];
            if (!behavior) {
              console.log(
                `ℹ️ Status update for behavior created by another client: ${behaviorId}`
              );

              // Optional: If you want to track behaviors created by other clients,
              // you could register them here with limited information
              // dispatch({
              //   type: "REGISTER_EXTERNAL_BEHAVIOR",
              //   behaviorId,
              //   robotId: table.robotId,
              //   status: statusUI,
              // });

              continue;
            }

            // Update the status for known behaviors
            dispatch({
              type: "UPDATE_STATUS",
              behaviorId,
              robotId: table.robotId,
              status: statusUI,
            });

            console.log(
              `✅ Updated behavior ${behaviorId} → ${statusUI.toUpperCase()}`
            );
          } else if (tableKey === "geo_path") {
            // You might want to process geo_path data in the future
            console.log(
              "Received geo_path data",
              bytes.length > 0 ? "with content" : "empty"
            );
          } else {
            console.log(`Skipping unknown table key: ${tableKey}`);
          }
        }
      } catch (err) {
        console.error("❌ Failed to decode AggregatedTable:", err);
        console.error(
          "Error details:",
          err instanceof Error ? err.message : String(err)
        );
        console.error("Raw data:", sample);
      }
    },
    [behaviors, dispatch]
  );

  useEffect(() => {
    if (!isConnected || !session) return;

    const subscriber = session.declare_subscriber(
      "to_tak/domain_table/task/*",
      { handler: handleTaskTableSample }
    );

    console.log("Subscribed to robot behavior status updates");

    return () => {
      subscriber?.undeclare();
    };
  }, [session, isConnected, handleTaskTableSample]);

  return <>{children}</>;
}
