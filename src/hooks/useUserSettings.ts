import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserSettingsService from '@/services/userSettingsService';
import type {
  IUserSettings,
  INotificationSettings,
  IUserPreferences,
  IApiKey,
  IApiKeyCreateResponse,
  IUserSession,
} from '@/types';

/**
 * Custom hook to fetch user settings
 */
export const useUserSettings = () => {
  return useQuery<IUserSettings, Error>({
    queryKey: ['userSettings'],
    queryFn: () => UserSettingsService.getSettings(),
  });
};

/**
 * Custom hook to fetch API keys
 */
export const useApiKeys = () => {
  return useQuery<IApiKey[], Error>({
    queryKey: ['apiKeys'],
    queryFn: () => UserSettingsService.listApiKeys(),
  });
};

/**
 * Custom hook to fetch user sessions
 */
export const useUserSessions = () => {
  return useQuery<IUserSession[], Error>({
    queryKey: ['userSessions'],
    queryFn: () => UserSettingsService.listSessions(),
  });
};

/**
 * Custom hook to fetch 2FA status
 */
export const use2FAStatus = () => {
  return useQuery<{ enabled: boolean }, Error>({
    queryKey: ['2faStatus'],
    queryFn: () => UserSettingsService.get2FAStatus(),
  });
};

/**
 * Custom hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { Username: string; Email: string; FullName: string }>({
    mutationFn: (data) => UserSettingsService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

/**
 * Custom hook to update notification settings
 */
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, INotificationSettings>({
    mutationFn: (data) => UserSettingsService.updateNotificationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
  });
};

/**
 * Custom hook to update user preferences
 */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, IUserPreferences>({
    mutationFn: (data) => UserSettingsService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
  });
};

/**
 * Custom hook to test notification
 */
export const useTestNotification = () => {
  return useMutation<void, Error, 'discord' | 'slack'>({
    mutationFn: (type) => UserSettingsService.testNotification(type),
  });
};

/**
 * Custom hook to change password
 */
export const useChangePassword = () => {
  return useMutation<void, Error, { currentPassword: string; newPassword: string }>({
    mutationFn: ({ currentPassword, newPassword }) =>
      UserSettingsService.changePassword(currentPassword, newPassword),
  });
};

/**
 * Custom hook to generate 2FA
 */
export const useGenerate2FA = () => {
  return useMutation<{ secret: string; qrCodeUrl: string }, Error>({
    mutationFn: () => UserSettingsService.generate2FA(),
  });
};

/**
 * Custom hook to enable 2FA
 */
export const useEnable2FA = () => {
  const queryClient = useQueryClient();

  return useMutation<{ backupCodes: string[] }, Error, string>({
    mutationFn: (code) => UserSettingsService.enable2FA(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2faStatus'] });
    },
  });
};

/**
 * Custom hook to disable 2FA
 */
export const useDisable2FA = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (code) => UserSettingsService.disable2FA(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2faStatus'] });
    },
  });
};

/**
 * Custom hook to regenerate backup codes
 */
export const useRegenerateBackupCodes = () => {
  return useMutation<string[], Error>({
    mutationFn: () => UserSettingsService.regenerateBackupCodes(),
  });
};

/**
 * Custom hook to generate API key
 */
export const useGenerateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IApiKeyCreateResponse,
    Error,
    { name: string; scopes: string[]; expiresAt?: Date }
  >({
    mutationFn: ({ name, scopes, expiresAt }) =>
      UserSettingsService.generateApiKey(name, scopes, expiresAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
};

/**
 * Custom hook to revoke API key
 */
export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => UserSettingsService.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
};

/**
 * Custom hook to reactivate API key
 */
export const useReactivateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => UserSettingsService.reactivateApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
};

/**
 * Custom hook to regenerate API key
 */
export const useRegenerateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiKeyCreateResponse, Error, number>({
    mutationFn: (id) => UserSettingsService.regenerateApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
};

/**
 * Custom hook to revoke session
 */
export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => UserSettingsService.revokeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSessions'] });
    },
  });
};

/**
 * Custom hook to revoke all sessions
 */
export const useRevokeAllSessions = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (keepId) => UserSettingsService.revokeAllSessions(keepId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSessions'] });
    },
  });
};

/**
 * Custom hook to delete account
 */
export const useDeleteAccount = () => {
  return useMutation<void, Error>({
    mutationFn: () => UserSettingsService.deleteAccount(),
  });
};
