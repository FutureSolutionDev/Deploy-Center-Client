/**
 * Application Configuration
 * Centralized configuration for the Deploy Center frontend
 */

export const Config = {
  // API Configuration
  Api: {
    BaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    Timeout: 30000,
  },
  // Authentication
  Auth: {
    TokenKey: 'deploy_center_access_token',
    RefreshTokenKey: 'deploy_center_refresh_token',
    UserKey: 'deploy_center_user',
  },

  // Application
  App: {
    Name: 'Deploy Center',
    Version: '2.0.0',
    DefaultLanguage: 'en' as const,
    DefaultTheme: 'blue' as const,
  },
  // Pagination
  Pagination: {
    DefaultPageSize: 10,
    PageSizeOptions: [5, 10, 20, 50, 100],
  },
  // Real-time
  Socket: {
    Url: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
    Path: "/v1/ws",
    ReconnectAttempts: 5,
    ReconnectDelay: 3000,
  },

  // File Upload
  Upload: {
    MaxSize: 10 * 1024 * 1024, // 10MB
    AllowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
};

export default Config;
