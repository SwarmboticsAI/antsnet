import { useRef, useEffect, useState, useMemo } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import Map from "react-map-gl/maplibre";
import { DeckGL } from "@deck.gl/react";
import {
  Layer,
  MapView,
  type PickingInfo,
  type ViewStateChangeParameters,
} from "@deck.gl/core";
import { type MjolnirEvent } from "mjolnir.js";

import { MapRightClickMenu } from "@/components/map-right-click-menu";
import { useMapIcons } from "@/hooks/use-map-icons";
import { useBoxSelection } from "@/hooks/use-box-selection";
import { useMapContext } from "@/providers/map-provider";
import { useRobotSelection } from "@/providers/robot-selection-provider";
import { type Robot } from "@/types/robot";

import "maplibre-gl/dist/maplibre-gl.css";

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const HOTKEY_LOCATIONS = {
  p: { lng: -112.0834, lat: 33.6803, label: "Phoenix" },
  k: { lng: 36.0828, lat: 50.1976, label: "Kharkiv" },
  s: { lng: -117.1611, lat: 32.7157, label: "San Diego" },
  d: { lng: -104.9903, lat: 39.7392, label: "Denver" },
} as const;

export function RobotMap({
  robots,
  selectedRobotId,
  layers,
  onDeckClick,
}: {
  robots: Robot[];
  selectedRobotId?: string;
  layers?: Layer[];
  onDeckClick?: (info: PickingInfo) => void;
}) {
  const { deckRef, mapRef, viewState, setViewState, flyTo } = useMapContext();
  const { isBoxSelecting, isCtrlPressed } = useBoxSelection(robots);
  const { selectedRobotIds, toggleRobotSelection } = useRobotSelection();

  const [isMapMoving, setIsMapMoving] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  const viewStateRef = useRef(viewState);
  const iconMarkersRef = useRef<maplibregl.Marker[]>([]);
  const labelMarkersRef = useRef<maplibregl.Marker[]>([]);

  function clearMarkers() {
    iconMarkersRef.current.forEach((marker) => marker?.remove());
    iconMarkersRef.current = [];
    labelMarkersRef.current.forEach((marker) => marker?.remove());
    labelMarkersRef.current = [];
  }

  useEffect(() => {
    return () => clearMarkers();
  }, []);

  const debouncedSetViewState = useMemo(
    () => debounce(setViewState, 50),
    [setViewState]
  );

  const handleClick = (info: PickingInfo, event: MjolnirEvent) => {
    if (isBoxSelecting || isCtrlPressed) return;

    const isRightClick =
      event.srcEvent instanceof MouseEvent && event.srcEvent.button === 2;

    if (
      isRightClick &&
      info.coordinate &&
      typeof info.coordinate[0] === "number" &&
      typeof info.coordinate[1] === "number"
    ) {
      setClickedCoords({ lng: info.coordinate[0], lat: info.coordinate[1] });
      event.srcEvent.preventDefault();
    } else {
      onDeckClick?.(info);
    }
  };

  const handleViewStateChange = ({
    viewState: newViewState,
  }: ViewStateChangeParameters<any>) => {
    viewStateRef.current = newViewState;
    isMapMoving
      ? debouncedSetViewState(newViewState)
      : setViewState(newViewState);
  };

  const satelliteMapStyle = useMemo(
    () =>
      ({
        version: 8,
        sources: {
          "mapbox-satellite": {
            type: "raster",
            tiles: [
              `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg?access_token=${
                import.meta.env.VITE_MAPBOX_API_KEY
              }`,
            ],
            tileSize: 256,
            maxzoom: 22,
          },
        },
        layers: [
          {
            id: "satellite-layer",
            type: "raster",
            source: "mapbox-satellite",
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      } as StyleSpecification),
    []
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const start = () => setIsMapMoving(true);
    const end = () => {
      setIsMapMoving(false);
      setViewState(viewStateRef.current);
    };

    map.on("movestart", start);
    map.on("moveend", end);
    map.on("dragstart", start);
    map.on("dragend", end);
    map.on("zoomstart", start);
    map.on("zoomend", end);
    map.on("rotatestart", start);
    map.on("rotateend", end);

    return () => {
      map.off("movestart", start);
      map.off("moveend", end);
      map.off("dragstart", start);
      map.off("dragend", end);
      map.off("zoomstart", start);
      map.off("zoomend", end);
      map.off("rotatestart", start);
      map.off("rotateend", end);
    };
  }, [mapRef.current]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const target = HOTKEY_LOCATIONS[key as keyof typeof HOTKEY_LOCATIONS];
      if (e.ctrlKey && e.shiftKey && target) {
        flyTo([target.lng, target.lat]);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flyTo]);

  useMapIcons({
    mapRef,
    iconMarkersRef,
    labelMarkersRef,
    robots,
    onIconClick: () => null,
  });

  const deckGLComponent = (
    <DeckGL
      ref={(ref) => {
        deckRef.current = ref?.deck ?? null;
      }}
      viewState={viewState}
      views={new MapView({ repeat: false })}
      controller={!isBoxSelecting}
      layers={layers}
      onClick={handleClick}
      onViewStateChange={handleViewStateChange}
      getCursor={() => (selectedRobotIds.length > 0 ? "crosshair" : "grab")}
    >
      <Map
        ref={(el) => {
          mapRef.current = el?.getMap() || null;
        }}
        mapLib={maplibregl}
        mapStyle={satelliteMapStyle}
        projection="mercator"
        maxTileCacheSize={100}
        maxTileCacheZoomLevels={5}
        refreshExpiredTiles
        reuseMaps
      />
    </DeckGL>
  );

  return (
    <MapRightClickMenu
      clickedCoords={clickedCoords}
      selectedRobotIds={selectedRobotIds}
      selectedRobotId={selectedRobotId}
    >
      {deckGLComponent}
    </MapRightClickMenu>
  );
}
