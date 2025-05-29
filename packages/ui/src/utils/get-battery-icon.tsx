import { BatteryFull, BatteryLow, BatteryMedium } from "lucide-react";

export function getBatteryIcon(level: number) {
  if (level === null || level < 0) {
    return <BatteryLow className="text-gray-500" />;
  }
  if (level <= 20) return <BatteryLow className="text-red-500" />;
  if (level <= 30) return <BatteryLow className="text-orange-400" />;
  if (level <= 70) return <BatteryMedium className="text-primary" />;
  return <BatteryFull className="text-primary" />;
}
