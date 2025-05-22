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
  // Use refs for all state that affects rendering
  const throttleRef = useRef(0);
  const steeringRef = useRef(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const intervalId = useRef<number | null>(null);

  // State for UI updates
  const [throttle, setThrottle] = useState(0);
  const [steering, setSteering] = useState(0);

  const resetControls = useCallback(() => {
    throttleRef.current = 0;
    steeringRef.current = 0;
    setThrottle(0);
    setSteering(0);

    // Send a stop command when resetting
    sendCommand(0, 0);
  }, [sendCommand]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default behaviors for control keys
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(event.key)
      ) {
        event.preventDefault();
      }

      keysPressed.current.add(event.key);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key);

      // If no movement keys are pressed, immediately send a stop command
      if (
        ![
          "w",
          "a",
          "s",
          "d",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].some((key) => keysPressed.current.has(key))
      ) {
        // Stop immediately on key release
        throttleRef.current = 0;
        steeringRef.current = 0;
        sendCommand(0, 0);
        setThrottle(0);
        setSteering(0);
      }
    };

    const updateControls = () => {
      let newThrottle = throttleRef.current;
      let newSteering = steeringRef.current;

      const isShiftHeld = keysPressed.current.has("Shift");
      const maxThrottleValue = isShiftHeld ? shiftThrottleCap : maxThrottle;

      // Calculate new throttle with gradual steps up but immediate return to zero
      if (keysPressed.current.has("w") || keysPressed.current.has("ArrowUp")) {
        newThrottle = Math.min(newThrottle + stepSize, maxThrottleValue);
      } else if (
        keysPressed.current.has("s") ||
        keysPressed.current.has("ArrowDown")
      ) {
        newThrottle = Math.max(newThrottle - stepSize, -maxThrottleValue);
      } else if (newThrottle !== 0) {
        // Immediate return to zero
        newThrottle = 0;
      }

      // Calculate new steering with gradual steps up but immediate return to zero
      if (
        keysPressed.current.has("a") ||
        keysPressed.current.has("ArrowLeft")
      ) {
        newSteering = Math.max(newSteering - stepSize, -maxSteering);
      } else if (
        keysPressed.current.has("d") ||
        keysPressed.current.has("ArrowRight")
      ) {
        newSteering = Math.min(newSteering + stepSize, maxSteering);
      } else if (newSteering !== 0) {
        // Immediate return to zero
        newSteering = 0;
      }

      // Always update and send commands at the specified frequency
      // This sacrifices some bandwidth but provides more consistent control
      throttleRef.current = newThrottle;
      steeringRef.current = newSteering;
      setThrottle(newThrottle);
      setSteering(newSteering);
      sendCommand(newThrottle, newSteering);
    };

    // Use a higher frequency for more responsive controls
    // This provides smoother control at the cost of more network traffic
    const adjustedFrequency = Math.max(frequency, 20); // Minimum 20Hz for responsive control
    intervalId.current = window.setInterval(
      updateControls,
      1000 / adjustedFrequency
    );

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [
    frequency,
    stepSize,
    shiftThrottleCap,
    maxThrottle,
    maxSteering,
    sendCommand,
  ]);

  return {
    throttle,
    steering,
    resetControls,
  };
};
