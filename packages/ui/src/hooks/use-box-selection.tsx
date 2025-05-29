import { useState, useCallback, useEffect, useRef } from "react";
import { useRobotSelection } from "@/providers/robot-selection-provider";
import { useMapContext } from "@/providers/map-provider";
import { type Robot } from "@/types/robot";
import { useRobotLocalizationStore } from "@/stores/localization-store";

export function useBoxSelection(robots: Robot[]) {
  const { deckRef } = useMapContext();
  const { selectedRobotIds, setSelectedRobotIds } = useRobotSelection();
  const { localizationTables } = useRobotLocalizationStore();

  // Selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const startCoords = useRef<{ x: number; y: number } | null>(null);

  // Track Ctrl key state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        setIsCtrlPressed(false);
        if (isSelecting) {
          endSelection();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSelecting]);

  // Create selection box element
  useEffect(() => {
    // Create if it doesn't exist
    if (!boxRef.current) {
      const box = document.createElement("div");
      box.id = "robot-selection-box";
      box.style.position = "fixed";
      box.style.border = "2px solid #fff";
      box.style.backgroundColor = "rgba(246, 246, 246, 0.2)";
      box.style.display = "none";
      box.style.pointerEvents = "none";
      box.style.zIndex = "1000";
      document.body.appendChild(box);
      boxRef.current = box;
    }

    return () => {
      if (boxRef.current) {
        document.body.removeChild(boxRef.current);
        boxRef.current = null;
      }
    };
  }, []);

  // Handle mouse down to start selection
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!isCtrlPressed || isSelecting) return;

      // Prevent default to stop map panning
      e.preventDefault();
      e.stopPropagation();

      // Start selection
      startCoords.current = { x: e.clientX, y: e.clientY };
      setIsSelecting(true);
      setSelectedRobotIds([]); // Clear previous selection

      // Update box
      const box = boxRef.current;
      if (box) {
        box.style.left = `${e.clientX}px`;
        box.style.top = `${e.clientY}px`;
        box.style.width = "0px";
        box.style.height = "0px";
        box.style.display = "block";
      }
    },
    [isCtrlPressed, isSelecting]
  );

  // Handle mouse move to update selection box
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isSelecting || !startCoords.current) return;

      // Prevent default to stop map panning
      e.preventDefault();
      e.stopPropagation();

      // Calculate dimensions
      const startX = startCoords.current.x;
      const startY = startCoords.current.y;
      const currentX = e.clientX;
      const currentY = e.clientY;

      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      // Update box
      const box = boxRef.current;
      if (box) {
        box.style.left = `${left}px`;
        box.style.top = `${top}px`;
        box.style.width = `${width}px`;
        box.style.height = `${height}px`;
      }
    },
    [isSelecting]
  );

  // Handle mouse up to end selection
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!isSelecting) return;

      endSelection();

      // Prevent default
      e.preventDefault();
      e.stopPropagation();
    },
    [isSelecting]
  );

  // Function to end selection and select robots
  const endSelection = useCallback(() => {
    if (!isSelecting || !startCoords.current || !boxRef.current) {
      setIsSelecting(false);
      startCoords.current = null;
      if (boxRef.current) {
        boxRef.current.style.display = "none";
      }
      return;
    }

    // Get box coordinates
    const box = boxRef.current.getBoundingClientRect();

    if (deckRef.current && box.width > 5 && box.height > 5) {
      // Convert screen to world coordinates
      const viewports = deckRef.current.getViewports();

      if (viewports.length > 0) {
        const viewport = viewports[0];

        // Get screen coordinates for each corner
        const topLeft = viewport?.unproject([box.left, box.top]);
        const bottomRight = viewport?.unproject([box.right, box.bottom]);

        // Ensure both corners are valid arrays of numbers
        if (
          Array.isArray(topLeft) &&
          Array.isArray(bottomRight) &&
          topLeft.length >= 2 &&
          bottomRight.length >= 2 &&
          typeof topLeft[0] === "number" &&
          typeof topLeft[1] === "number" &&
          typeof bottomRight[0] === "number" &&
          typeof bottomRight[1] === "number"
        ) {
          // Create bounds
          const minLng = Math.min(topLeft[0], bottomRight[0]);
          const maxLng = Math.max(topLeft[0], bottomRight[0]);
          const minLat = Math.min(topLeft[1], bottomRight[1]);
          const maxLat = Math.max(topLeft[1], bottomRight[1]);

          // Find robots in the box
          const robotsInBox = Object.entries(localizationTables).filter(
            ([robotId, localizationTable]) => {
              const lng =
                localizationTable?.localization_data?.gpsCoordinate
                  ?.longitude ?? 0;
              const lat =
                localizationTable?.localization_data?.gpsCoordinate?.latitude ??
                0;

              return (
                lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat
              );
            }
          );

          // Add to selection
          if (robotsInBox.length > 0) {
            const newIds = robotsInBox.map(([robotId]) => robotId);

            const combinedSelection = new Set([...selectedRobotIds, ...newIds]);
            setSelectedRobotIds(Array.from(combinedSelection));
          }
        }
      }
    }

    // Reset state
    setIsSelecting(false);
    startCoords.current = null;
    if (boxRef.current) {
      boxRef.current.style.display = "none";
    }
  }, [isSelecting, robots, selectedRobotIds, setSelectedRobotIds, deckRef]);

  // Set up event listeners
  useEffect(() => {
    // Add event listeners directly to document
    const options = { capture: true };

    document.addEventListener("mousedown", handleMouseDown, options);
    document.addEventListener("mousemove", handleMouseMove, options);
    document.addEventListener("mouseup", handleMouseUp, options);

    // Update cursor on deck canvas
    const updateCursor = () => {
      const deckCanvas = document.querySelector(".deck-canvas");
      if (deckCanvas && deckCanvas instanceof HTMLElement) {
        deckCanvas.style.cursor = isCtrlPressed ? "crosshair" : "";
      }
    };

    // Update initially and when ctrl status changes
    updateCursor();

    return () => {
      document.removeEventListener("mousedown", handleMouseDown, options);
      document.removeEventListener("mousemove", handleMouseMove, options);
      document.removeEventListener("mouseup", handleMouseUp, options);

      // Reset cursor
      const deckCanvas = document.querySelector(".deck-canvas");
      if (deckCanvas && deckCanvas instanceof HTMLElement) {
        deckCanvas.style.cursor = "";
      }
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, isCtrlPressed]);

  return {
    isBoxSelecting: isSelecting,
    isCtrlPressed,
  };
}
