// robot-path-provider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
  useEffect,
} from "react";
import isEqual from "lodash/isEqual";

// Define types
type Coordinate = [number, number]; // [latitude, longitude] as you confirmed
type RobotPaths = Record<string, Coordinate[]>;

interface GeoPath {
  poses?: {
    pose?: {
      position?: {
        longitude: number;
        latitude: number;
      };
    };
  }[];
}

interface RobotPathContextType {
  robotPaths: RobotPaths;
  updateRobotPath: (robotId: string, geoPath: GeoPath) => void;
}

// Create context
const RobotPathContext = createContext<RobotPathContextType | null>(null);

// Provider component
export function RobotPathProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const [robotPaths, setRobotPaths] = useState<RobotPaths>({});

  // Use ref to avoid dependency cycles in the callback
  const robotPathsRef = useRef<RobotPaths>(robotPaths);

  // Also track the last update time to throttle updates
  const lastUpdateRef = useRef<Record<string, number>>({});

  // Update ref when state changes
  useEffect(() => {
    robotPathsRef.current = robotPaths;
  }, [robotPaths]);

  const updateRobotPath = useCallback(
    (robotId: string, geoPath: GeoPath): void => {
      if (!geoPath?.poses || !Array.isArray(geoPath.poses)) {
        return;
      }

      // Throttle updates - only process once per 300ms per robot
      const now = Date.now();
      const lastUpdate = lastUpdateRef.current[robotId] || 0;
      if (now - lastUpdate < 300) {
        return;
      }
      lastUpdateRef.current[robotId] = now;

      const newCoordinates = geoPath.poses
        .filter((pose) => pose.pose?.position)
        .map((pose) => {
          if (!pose.pose?.position) return [0, 0] as Coordinate;
          return [
            pose.pose.position.longitude,
            pose.pose.position.latitude,
          ] as Coordinate;
        });

      // Minimum points check - don't update with empty paths
      if (newCoordinates.length === 0) {
        return;
      }

      // Access current paths from ref to avoid dependency on robotPaths
      const currentPaths = robotPathsRef.current;

      // Skip update if coordinates haven't changed
      if (isEqual(currentPaths[robotId], newCoordinates)) {
        return;
      }

      // Important: Update state by merging with existing paths
      // This keeps other robot paths and only updates this robot's path
      setRobotPaths((prev) => ({
        ...prev, // Keep other robots' paths
        [robotId]: newCoordinates,
      }));
    },
    [] // No dependencies needed since we use the ref
  );

  return (
    <RobotPathContext.Provider value={{ robotPaths, updateRobotPath }}>
      {children}
    </RobotPathContext.Provider>
  );
}

// Custom hook
export function useRobotPaths(): RobotPathContextType {
  const context = useContext(RobotPathContext);
  if (!context) {
    throw new Error("useRobotPaths must be used within a RobotPathProvider");
  }
  return context;
}
