import { EventEmitter } from "events";

// Create a shared event emitter instance
export const robotDataEmitter = new EventEmitter();

// Set a higher limit for event listeners
robotDataEmitter.setMaxListeners(20);

// Define your event types for better type safety
export interface NetworkUpdateEvent {
  robotId: string;
  table: "network";
  data: any;
  timestamp: number;
}

export interface SystemUpdateEvent {
  robotId: string;
  table: "system";
  data: any;
  timestamp: number;
}

export interface TaskUpdateEvent {
  robotId: string;
  table: "task";
  data: any;
  timestamp: number;
}

// Helper functions to subscribe to events
export function onNetworkTableUpdate(cb: (event: NetworkUpdateEvent) => void) {
  robotDataEmitter.on("networkUpdate", cb);
  return () => robotDataEmitter.off("networkUpdate", cb);
}

export function onSystemTableUpdate(cb: (event: SystemUpdateEvent) => void) {
  robotDataEmitter.on("systemUpdate", cb);
  return () => robotDataEmitter.off("systemUpdate", cb);
}

export function onTaskTableUpdate(cb: (event: TaskUpdateEvent) => void) {
  robotDataEmitter.on("taskUpdate", cb);
  return () => robotDataEmitter.off("taskUpdate", cb);
}
