import { TabsContent } from "@/components/ui/tabs";
import { useRobotNetworkStore } from "@/stores/network-store";
import { useRobotSystemStore } from "@/stores/system-store";
import { type Robot } from "@/types/robot";

export function DataTab({ robot }: { robot: Robot }) {
  const { getNetworkTable } = useRobotNetworkStore();
  const { getSystemTable } = useRobotSystemStore();

  const networkTable = getNetworkTable(robot.robotId);
  const systemTable = getSystemTable(robot.robotId);

  return (
    <TabsContent value="all">
      <div className="bg-slate-100 dark:bg-slate-800 rounded p-4 overflow-auto max-h-96">
        <pre className="text-xs">
          {JSON.stringify(
            { ...robot, ...networkTable, ...systemTable },
            null,
            2
          )}
        </pre>
      </div>
    </TabsContent>
  );
}
