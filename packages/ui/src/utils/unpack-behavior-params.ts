import type { Any } from "@swarmbotics/protos/google/protobuf/any";
import { RallyParameters } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/rally_parameters";
import { SurroundParameters } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/surround_parameters";
import { DefendParameters } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/defend_parameters";
import { AreaCoverageParameters } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/area_coverage_parameters";
import { MultiWaypointNavigationParameters } from "@swarmbotics/protos/ros2_interfaces/sbai_behavior_protos/sbai_behavior_protos/multi_waypoint_navigation_parameters";

type SupportedParams =
  | RallyParameters
  | SurroundParameters
  | DefendParameters
  | AreaCoverageParameters
  | MultiWaypointNavigationParameters;

export function unpackBehaviorParams(param?: Any): SupportedParams | undefined {
  if (!param?.typeUrl || !param?.value) return;

  const dataArray = new Uint8Array((param.value as any).data); // Cast to access `data`

  if (param.typeUrl.includes("RallyParameters")) {
    return RallyParameters.decode(dataArray);
  } else if (param.typeUrl.includes("SurroundParameters")) {
    return SurroundParameters.decode(dataArray);
  } else if (param.typeUrl.includes("DefendParameters")) {
    return DefendParameters.decode(dataArray);
  } else if (param.typeUrl.includes("AreaCoverageParameters")) {
    return AreaCoverageParameters.decode(dataArray);
  } else if (param.typeUrl.includes("MultiWaypointNavigationParameters")) {
    return MultiWaypointNavigationParameters.decode(dataArray);
  }

  return;
}
