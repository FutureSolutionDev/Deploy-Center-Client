/**
 * Theme Context
 * Provides theme management (light/dark mode and color themes)
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, type Theme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import { CreateTheme, type TThemeColor, ThemeColors } from '@/theme';
import type { TThemeMode } from '@/types';
import { cacheRtl, cacheLtr } from '@/utils/rtlCache';

interface IThemeContextValue {
  Mode: TThemeMode;
  Color: TThemeColor;
  ToggleMode: () => void;
  SetMode: (mode: TThemeMode) => void;
  SetColor: (color: TThemeColor) => void;
  AvailableColors: typeof ThemeColors;
}

const ThemeContext = createContext<IThemeContextValue | undefined>(undefined);

interface IThemeProviderProps {
  children: ReactNode;
  language?: 'ar' | 'en';
}

const THEME_MODE_KEY = 'deploy_center_theme_mode';
const THEME_COLOR_KEY = 'deploy_center_theme_color';

export const ThemeContextProvider: React.FC<IThemeProviderProps> = ({
  children,
  language = 'en'
}) => {
  // Initialize from localStorage or defaults
  const [Mode, setModeState] = useState<TThemeMode>(() => {
    const stored = localStorage.getItem(THEME_MODE_KEY);
    return (stored as TThemeMode) || 'light';
  });

  const [Color, setColorState] = useState<TThemeColor>(() => {
    const stored = localStorage.getItem(THEME_COLOR_KEY);
    return (stored as TThemeColor) || 'blue';
  });
  // Create MUI theme based on current settings
  const MuiTheme: Theme = useMemo(() => {
    return CreateTheme(Mode, Color, language);
  }, [Mode, Color, language]);

  // Persist mode changes
  useEffect(() => {
    localStorage.setItem(THEME_MODE_KEY, Mode);
  }, [Mode]);

  // Persist color changes
  useEffect(() => {
    localStorage.setItem(THEME_COLOR_KEY, Color);
  }, [Color]);

  const ToggleMode = (): void => {
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const SetMode = (mode: TThemeMode): void => {
    setModeState(mode);
  };

  const SetColor = (color: TThemeColor): void => {
    setColorState(color);
  };

  const value: IThemeContextValue = {
    Mode,
    Color,
    ToggleMode,
    SetMode,
    SetColor,
    AvailableColors: ThemeColors,
  };

  return (
    <ThemeContext.Provider value={value}>
      <CacheProvider value={language === 'ar' ? cacheRtl : cacheLtr}>
        <MuiThemeProvider theme={MuiTheme}>{children}</MuiThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): IThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeContextProvider');
  }
  return context;
};
