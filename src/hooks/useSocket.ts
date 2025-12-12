import { useEffect, useState, useRef } from 'react';
import { socketService } from '../services/socket';
import type { IDeployment } from '../types';

// Single shared socket connection state
let sharedSocket: any = null;
let connectionListeners: Set<(connected: boolean) => void> = new Set();

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only initialize socket once globally
    if (!sharedSocket) {
      sharedSocket = socketService.connect();

      const onConnect = () => {
        connectionListeners.forEach(listener => listener(true));
      };

      const onDisconnect = () => {
        connectionListeners.forEach(listener => listener(false));
      };

      sharedSocket.on('connect', onConnect);
      sharedSocket.on('disconnect', onDisconnect);

      // Initial check
      setTimeout(() => {
        connectionListeners.forEach(listener => listener(sharedSocket.connected));
      }, 0);
    }

    // Subscribe this component to connection updates
    connectionListeners.add(setIsConnected);

    // Set initial state
    setIsConnected(sharedSocket?.connected || false);

    return () => {
      // Unsubscribe when component unmounts
      connectionListeners.delete(setIsConnected);
    };
  }, []);

  return { isConnected, socket: sharedSocket };
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

    socket.on('deployment:updated', handleUpdate);
    socket.on('deployment:completed', handleComplete);

    return () => {
      socket.off('deployment:updated', handleUpdate);
      socket.off('deployment:completed', handleComplete);
    };
  }, [socket, onUpdate, onComplete]);
};
