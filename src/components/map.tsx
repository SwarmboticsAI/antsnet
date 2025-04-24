"use client";

import { useRef, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import maplibregl, { StyleSpecification } from "maplibre-gl";
import Map from "react-map-gl/maplibre";
import { DeckGL } from "@deck.gl/react";
import {
  Layer,
  MapView,
  PickingInfo,
  ViewStateChangeParameters,
} from "@deck.gl/core";
import { ScatterplotLayer } from "@deck.gl/layers";
import { MjolnirEvent } from "mjolnir.js";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useMapIcons } from "@/hooks/use-map-icons";
import { useMapContext } from "@/providers/map-provider";
import { Robot } from "@/types/Robot";
import {
  useBehaviorCreator,
  convertBehaviorTypeToReadable,
} from "@/providers/behavior-creator-provider";
import { Behavior } from "@/protos/generated/sbai_behavior_protos/behavior_request";
import { useRobotSelection } from "@/providers/robot-selection-provider";
import { useBehaviors } from "@/providers/behavior-provider";
import { useBoxSelection } from "@/hooks/use-box-selection"; // Import the new hook

import "maplibre-gl/dist/maplibre-gl.css";

const HOTKEY_LOCATIONS = {
  p: { lng: -112.08340352647645, lat: 33.68037498297062, label: "Phoenix" },
  k: { lng: 36.082866301396145, lat: 50.19765721527361, label: "Kharkiv" },
  s: { lng: -117.1611, lat: 32.7157, label: "San Diego" },
  d: { lng: -104.9903, lat: 39.7392, label: "Denver" },
} as const;

export function RobotMap({
  robots,
  layers,
  onDeckClick,
}: {
  robots: Robot[];
  layers?: Layer[];
  onDeckClick?: (info: PickingInfo) => void;
}) {
  const router = useRouter();
  const { deckRef, mapRef, viewState, setViewState, flyTo } = useMapContext();
  const [clickedCoords, setClickedCoords] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  // Use the shared robot selection context
  const { selectedRobotIds, toggleRobotSelection } = useRobotSelection();

  // Use the simple box selection hook
  const { isBoxSelecting, isCtrlPressed } = useBoxSelection(robots);

  // Use the behavior creator context and direct behavior provider
  const { state, dispatch, behaviors, createBehavior, checkRobotConflicts } =
    useBehaviorCreator();
  const { requestBehavior } = useBehaviors();
  const iconMarkersRef = useRef<maplibregl.Marker[]>([]);
  const labelMarkersRef = useRef<maplibregl.Marker[]>([]);

  const handleClick = useCallback(
    (info: PickingInfo, event: MjolnirEvent) => {
      // Skip if we're in box selection mode
      if (isBoxSelecting || isCtrlPressed) {
        return;
      }

      if (
        event.srcEvent instanceof MouseEvent ||
        event.srcEvent instanceof PointerEvent
      ) {
        const isRightClick = event.srcEvent.button === 2;

        if (isRightClick) {
          // Store clicked coordinates for context menu
          if (info.coordinate) {
            // DeckGL returns coordinates as [longitude, latitude]
            const newCoords = {
              lng: info.coordinate[0],
              lat: info.coordinate[1],
            };

            console.log(
              `Right-clicked at: lng=${newCoords.lng}, lat=${newCoords.lat}`
            );

            // Update the clicked coordinates
            setClickedCoords(newCoords);
          }
          // Prevent default context menu
          event.srcEvent.preventDefault();
          return;
        }

        onDeckClick?.(info);
      }
    },
    [onDeckClick, isBoxSelecting, isCtrlPressed]
  );

  // Updated behavior creation function
  const createBehaviorDirectly = async (
    behaviorType: Behavior,
    params: Record<string, any> = {}
  ) => {
    if (!clickedCoords) {
      console.warn("No location selected");
      return;
    }

    if (selectedRobotIds.length === 0) {
      console.warn("No robots selected");
      return;
    }

    // Check for robot conflicts before creating the behavior
    const robotsWithActiveBehaviors = checkRobotConflicts(selectedRobotIds);
    if (robotsWithActiveBehaviors.length > 0) {
      console.warn(
        "The following robots are already active in other behaviors:",
        robotsWithActiveBehaviors
      );
      return { success: false, conflictingRobots: robotsWithActiveBehaviors };
    }

    // Create the geoPoints array with the clicked coordinates
    // Note: We use the clicked coordinates directly, not via state
    const geoPoints: [number, number][] = [
      [clickedCoords.lat, clickedCoords.lng],
    ];

    // Combine the parameters with the coordinates
    const finalParams = {
      ...params,
      geoPoints,
    };

    console.log(
      `Creating ${convertBehaviorTypeToReadable(behaviorType)} at: lng=${
        clickedCoords.lng
      }, lat=${clickedCoords.lat}`
    );
    console.log("Parameters:", finalParams);
    console.log("Selected robots:", selectedRobotIds);

    try {
      // Directly call requestBehavior from the behaviors provider
      const behaviorId = await requestBehavior(
        behaviorType,
        selectedRobotIds,
        finalParams
      );

      if (behaviorId) {
        console.log(`Behavior created with ID: ${behaviorId}`);

        // Add the behavior ID to our tracking state
        dispatch({ type: "ADD_BEHAVIOR_ID", id: behaviorId });

        return { success: true, behaviorId };
      }
      return { success: false, error: "Failed to get behavior ID" };
    } catch (e) {
      console.error("Failed to create behavior", e);
      return { success: false, error: e };
    }
  };

  // This is a key change - whenever any viewstate change happens,
  // update context with a COMPLETE viewstate object
  const handleViewStateChange = useCallback(
    ({ viewState: newViewState }: ViewStateChangeParameters<any>) => {
      // Directly update the viewState to match user interaction
      // No conditional logic, no partial updates
      setViewState(newViewState);
    },
    [setViewState]
  );

  const robotHitboxLayer = new ScatterplotLayer({
    id: "robot-hitboxes",
    data: robots,
    pickable: true,
    getPosition: (r: Robot) => [
      r?.gpsCoordinates?.longitude ?? 0,
      r?.gpsCoordinates?.latitude ?? 0,
    ],
    getRadius: 26,
    radiusUnits: "pixels",
    getFillColor: [0, 0, 0, 0],
    onClick: (info: PickingInfo) => {
      if (info.object && !isCtrlPressed) {
        const robot = info.object as Robot;

        // Toggle robot selection when clicked (in addition to URL change)
        toggleRobotSelection(robot.robotId);
      }
    },
  });

  useMapIcons({
    mapRef,
    iconMarkersRef,
    labelMarkersRef,
    robots,
    onIconClick: (robot: Robot) => {
      // Only respond to icon clicks when not in selection mode
      if (!isCtrlPressed) {
        // Toggle robot selection when icon clicked
        toggleRobotSelection(robot.robotId);

        // Original functionality to update URL
        const newParams = new URLSearchParams(window.location.search);
        newParams.set("selectedRobot", robot.robotId);
        router.push(`/?${newParams.toString()}`);
      }
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const target = HOTKEY_LOCATIONS[key as keyof typeof HOTKEY_LOCATIONS];
      if (e.ctrlKey && e.shiftKey && target) {
        console.log(`Flying to ${target.label}`);
        flyTo([target.lng, target.lat]);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flyTo]);

  const satelliteMapStyle = useMemo(() => {
    return {
      version: 8,
      sources: {
        "mapbox-satellite": {
          type: "raster",
          tiles: [
            `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`,
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
    } as StyleSpecification;
  }, []);

  // Add a debug div to show the current coordinates and behavior IDs
  const debugInfo = (
    <div className="fixed bottom-4 left-4 bg-white bg-opacity-80 p-2 rounded text-xs z-30">
      <div>
        Click Coords:{" "}
        {clickedCoords
          ? `${clickedCoords.lng.toFixed(6)}, ${clickedCoords.lat.toFixed(6)}`
          : "None"}
      </div>
      <div>Selected Robots: {selectedRobotIds.length}</div>
      <div>
        Current Behavior:{" "}
        {convertBehaviorTypeToReadable(state.selectedBehavior)}
      </div>
      <div>Active Behaviors: {state.currentBehaviorIds.length}</div>
      <div className="text-xs mt-1">
        IDs: {state.currentBehaviorIds.join(", ")}
      </div>
      {isCtrlPressed && (
        <div className="text-blue-600">Hold Ctrl+Drag to select robots</div>
      )}
    </div>
  );

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <DeckGL
            ref={(ref) => {
              deckRef.current = ref?.deck ?? null;
            }}
            viewState={viewState}
            views={new MapView({ repeat: false })}
            controller={isBoxSelecting ? false : true}
            layers={[...(layers ?? []), robotHitboxLayer]}
            onClick={handleClick}
            onViewStateChange={handleViewStateChange}
          >
            <Map
              ref={(el) => {
                mapRef.current = el?.getMap() || null;
              }}
              mapLib={maplibregl}
              // mapStyle={`https://api.maptiler.com/maps/satellite/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
              // mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
              mapStyle={satelliteMapStyle}
              projection="mercator"
              maxTileCacheSize={1000}
              maxTileCacheZoomLevels={3}
              refreshExpiredTiles={false}
            />
          </DeckGL>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem
            inset
            onClick={() =>
              createBehaviorDirectly(Behavior.BEHAVIOR_RALLY, {
                rallyRadiusM: 2 * selectedRobotIds.length,
              })
            }
            disabled={selectedRobotIds.length === 0}
          >
            Rally Here
          </ContextMenuItem>
          <ContextMenuItem
            inset
            onClick={() =>
              createBehaviorDirectly(Behavior.BEHAVIOR_DEFEND, {
                defendRadiusM: 2 * selectedRobotIds.length,
              })
            }
            disabled={selectedRobotIds.length === 0}
          >
            Defend Here
          </ContextMenuItem>
          <ContextMenuItem
            inset
            onClick={() =>
              createBehaviorDirectly(Behavior.BEHAVIOR_SURROUND, {
                surroundRadiusM: 2 * selectedRobotIds.length,
              })
            }
            disabled={selectedRobotIds.length === 0}
          >
            Surround This Location
          </ContextMenuItem>
          <ContextMenuItem
            inset
            onClick={() =>
              createBehaviorDirectly(Behavior.BEHAVIOR_LINE_FORMATION, {
                separationDistanceM: 5,
                lineYawDeg: 90,
                robotYawDeg: 0,
              })
            }
            disabled={selectedRobotIds.length < 2}
          >
            Form Line Here
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}
