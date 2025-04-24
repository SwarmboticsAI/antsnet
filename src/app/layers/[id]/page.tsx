"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Trash2Icon } from "lucide-react";

import { RobotMap } from "@/components/map";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";

import { useMapFeatureContext } from "@/providers/map-feature-provider";
import { useMapContext } from "@/providers/map-provider";
import { getCoordinatesFromFeature } from "@/utils/get-coordinates-from-feature";
import { LayerForm } from "../layer-form";
import { useDraftFeatureLayer } from "@/hooks/use-draft-feature-layer";

export default function FeatureOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { flyTo } = useMapContext();
  const { features, deleteFeature, dispatch } = useMapFeatureContext();
  const featureLayer = useDraftFeatureLayer();

  const feature = useMemo(() => {
    if (!id || !features) return null;

    return Object.values(features).find((feature) => feature._id === id);
  }, [id, features]);

  useEffect(() => {
    if (!feature) return;

    flyTo(getCoordinatesFromFeature(feature)[0]);
  }, [feature, flyTo]);

  useEffect(() => {
    if (!feature) return;

    // Reverse coordinates from [lng, lat] to [lat, lng]
    const points = getCoordinatesFromFeature(feature)
      .map(([lng, lat]) => [lat, lng])
      .filter((point): point is [number, number] => point.length === 2);

    dispatch({
      type: "START_DRAWING",
      featureType: feature.featureType,
    });

    dispatch({
      type: "SET_POINTS",
      points: points,
    });

    dispatch({
      type: "SET_METADATA",
      metadata: {
        fillColor: feature?.style?.fillColor,
        strokeColor: feature?.style?.strokeColor,
        opacity: feature?.style?.opacity,
        radius: feature?.style?.radius ?? 20,
        label: feature?.name,
      },
    });
  }, [feature, dispatch]);

  return (
    <div className="overflow-hidden">
      <SidebarProvider>
        <Sidebar>
          <>
            <div className="flex items-center justify-between p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  dispatch({ type: "FINISH" });
                  router.push("/layers");
                }}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold uppercase w-full ml-2 truncate">
                {feature?.name}
              </h2>
            </div>

            <div>
              <h3 className="font-medium">{feature?.name}</h3>
              <p className="text-xs">{feature?.featureType}</p>
              {feature?.geometry && (
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(feature?.geometry, null, 2)}
                </pre>
              )}
            </div>

            <Button
              variant="destructive"
              className="w-full mt-4 items-center justify-center"
              onClick={async () => {
                await deleteFeature(feature?._id ?? "");
                const newParams = new URLSearchParams(window.location.search);
                newParams.delete("selectedFeature");
                router.push(`/layers?${newParams.toString()}`);
              }}
            >
              <Trash2Icon className="h-4 w-4" />
              Delete feature
            </Button>
          </>
        </Sidebar>
      </SidebarProvider>

      <RobotMap robots={[]} layers={featureLayer} onDeckClick={() => {}} />

      {feature ? <LayerForm mode="edit" initialData={feature} /> : null}
    </div>
  );
}
