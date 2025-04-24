"use client";

import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RobotMap } from "@/components/map";
import { useStandardLayers } from "@/hooks/use-standard-layers";
import { useDraftFeatureLayer } from "@/hooks/use-draft-feature-layer";
import { useMapFeatureContext } from "@/providers/map-feature-provider";
import { LayerForm } from "./layer-form";

export default function Layers() {
  const router = useRouter();
  const standardLayers = useStandardLayers();
  const featureLayer = useDraftFeatureLayer();
  const { drawState, dispatch, features } = useMapFeatureContext();

  const isDrawing = drawState.mode === "drawing";

  return (
    <div className="overflow-hidden">
      <SidebarProvider>
        <Sidebar>
          <>
            <div className="flex items-center justify-between p-2">
              <h2 className="text-lg font-semibold">Layers</h2>
            </div>

            {features?.map((feature) => (
              <div
                key={feature._id}
                className="flex flex-col w-full gap-2 border p-3 rounded-xs hover:bg-accent/10 cursor-pointer transition-colors"
                onClick={() => {
                  router.push(`/layers/${feature._id}`);
                }}
              >
                <div className="flex flex-col items-center justify-between">
                  <h3 className="font-medium flex items-center gap-4">
                    {feature.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{feature.featureType}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        </Sidebar>
      </SidebarProvider>
      <RobotMap
        robots={[]} // Pass an empty array or appropriate Robot[] data
        layers={[...featureLayer, ...standardLayers].flat()}
        onDeckClick={(info) => {
          if (!info.coordinate || !isDrawing) return;
          const [lng, lat] = info.coordinate;
          dispatch({ type: "ADD_POINT", point: [lat, lng] });
        }}
      />

      {isDrawing ? (
        <>
          <LayerForm mode="create" />
        </>
      ) : (
        <div className="absolute top-20 right-4 p-4 bg-background">
          <h3 className="font-bold text-base mb-2">Add New Feature</h3>
          <div className="flex flex-col gap-2">
            <button
              className="px-3 py-1 rounded bg-muted"
              onClick={() =>
                dispatch({ type: "START_DRAWING", featureType: "polygon" })
              }
            >
              Start Polygon
            </button>
            <button
              className="px-3 py-1 rounded bg-muted"
              onClick={() =>
                dispatch({ type: "START_DRAWING", featureType: "line" })
              }
            >
              Start Line
            </button>
            <button
              className="px-3 py-1 rounded bg-muted"
              onClick={() =>
                dispatch({ type: "START_DRAWING", featureType: "beacon" })
              }
            >
              Create Beacon
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
