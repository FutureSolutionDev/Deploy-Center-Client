import { io, Socket } from "socket.io-client";
import { Config } from "@/utils/config";
import AuthService from "@/services/authService";

type TJoinEvent = "join:project" | "join:deployment";

interface IJoinAck {
  Ok: boolean;
  Error?: string;
}

/**
 * Socket.IO client.
 *
 * Since v3.0.1 the server authenticates the handshake with the httpOnly
 * `access_token` cookie (sent because of `withCredentials`) and authorizes
 * every room join. The user room is joined by the server automatically.
 *
 * - Rooms joined through this service are remembered and re-joined after every
 *   reconnect, so live logs keep flowing after a network blip.
 * - If the handshake is rejected (expired access token), the service refreshes
 *   the session once and reconnects.
 */
class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private readonly rooms = new Map<string, { event: TJoinEvent; id: number }>();
  private lastRefreshAttempt = 0;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(): Socket {
    if (this.socket) {
      if (!this.socket.connected && !this.socket.active) {
        this.socket.connect();
      }
      return this.socket;
    }

    this.socket = io(Config.Socket.Url, {
      withCredentials: true,
      autoConnect: true,
      path: Config.Socket.Path,
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      this.rejoinRooms();
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      // `active` is false when the server middleware refused the handshake;
      // socket.io will not retry on its own in that case.
      if (this.socket && !this.socket.active) {
        void this.refreshAndReconnect();
      }
    });

    return this.socket;
  }

  public disconnect(): void {
    this.rooms.clear();
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public joinProject(projectId: number): void {
    this.join("join:project", projectId);
  }

  public joinDeployment(deploymentId: number): void {
    this.join("join:deployment", deploymentId);
  }

  private join(event: TJoinEvent, id: number): void {
    const key = `${event}:${id}`;
    this.rooms.set(key, { event, id });
    this.socket?.emit(event, id, (ack?: IJoinAck) => {
      if (ack && !ack.Ok) {
        this.rooms.delete(key);
      }
    });
  }

  private rejoinRooms(): void {
    this.rooms.forEach(({ event, id }) => {
      this.socket?.emit(event, id);
    });
  }

  private async refreshAndReconnect(): Promise<void> {
    const now = Date.now();
    if (now - this.lastRefreshAttempt < 30000) return;
    this.lastRefreshAttempt = now;
    try {
      await AuthService.RefreshToken();
      this.socket?.connect();
    } catch {
      // Session is gone; the HTTP layer will redirect to login.
    }
  }
}

export const socketService = SocketService.getInstance();
