/**
 * useSocket Hook
 * Custom hook for using WebSocket in components
 */

import { useEffect } from 'react';
import SocketService, { type TSocketEvent } from '@/services/socketService';

export const useSocket = (event: TSocketEvent, callback: (data: unknown) => void, _deps: unknown[] = []) => {
  useEffect(() => {
    // Subscribe to event
    const unsubscribe = SocketService.on(event, callback);
    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [callback, event]);
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
