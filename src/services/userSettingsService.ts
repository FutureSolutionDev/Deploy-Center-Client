import ApiInstance from './api';
import type {
  IApiKey,
  IApiKeyCreateResponse,
  INotificationSettings,
  IUser,
  IUserPreferences,
  IUserProfile,
  IUserSession,
  IUserSettings,
} from '@/types';

export const UserSettingsService = {
  // Settings
  getSettings: async (): Promise<IUserSettings> => {
    const response = await ApiInstance.get('/users/me/settings');
    return response.data.Data?.Settings;
  },

  updateNotificationSettings: async (
    settings: INotificationSettings
  ): Promise<IUserSettings> => {
    const response = await ApiInstance.put('/users/me/settings/notifications', settings);
    return response.data.Data?.Settings;
  },

  updatePreferences: async (preferences: IUserPreferences): Promise<IUserSettings> => {
    const response = await ApiInstance.put('/users/me/settings/preferences', preferences);
    return response.data.Data?.Settings;
  },

  testNotification: async (type: 'discord' | 'slack'): Promise<void> => {
    await ApiInstance.post('/users/me/settings/notifications/test', { Type: type });
  },

  // Profile
  getProfile: async (): Promise<IUserProfile> => {
    const response = await ApiInstance.get('/users/me/profile');
    return response.data.Data;
  },

  updateProfile: async (data: Partial<IUser>): Promise<IUser> => {
    const response = await ApiInstance.put('/users/me/profile', data);
    return response.data.Data?.User;
  },

  uploadAvatar: async (_file: File): Promise<string> => {
    throw new Error('Avatar upload is not implemented yet on the server');
  },

  changePassword: async (current: string, newPassword: string): Promise<void> => {
    await ApiInstance.put('/users/me/password', {
      CurrentPassword: current,
      NewPassword: newPassword,
    });
  },

  // 2FA (currently stubs on server)
  generate2FA: async (): Promise<{ secret: string; qrCodeUrl: string }> => {
    const response = await ApiInstance.post('/users/me/2fa/generate');
    return response.data.Data;
  },

  enable2FA: async (code: string): Promise<{ backupCodes: string[] }> => {
    const response = await ApiInstance.post('/users/me/2fa/enable', { code });
    return response.data.Data;
  },

  disable2FA: async (code: string): Promise<void> => {
    await ApiInstance.post('/users/me/2fa/disable', { code });
  },

  regenerateBackupCodes: async (): Promise<string[]> => {
    const response = await ApiInstance.post('/users/me/2fa/backup-codes/regenerate');
    return response.data.Data?.backupCodes || [];
  },

  get2FAStatus: async (): Promise<{ enabled: boolean; enabledAt?: Date | null }> => {
    const response = await ApiInstance.get('/users/me/2fa/status');
    return response.data.Data;
  },

  // API Keys
  listApiKeys: async (): Promise<IApiKey[]> => {
    const response = await ApiInstance.get('/users/me/api-keys');
    return response.data.Data?.ApiKeys || [];
  },

  generateApiKey: async (
    name: string,
    scopes: string[],
    expiresAt?: Date
  ): Promise<IApiKeyCreateResponse> => {
    const response = await ApiInstance.post('/users/me/api-keys', {
      Name: name,
      Scopes: scopes,
      ExpiresAt: expiresAt,
    });
    return response.data.Data;
  },

  updateApiKey: async (keyId: number, updates: Partial<IApiKey>): Promise<void> => {
    await ApiInstance.put(`/users/me/api-keys/${keyId}`, updates);
  },

  revokeApiKey: async (keyId: number): Promise<void> => {
    await ApiInstance.delete(`/users/me/api-keys/${keyId}`);
  },

  // Sessions
  listSessions: async (): Promise<IUserSession[]> => {
    const response = await ApiInstance.get('/users/me/sessions');
    return response.data.Data?.Sessions || [];
  },

  revokeSession: async (sessionId: number): Promise<void> => {
    await ApiInstance.delete(`/users/me/sessions/${sessionId}`);
  },

  revokeAllSessions: async (currentSessionId: number): Promise<void> => {
    await ApiInstance.post('/users/me/sessions/revoke-all', { CurrentSessionId: currentSessionId });
  },

  // Account
  exportAccountData: async (): Promise<Blob> => {
    const response = await ApiInstance.get('/users/me/export', { responseType: 'blob' });
    return response.data;
  },

  deleteAccount: async (): Promise<void> => {
    await ApiInstance.delete('/users/me/account');
  },
};

export default UserSettingsService;
