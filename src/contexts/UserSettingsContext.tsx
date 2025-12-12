/**
 * User Settings Context
 * Provides user settings (timezone, date/time format) throughout the app
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import UserSettingsService from '@/services/userSettingsService';
import { useAuth } from './AuthContext';
import type { IUserSettings } from '@/types';

interface IUserSettingsContextValue {
  Settings: IUserSettings | null;
  IsLoading: boolean;
  RefreshSettings: () => Promise<void>;
  UpdateSettings: (settings: Partial<IUserSettings>) => Promise<void>;
}

const UserSettingsContext = createContext<IUserSettingsContextValue | undefined>(undefined);

interface IUserSettingsProviderProps {
  children: ReactNode;
}

export const UserSettingsProvider: React.FC<IUserSettingsProviderProps> = ({ children }) => {
  const { User, IsAuthenticated } = useAuth();
  const [Settings, setSettings] = useState<IUserSettings | null>(null);
  const [IsLoading, setIsLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    if (!IsAuthenticated || !User) {
      setSettings(null);
      setIsLoading(false);
      return;
    }

    try {
      const settings = await UserSettingsService.getSettings();
      setSettings(settings);
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      // Set default settings if fetch fails
      setSettings({
        Timezone: 'UTC',
        DateFormat: 'YYYY-MM-DD',
        TimeFormat: '24h',
        Language: 'en',
        Theme: 'light',
        ColorTheme: 'blue',
      } as IUserSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const RefreshSettings = async () => {
    await fetchSettings();
  };

  const UpdateSettings = async (updates: Partial<IUserSettings>) => {
    try {
      await UserSettingsService.updatePreferences(updates);
      await fetchSettings();
    } catch (error) {
      console.error('Failed to update user settings:', error);
      throw error;
    }
  };

  // Fetch settings when user logs in
  useEffect(() => {
    fetchSettings();
  }, [IsAuthenticated, User?.Id]);

  const value: IUserSettingsContextValue = {
    Settings,
    IsLoading,
    RefreshSettings,
    UpdateSettings,
  };

  return <UserSettingsContext.Provider value={value}>{children}</UserSettingsContext.Provider>;
};

// Custom hook to use user settings context
export const useUserSettings = (): IUserSettingsContextValue => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within UserSettingsProvider');
  }
  return context;
};
