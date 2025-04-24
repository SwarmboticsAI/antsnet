import { Behavior } from "@/protos/generated/sbai_behavior_protos/behavior_request";

export function getBehaviorRadius(
  behaviorType: Behavior,
  params: Record<string, any>
): number | undefined {
  switch (behaviorType) {
    case Behavior.BEHAVIOR_RALLY:
      return params?.rallyRadiusM;
    case Behavior.BEHAVIOR_SURROUND:
      return params?.surroundRadiusM;
    case Behavior.BEHAVIOR_DEFEND:
      return params?.defendRadiusM;
    default:
      return undefined;
  }
}
