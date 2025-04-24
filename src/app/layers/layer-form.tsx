import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useMapFeatureContext } from "@/providers/map-feature-provider";
import { MapFeature } from "@/types/MapFeature";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type LayerFormProps = {
  mode: "create" | "edit";
  initialData?: MapFeature;
};

export function LayerForm({ mode, initialData }: LayerFormProps) {
  const router = useRouter();
  const { drawState, dispatch, createFeature, updateFeature } =
    useMapFeatureContext();

  const [name, setName] = useState(initialData?.name ?? "");
  const [visibility, setVisibility] = useState<"private" | "public">(
    initialData?.visibility ?? "private"
  );
  const [fillColor, setFillColor] = useState(
    initialData?.style?.fillColor ?? "#aaaaaa"
  );
  const [strokeColor, setStrokeColor] = useState(
    initialData?.style?.strokeColor ?? "#222222"
  );
  const [opacity, setOpacity] = useState(initialData?.style?.opacity ?? 0.8);
  const [radius, setRadius] = useState(initialData?.style?.radius ?? 20);

  const featureType = initialData?.featureType ?? drawState.featureType;

  useEffect(() => {
    dispatch({
      type: "SET_METADATA",
      metadata: {
        fillColor,
        strokeColor,
        opacity,
        radius,
        label: name,
      },
    });
  }, [fillColor, strokeColor, opacity, radius, name, dispatch]);

  const handleSubmit = () => {
    if (!featureType || !drawState.points.length) return;

    const geometry =
      featureType === "polygon"
        ? {
            type: "Polygon" as const,
            coordinates: [
              [
                ...drawState.points.map(([lat, lng]) => [lng, lat]),
                [drawState.points[0][1], drawState.points[0][0]], // Close loop
              ],
            ],
          }
        : {
            type: "LineString" as const,
            coordinates: drawState.points.map(([lat, lng]) => [lng, lat]),
          };

    const featurePayload = {
      name,
      userId: "dev-user",
      featureType,
      geometry,
      visibility,
      style: {
        fillColor,
        strokeColor,
        opacity,
        ...(featureType === "beacon" ? { radius } : {}),
      },
    };

    if (mode === "edit" && initialData?._id) {
      // 🛠 Update existing feature
      updateFeature(initialData._id, featurePayload);
      router.push("/layers");
    } else {
      // ✨ Create new feature
      createFeature(featurePayload);
    }

    dispatch({ type: "FINISH" });
  };

  return (
    <div className="space-y-2 absolute top-20 right-4 bg-background p-4 rounded-lg shadow-lg pointer-events-auto">
      <Label>Feature Label</Label>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name this feature..."
      />

      <Label>Feature Visibility</Label>
      <Select
        value={visibility}
        onValueChange={(value) => setVisibility(value as "private" | "public")}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Visibility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="private">Private</SelectItem>
          <SelectItem value="public">Public</SelectItem>
        </SelectContent>
      </Select>

      <Label className="block">Fill Color</Label>
      <input
        type="color"
        value={fillColor}
        onChange={(e) => setFillColor(e.target.value)}
        className="w-full h-10 border-none rounded-lg overflow-hidden"
      />

      <Label className="block">Stroke Color</Label>
      <input
        className="w-full h-10 border-none rounded-lg overflow-hidden"
        type="color"
        value={strokeColor}
        onChange={(e) => setStrokeColor(e.target.value)}
      />

      <Label>Opacity</Label>
      <Slider
        value={[opacity]}
        onValueChange={(value) => setOpacity(value[0])}
        max={1}
        step={0.01}
        className="w-full"
      />

      {drawState.featureType === "beacon" && (
        <>
          <Label className="block">Radius</Label>
          <Slider
            value={[radius]}
            onValueChange={(value) => setRadius(value[0])}
            max={50}
            step={1}
            className="w-full"
          />
        </>
      )}

      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={handleSubmit}>
          Save Feature
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            if (mode === "edit") {
              dispatch({ type: "FINISH" });
              router.push("/layers");
            } else {
              dispatch({ type: "CANCEL" });
            }
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
