import { Input } from "@/components/ui/input";
import { Behavior } from "@/protos/generated/sbai_behavior_protos/behavior_request";
import { RallyParameters } from "@/protos/generated/sbai_behavior_protos/sbai_behavior_protos/rally_parameters";
import {
  AlignCenter,
  Circle,
  MapPin,
  Navigation2,
  RotateCw,
  Shield,
  Zap,
} from "lucide-react";

type GeometryType = "point" | "line" | "polygon" | null;

export type SupportedBehavior =
  | Behavior.BEHAVIOR_RALLY
  | Behavior.BEHAVIOR_DEFEND
  | Behavior.BEHAVIOR_PATROL
  | Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION
  | Behavior.BEHAVIOR_SURROUND
  | Behavior.BEHAVIOR_LINE_FORMATION
  | Behavior.BEHAVIOR_RAPTOR;

export const RallyParamsForm = ({
  params,
  onChange,
}: {
  params: Partial<RallyParameters>;
  onChange: (newParams: Partial<RallyParameters>) => void;
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Rally Radius (meters)</label>
      <Input
        type="number"
        min={1}
        step={1}
        value={params.rallyRadiusM ?? 5}
        onChange={(e) =>
          onChange({ ...params, rallyRadiusM: Number(e.target.value) })
        }
      />
    </div>
  );
};

export const behaviorConfigMap: Record<
  SupportedBehavior,
  {
    label: string;
    icon: React.ReactNode;
    description: string;
    geometryType: GeometryType;
    ParamForm?: React.FC<{ params: any; onChange: (params: any) => void }>;
    getDefaultParams: () => any;
  }
> = {
  [Behavior.BEHAVIOR_RALLY]: {
    label: "Rally",
    icon: <MapPin className="h-4 w-4" />,
    description: "Gather units at a specific point",
    geometryType: "point",
    ParamForm: RallyParamsForm,
    getDefaultParams: () => ({ rallyRadiusM: 5 }),
  },
  [Behavior.BEHAVIOR_DEFEND]: {
    label: "Defend",
    icon: <Shield className="h-4 w-4" />,
    description: "Hold a fixed position",
    geometryType: "point",
    getDefaultParams: () => ({}),
  },
  [Behavior.BEHAVIOR_PATROL]: {
    label: "Patrol",
    icon: <RotateCw className="h-4 w-4" />,
    description: "Sweep a defined area",
    geometryType: "polygon",
    getDefaultParams: () => ({}),
  },
  [Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION]: {
    label: "Multi Waypoint",
    icon: <Navigation2 className="h-4 w-4" />,
    description: "Travel a custom route",
    geometryType: "line",
    getDefaultParams: () => ({}),
  },
  [Behavior.BEHAVIOR_SURROUND]: {
    label: "Surround",
    icon: <Circle className="h-4 w-4" />,
    description: "Encircle a target area",
    geometryType: "polygon",
    getDefaultParams: () => ({}),
  },
  [Behavior.BEHAVIOR_LINE_FORMATION]: {
    label: "Line Formation",
    icon: <AlignCenter className="h-4 w-4" />,
    description: "Align in a line",
    geometryType: "line",
    getDefaultParams: () => ({}),
  },
  [Behavior.BEHAVIOR_RAPTOR]: {
    label: "Raptor",
    icon: <Zap className="h-4 w-4" />,
    description: "Aggressive search and clear",
    geometryType: "polygon",
    getDefaultParams: () => ({}),
  },
};
