import { io, Socket } from 'socket.io-client';
import { Config } from '@/utils/config';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(Config.Socket.Url, {
      withCredentials: true,
      autoConnect: true,
      path: Config.Socket.Path,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      // Connected
    });

    this.socket.on('disconnect', () => {
      // Disconnected
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public joinProject(projectId: number): void {
    this.socket?.emit('join:project', projectId);
  }

  public joinDeployment(deploymentId: number): void {
    this.socket?.emit('join:deployment', deploymentId);
  }
}

export const socketService = SocketService.getInstance();
