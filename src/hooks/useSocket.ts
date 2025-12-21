import { useEffect, useState } from "react";
import { socketService } from "../services/socket";
import type { IDeployment } from "../types";

// Single shared socket connection state - managed by SocketService
const ConnectionListeners: Set<(connected: boolean) => void> = new Set();

export const useSocket = () => {
  // socketService is a singleton, so .connect() will return the same instance
  const socket = socketService.connect();

  const [IsConnected, SetIsConnected] = useState(
    () => socket.connected || false
  );

  useEffect(() => {
    const onConnect = () => {
      ConnectionListeners.forEach((listener) => listener(true));
    };

    const onDisconnect = () => {
      ConnectionListeners.forEach((listener) => listener(false));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Initial check
    setTimeout(() => {
      ConnectionListeners.forEach((listener) => listener(socket.connected));
    }, 0);
    // Subscribe this component to connection updates
    ConnectionListeners.add(SetIsConnected);
    // Set initial state - handled by useState initializer

    return () => {
      // Unsubscribe when component unmounts
      ConnectionListeners.delete(SetIsConnected);
    };
  }, [socket]);

  return { IsConnected, isConnected: IsConnected, socket };
};

export const useDeploymentUpdates = (projectId?: number) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !projectId) return;

    socketService.joinProject(projectId);

    return () => {
      // Optional: leave room logic if needed
    };
  }, [socket, projectId]);

  return { socket };
};

export const useDeploymentEvents = (
  onUpdate?: (deployment: IDeployment) => void,
  onComplete?: (deployment: IDeployment) => void
) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (deployment: IDeployment) => {
      if (onUpdate) onUpdate(deployment);
    };

    const handleComplete = (deployment: IDeployment) => {
      if (onComplete) onComplete(deployment);
    };

    socket.on("deployment:updated", handleUpdate);
    socket.on("deployment:completed", handleComplete);

    return () => {
      socket.off("deployment:updated", handleUpdate);
      socket.off("deployment:completed", handleComplete);
    };
  }, [socket, onUpdate, onComplete]);
};
