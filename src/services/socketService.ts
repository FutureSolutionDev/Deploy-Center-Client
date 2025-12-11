/**
 * WebSocket Service
 * Handles real-time updates via Socket.IO
 */

import { io, Socket } from "socket.io-client";
import { Config } from "@/utils/config";
import Cookies from "js-cookie";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  /**
   * Initialize Socket.IO connection
   */
  public connect(): void {
    if (this.socket?.connected) {
      return;
    }

    // Get auth token from cookie
    const token = Cookies.get("auth_token");

    this.socket = io(Config.Socket.Url, {
      auth: {
        token,
      },
      path: Config.Socket.Path,
      reconnection: true,
      reconnectionAttempts: Config.Socket.ReconnectAttempts,
      reconnectionDelay: Config.Socket.ReconnectDelay,
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Listen for all registered events
    this.listeners.forEach((callbacks, event) => {
      this.socket?.on(event, (data) => {
        callbacks.forEach((callback) => callback(data));
      });
    });
  }

  /**
   * Disconnect Socket.IO
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribe to an event
   */
  public on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Also register with socket if already connected
    if (this.socket?.connected) {
      this.socket.on(event, callback);
    }

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Unsubscribe from an event
   */
  public off(event: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Emit an event
   */
  public emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Socket not connected, cannot emit event:", event);
    }
  }

  /**
   * Check if socket is connected
   */
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance
   */
  public getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export default new SocketService();

// Event types
export const SocketEvents = {
  // Deployment events
  DeploymentStarted: "deployment:started",
  DeploymentProgress: "deployment:progress",
  DeploymentCompleted: "deployment:completed",
  DeploymentFailed: "deployment:failed",
  DeploymentCancelled: "deployment:cancelled",
  // Project events
  ProjectCreated: "project:created",
  ProjectUpdated: "project:updated",
  ProjectDeleted: "project:deleted",
  // Log events
  LogUpdate: "log:update",
  // System events
  Notification: "notification",
} as const;

export type TSocketEvent = (typeof SocketEvents)[keyof typeof SocketEvents];
