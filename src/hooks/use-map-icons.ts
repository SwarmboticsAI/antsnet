import { Robot } from "@/types/Robot";
import { RefObject, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { useRobotSelection } from "@/providers/robot-selection-provider";

export function useMapIcons({
  mapRef,
  iconMarkersRef,
  labelMarkersRef,
  robots,
  onIconClick,
}: {
  mapRef: RefObject<maplibregl.Map | null>;
  iconMarkersRef?: RefObject<maplibregl.Marker[]>;
  labelMarkersRef?: RefObject<maplibregl.Marker[]>;
  robots: Robot[];
  onIconClick?: (robot: Robot) => void;
}) {
  const { selectedRobotIds } = useRobotSelection();

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !iconMarkersRef || !labelMarkersRef) return;

    // Clear existing markers
    iconMarkersRef?.current.forEach((marker) => marker.remove());
    iconMarkersRef.current = [];

    labelMarkersRef.current?.forEach((marker) => marker.remove());
    labelMarkersRef.current = [];

    // Add markers for each robot
    robots.forEach((robot) => {
      // Create icon element
      const iconEl = document.createElement("div");

      const adjustedHeading = robot?.heading ?? 0;

      iconEl.innerHTML = `
          <svg
            width="26"
            height="26"
            viewBox="0 0 370 450"
            xmlns="http://www.w3.org/2000/svg"
            style="transform-origin: center; transform: rotate(${adjustedHeading}deg); filter: drop-shadow(0px 0px 6px rgba(0, 0, 0, 0.2));"
          >
            <path
              d="M185.5 7L363.5 446.5L185.5 321M184.5 7L6.5 446.5L184.5 321"
              stroke="${
                selectedRobotIds.includes(robot.robotId) ? "#ff0" : "#fff"
              }"
              stroke-width="38"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="rgba(23, 90, 230, 0.6)"
            />
          </svg>
        `;

      iconEl.addEventListener("click", () => {
        onIconClick?.(robot);
      });

      // Create label element
      const labelEl = document.createElement("div");
      labelEl.style.cssText = `
          color: white;
          background-color: rgba(0,0,0,0.05);
          padding: 0px 8px;
          border-radius: 2px;
          font-size: 11px;
          letter-spacing: 1px; /* for better readability */
          font-weight: 500;
          text-transform: uppercase;
          white-space: nowrap;
          transform: translate(-50%, -5px);
          pointer-events: none;
          text-align: center;
        `;
      labelEl.textContent =
        robot?.robotId ?? `Robot ${robots.indexOf(robot) + 1}`;

      // Add icon marker (aligned with map orientation)
      const iconMarker = new maplibregl.Marker({
        element: iconEl,
        pitchAlignment: "map",
        rotationAlignment: "map",
        anchor: "center", // Ensure the marker is anchored to its center
      })
        .setLngLat([
          robot?.gpsCoordinates?.longitude ?? 0,
          robot?.gpsCoordinates?.latitude ?? 0,
        ])
        .addTo(map);

      iconMarkersRef.current.push(iconMarker);

      // Add label marker (always facing screen, not aligned with map)
      const labelMarker = new maplibregl.Marker({
        element: labelEl,
        pitchAlignment: "viewport",
        rotationAlignment: "viewport",
        offset: [0, 30], // Offset to position below the icon
      })
        .setLngLat([
          robot?.gpsCoordinates?.longitude ?? 0,
          robot?.gpsCoordinates?.latitude ?? 0,
        ])
        .addTo(map);

      labelMarkersRef.current.push(labelMarker);
    });
  }, [
    robots,
    iconMarkersRef,
    labelMarkersRef,
    mapRef,
    onIconClick,
    selectedRobotIds,
  ]);
}
