import { useEffect, useState, useRef, useCallback } from "react";

type UseTeleopControls = (
  frequency: number,
  sendCommand: (throttle: number, steering: number) => void,
  stepSize?: number,
  shiftThrottleCap?: number,
  maxThrottle?: number,
  maxSteering?: number
) => {
  throttle: number;
  steering: number;
  resetControls: () => void;
};

export const useTeleopControls: UseTeleopControls = (
  frequency,
  sendCommand,
  stepSize = 0.2,
  shiftThrottleCap = 0.4,
  maxThrottle = 1,
  maxSteering = 1
) => {
  const [throttle, setThrottle] = useState(0);
  const [steering, setSteering] = useState(0);

  const throttleRef = useRef(0);
  const steeringRef = useRef(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const intervalRef = useRef<number | null>(null);
  const isMoving = useRef(false);

  const resetControls = useCallback(() => {
    throttleRef.current = 0;
    steeringRef.current = 0;
    setThrottle(0);
    setSteering(0);
    sendCommand(0, 0);
    isMoving.current = false;
  }, [sendCommand]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.key);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key);
    };

    const updateControls = () => {
      let newThrottle = 0;
      let newSteering = 0;

      const isShiftHeld = keysPressed.current.has("Shift");

      if (keysPressed.current.has("w") || keysPressed.current.has("ArrowUp")) {
        newThrottle = Math.min(
          throttleRef.current + stepSize,
          isShiftHeld ? shiftThrottleCap : maxThrottle
        );
      } else if (
        keysPressed.current.has("s") ||
        keysPressed.current.has("ArrowDown")
      ) {
        newThrottle = Math.max(
          throttleRef.current - stepSize,
          isShiftHeld ? -shiftThrottleCap : -maxThrottle
        );
      }

      if (
        keysPressed.current.has("a") ||
        keysPressed.current.has("ArrowLeft")
      ) {
        newSteering = Math.max(steeringRef.current - stepSize, -maxSteering);
      } else if (
        keysPressed.current.has("d") ||
        keysPressed.current.has("ArrowRight")
      ) {
        newSteering = Math.min(steeringRef.current + stepSize, maxSteering);
      }

      const changed =
        newThrottle !== throttleRef.current ||
        newSteering !== steeringRef.current;

      throttleRef.current = newThrottle;
      steeringRef.current = newSteering;
      setThrottle(newThrottle);
      setSteering(newSteering);

      if (newThrottle !== 0 || newSteering !== 0) {
        sendCommand(newThrottle, newSteering);
        isMoving.current = true;
      } else if (changed && isMoving.current) {
        sendCommand(0, 0); // Stop signal
        isMoving.current = false;
      }
    };

    intervalRef.current = window.setInterval(updateControls, frequency);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    sendCommand,
    frequency,
    stepSize,
    shiftThrottleCap,
    maxThrottle,
    maxSteering,
  ]);

  return {
    throttle,
    steering,
    resetControls,
  };
};
