import { useEffect, useState } from 'react';
import { socketService } from '../services/socket';
import type { IDeployment } from '../types';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = socketService.connect();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Initial check
    setTimeout(() => {
      setIsConnected(socket.connected);
    }, 0);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return { isConnected, socket: socketService.getSocket() };
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
