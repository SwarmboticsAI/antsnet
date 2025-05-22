import { useEffect } from "react";

// Manages multiple WebSocket connections by URL
class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private connectionAttempts: Map<string, boolean> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();

  // Get or create a connection for a specific URL
  public getConnection(url: string): WebSocket | null {
    if (this.connections.has(url)) {
      const ws = this.connections.get(url)!;
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        return ws;
      }
    }

    this.ensureConnection(url);
    return this.connections.get(url) || null;
  }

  // Register a listener for a specific connection
  public addListener(url: string, listener: (data: any) => void): void {
    if (!this.listeners.has(url)) {
      this.listeners.set(url, new Set());
    }
    this.listeners.get(url)!.add(listener);
    this.ensureConnection(url);
  }

  // Remove a listener from a specific connection
  public removeListener(url: string, listener: (data: any) => void): void {
    if (!this.listeners.has(url)) return;

    const urlListeners = this.listeners.get(url)!;
    urlListeners.delete(listener);

    // If no more listeners for this URL, close the connection
    if (urlListeners.size === 0) {
      this.closeConnection(url);
    }
  }

  // Check if a specific connection is active
  public isConnected(url: string): boolean {
    const ws = this.connections.get(url);
    return ws !== undefined && ws.readyState === WebSocket.OPEN;
  }

  // Manually close a connection
  public closeConnection(url: string): void {
    const ws = this.connections.get(url);
    if (ws) {
      try {
        ws.close();
      } catch (e) {
        console.error(`Error closing WebSocket for ${url}:`, e);
      }
      this.connections.delete(url);
    }

    // Clear any reconnect timeouts
    if (this.reconnectTimeouts.has(url)) {
      clearTimeout(this.reconnectTimeouts.get(url)!);
      this.reconnectTimeouts.delete(url);
    }
  }

  // Ensure a connection exists and is properly set up
  private ensureConnection(url: string): void {
    // Avoid creating multiple connections simultaneously
    if (this.connectionAttempts.get(url)) {
      return;
    }

    // Close any existing connection that might be in a bad state
    if (this.connections.has(url)) {
      const existingWs = this.connections.get(url)!;
      if (
        existingWs.readyState !== WebSocket.OPEN &&
        existingWs.readyState !== WebSocket.CONNECTING
      ) {
        this.closeConnection(url);
      } else {
        return; // Connection is fine, no need to create a new one
      }
    }

    this.connectionAttempts.set(url, true);

    // Create new connection
    const ws = new WebSocket(url);
    this.connections.set(url, ws);

    ws.onopen = () => {
      console.log(`WebSocket connected: ${url}`);
      this.connectionAttempts.set(url, false);
    };

    ws.onclose = () => {
      console.log(`WebSocket connection closed: ${url}`);
      this.connectionAttempts.set(url, false);
      this.connections.delete(url);

      // Reconnect if we still have listeners
      if (this.listeners.has(url) && this.listeners.get(url)!.size > 0) {
        const timeout = setTimeout(() => {
          this.ensureConnection(url);
        }, 2000);

        this.reconnectTimeouts.set(url, timeout);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${url}:`, error);
      this.connectionAttempts.set(url, false);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Notify all listeners for this URL
        if (this.listeners.has(url)) {
          this.listeners.get(url)!.forEach((listener) => listener(data));
        }
      } catch (error) {
        console.error(`Error processing WebSocket message from ${url}:`, error);
      }
    };
  }
}

// Singleton instance
export const webSocketManager = new WebSocketManager();

// Custom hook for using the WebSocket manager
export function useWebSocket(url: string, onMessage: (data: any) => void) {
  useEffect(() => {
    // Register listener
    webSocketManager.addListener(url, onMessage);

    // Clean up when component unmounts
    return () => {
      webSocketManager.removeListener(url, onMessage);
    };
  }, [url, onMessage]);

  return {
    isConnected: () => webSocketManager.isConnected(url),
    closeConnection: () => webSocketManager.closeConnection(url),
  };
}
