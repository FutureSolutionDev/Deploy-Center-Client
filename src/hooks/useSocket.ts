/**
 * useSocket Hook
 * Custom hook for using WebSocket in components
 */

import { useEffect } from 'react';
import SocketService, { type TSocketEvent } from '@/services/socketService';

export const useSocket = (event: TSocketEvent, callback: (data: any) => void, deps: any[] = []) => {
  useEffect(() => {
    // Subscribe to event
    const unsubscribe = SocketService.on(event, callback);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [event, ...deps]);
};

export const useSocketConnection = () => {
  useEffect(() => {
    // Connect on mount
    SocketService.connect();

    // Disconnect on unmount
    return () => {
      SocketService.disconnect();
    };
  }, []);

  return {
    isConnected: SocketService.isConnected(),
    emit: SocketService.emit.bind(SocketService),
  };
};

export default useSocket;
