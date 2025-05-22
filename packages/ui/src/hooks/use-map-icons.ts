import { type RefObject, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import gsap from "gsap";
import { useRobotSelection } from "@/providers/robot-selection-provider";
import { type Robot } from "@/types/robot";

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
  const markersMapRef = useRef<
    Map<
      string,
      {
        icon: maplibregl.Marker;
        label: maplibregl.Marker;
        animation: gsap.core.Tween | null;
      }
    >
  >(new Map());

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !iconMarkersRef || !labelMarkersRef) return;

    iconMarkersRef.current = [];
    labelMarkersRef.current = [];

    const processedRobots = new Set<string>();

    robots.forEach((robot) => {
      const robotId = robot.robotId;
      processedRobots.add(robotId);

      const newLng = robot?.gpsCoordinates?.longitude ?? 0;
      const newLat = robot?.gpsCoordinates?.latitude ?? 0;
      const newHeading = robot?.heading ?? 0;

      let markerEntry = markersMapRef.current.get(robotId);

      if (markerEntry) {
        const iconMarker = markerEntry.icon;
        const labelMarker = markerEntry.label;

        if (markerEntry.animation) {
          markerEntry.animation.kill();
        }

        const currentPos = iconMarker.getLngLat();

        if (
          Math.abs(currentPos.lng - newLng) > 0.0000001 ||
          Math.abs(currentPos.lat - newLat) > 0.0000001
        ) {
          const pos = {
            lng: currentPos.lng,
            lat: currentPos.lat,
            heading: parseFloat(
              iconMarker
                .getElement()
                .querySelector("svg")
                ?.style.transform.match(/rotate\(([^)]+)\)/)?.[1] || "0"
            ),
          };

          let targetHeading = newHeading;
          const currentHeading = pos.heading;
          const diff = (((targetHeading - currentHeading) % 360) + 360) % 360;
          if (diff > 180) {
            targetHeading = currentHeading - (360 - diff);
          } else {
            targetHeading = currentHeading + diff;
          }

          const animation = gsap.to(pos, {
            lng: newLng,
            lat: newLat,
            heading: targetHeading,
            duration: 0.2,

            onUpdate: () => {
              iconMarker.setLngLat([pos.lng, pos.lat]);
              labelMarker.setLngLat([pos.lng, pos.lat]);

              const iconEl = iconMarker.getElement();
              const svg = iconEl.querySelector("svg");
              if (svg) {
                svg.style.transform = `rotate(${pos.heading}deg)`;
              }
            },
          });

          markerEntry.animation = animation;
        }

        const iconEl = iconMarker.getElement();
        const path = iconEl.querySelector("path");
        if (path) {
          path.setAttribute(
            "stroke",
            selectedRobotIds.includes(robotId) ? "#f90" : "#fff"
          );
        }

        iconMarkersRef.current.push(iconMarker);
        labelMarkersRef.current.push(labelMarker);
      } else {
        const iconEl = document.createElement("div");
        iconEl.innerHTML = `
          <svg
            width="26"
            height="26"
            viewBox="0 0 370 450"
            xmlns="http://www.w3.org/2000/svg"
            style="transform-origin: center; transform: rotate(${newHeading}deg); filter: drop-shadow(0px 0px 6px rgba(0, 0, 0, 0.2));"
          >
            <path
              d="M185.5 7L363.5 446.5L185.5 321M184.5 7L6.5 446.5L184.5 321"
              stroke="${
                selectedRobotIds.includes(robotId) ? "#c48a2d00" : "#fff"
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
        labelEl.textContent = robotId ?? `Robot ${robots.indexOf(robot) + 1}`;

        const iconMarker = new maplibregl.Marker({
          element: iconEl,
          pitchAlignment: "map",
          rotationAlignment: "map",
          anchor: "center",
        })
          .setLngLat([newLng, newLat])
          .addTo(map);

        const labelMarker = new maplibregl.Marker({
          element: labelEl,
          pitchAlignment: "viewport",
          rotationAlignment: "viewport",
          offset: [0, 30],
        })
          .setLngLat([newLng, newLat])
          .addTo(map);

        markersMapRef.current.set(robotId, {
          icon: iconMarker,
          label: labelMarker,
          animation: null,
        });

        iconMarkersRef.current.push(iconMarker);
        labelMarkersRef.current.push(labelMarker);
      }
    });

    markersMapRef.current.forEach((entry, robotId) => {
      if (!processedRobots.has(robotId)) {
        if (entry.animation) {
          entry.animation.kill();
        }
        entry.icon.remove();
        entry.label.remove();
        markersMapRef.current.delete(robotId);
      }
    });
  }, [
    robots,
    iconMarkersRef,
    labelMarkersRef,
    mapRef,
    onIconClick,
    selectedRobotIds,
  ]);

  useEffect(() => {
    return () => {
      markersMapRef.current.forEach((entry) => {
        if (entry.animation) {
          entry.animation.kill();
        }
        entry.icon.remove();
        entry.label.remove();
      });
      markersMapRef.current.clear();
    };
  }, []);
}
