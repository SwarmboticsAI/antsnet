import { TabsContent } from "@/components/ui/tabs";
import { type Robot } from "@/types/robot";

export function DataTab({ robot }: { robot: Robot }) {
  return (
    <TabsContent value="all">
      <div className="bg-slate-100 dark:bg-slate-800 rounded p-4 overflow-auto max-h-96">
        <pre className="text-xs">{JSON.stringify(robot, null, 2)}</pre>
      </div>
    </TabsContent>
  );
}
