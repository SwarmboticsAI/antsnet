import { useState } from "react";
import { BarChart3, Info, MapPin, Truck, Wifi } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralTab } from "./general-tab";
import { NetworkTab } from "./network-tab";
import { LocationTab } from "./location-tab";
import { HardwareTab } from "./hardware-tab";
import { DataTab } from "./data-tab";
import { type Robot } from "@/types/robot";

export function DebugTabs({ robot }: { robot: Robot }) {
  const [selectedTab, setSelectedTab] = useState("basic");
  return (
    <Tabs
      defaultValue="basic"
      onValueChange={setSelectedTab}
      value={selectedTab}
    >
      <TabsList className="grid grid-cols-5 mb-4 w-full">
        <TabsTrigger value="basic" className="flex items-center gap-1">
          <Info className="h-4 w-4" />
          <span>Basic</span>
        </TabsTrigger>
        <TabsTrigger value="network" className="flex items-center gap-1">
          <Wifi className="h-4 w-4" />
          <span>Network</span>
        </TabsTrigger>
        <TabsTrigger value="perception" className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>Location</span>
        </TabsTrigger>
        <TabsTrigger value="hardware" className="flex items-center gap-1">
          <Truck className="h-4 w-4" />
          <span>Hardware</span>
        </TabsTrigger>
        <TabsTrigger value="all" className="flex items-center gap-1">
          <BarChart3 className="h-4 w-4" />
          <span>All Data</span>
        </TabsTrigger>
      </TabsList>

      <GeneralTab robot={robot} />
      <NetworkTab robot={robot} />
      <LocationTab robot={robot} />
      <HardwareTab robot={robot} />
      <DataTab robot={robot} />
    </Tabs>
  );
}
