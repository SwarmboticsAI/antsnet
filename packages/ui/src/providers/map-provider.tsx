import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  type ReactNode,
  useMemo,
  useEffect,
} from "react";
import type { Robot } from "@/types/robot";
import {
  Deck,
  MapView,
  type MapViewState,
  TransitionInterpolator,
} from "@deck.gl/core";
import maplibregl from "maplibre-gl";

export enum MapInteractionMode {
  VIEWING = "viewing",
  SELECTING = "selecting",
  DRAWING_POINTS = "points",
  DRAWING_POLYGON = "polygon",
  DRAWING_PERIMETER = "perimeter",
  SELECTING_CENTER = "center",
}

export type ExtendedViewState = MapViewState & {
  transitionDuration?: number | "auto";
  transitionInterpolator?: TransitionInterpolator;
};

interface MapContextType {
  mapRef: React.MutableRefObject<maplibregl.Map | null>;
  deckRef: React.MutableRefObject<Deck<MapView> | null>;
  viewState: ExtendedViewState;
  setViewState: React.Dispatch<React.SetStateAction<ExtendedViewState>>;

  flyTo: (latlng: [number, number], zoomOverride?: number) => void;
  flyToRobot: (robot: Robot) => void;

  interactionMode: MapInteractionMode;
  setInteractionMode: (mode: MapInteractionMode) => void;

  handleMapClick: (latlng: [number, number]) => void;
  setMapClickHandler: (
    handler: ((latlng: [number, number]) => void) | null
  ) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context)
    throw new Error("useMapContext must be used within MapProvider");
  return context;
};

interface MapProviderProps {
  children: ReactNode;
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

export function MapProvider({
  children,
  defaultCenter = [-112.08365947592912, 33.680302327452466],
  defaultZoom = 18,
}: MapProviderProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const deckRef = useRef<Deck<MapView> | null>(null);

  const [viewState, setViewState] = useState<ExtendedViewState>({
    longitude: defaultCenter[0],
    latitude: defaultCenter[1],
    zoom: defaultZoom,
    pitch: 10,
    bearing: 0,
  });

  const [interactionMode, setInteractionMode] = useState<MapInteractionMode>(
    MapInteractionMode.VIEWING
  );

  const [mapClickHandler, setMapClickHandler] = useState<
    ((latlng: [number, number]) => void) | null
  >(null);

  const flyTo = useCallback(
    (latlng: [number, number], zoomOverride?: number) => {
      deckRef.current?.setProps({
        viewState: {
          ...viewState,
          longitude: latlng[0],
          latitude: latlng[1],
          zoom: zoomOverride ?? viewState.zoom,
          transitionDuration: 1000,
        },
      });
    },
    [viewState.zoom, viewState.pitch, viewState.bearing]
  );

  const flyToRobot = useCallback(
    (robot: Robot) => {
      if (!robot?.gpsCoordinates) return;
      flyTo([
        robot.gpsCoordinates.longitude ?? 0,
        robot.gpsCoordinates.latitude ?? 0,
      ]);
    },
    [flyTo]
  );

  const handleMapClick = useCallback(
    (latlng: [number, number]) => {
      mapClickHandler?.(latlng);
    },
    [mapClickHandler]
  );

  useEffect(() => {
    if (!deckRef) return;
    const canvas = deckRef.current?.getCanvas();

    switch (interactionMode) {
      case MapInteractionMode.SELECTING:
        if (canvas) {
          canvas.style.cursor = "pointer";
        }

        break;
      case MapInteractionMode.DRAWING_POINTS:
      case MapInteractionMode.DRAWING_PERIMETER:
      case MapInteractionMode.DRAWING_POLYGON:
        if (canvas) {
          canvas.style.cursor = "crosshair";
        }

        break;
      case MapInteractionMode.VIEWING:
      default:
        if (canvas) {
          canvas.style.cursor = "default";
        }
        break;
    }
  }, [deckRef, interactionMode]);

  const contextValue = useMemo<MapContextType>(
    () => ({
      mapRef,
      deckRef,
      viewState,
      setViewState,
      flyTo,
      flyToRobot,
      interactionMode,
      setInteractionMode,
      handleMapClick,
      setMapClickHandler,
    }),
    [
      mapRef,
      deckRef,
      viewState,
      flyTo,
      flyToRobot,
      interactionMode,
      handleMapClick,
      setMapClickHandler,
    ]
  );

  return (
    <MapContext.Provider value={contextValue}>{children}</MapContext.Provider>
  );
}
