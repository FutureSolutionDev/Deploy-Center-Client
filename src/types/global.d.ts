/* eslint-disable @typescript-eslint/naming-convention */
// Global declarations for browser window Config injected via public/Config.js
export {};

declare global {
  interface Window {
    Config?: {
      API_URL?: string;
      SOCKET_URL?: string;
    };
  }
}
