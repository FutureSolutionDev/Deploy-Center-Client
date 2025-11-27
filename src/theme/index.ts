import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';
import { arSA } from '@mui/material/locale';

export const ThemeColors = {
  blue: {
    primary: '#1976d2',
    secondary: '#dc004e',
  },
  green: {
    primary: '#4caf50',
    secondary: '#ff9800',
  },
  purple: {
    primary: '#9c27b0',
    secondary: '#00bcd4',
  },
  orange: {
    primary: '#ff9800',
    secondary: '#3f51b5',
  },
  red: {
    primary: '#f44336',
    secondary: '#4caf50',
  },
};

export type TThemeColor = keyof typeof ThemeColors;

export const CreateTheme = (mode: 'light' | 'dark', color: TThemeColor = 'blue', locale: 'en' | 'ar' = 'en'): Theme => {
  const colors = ThemeColors[color];

  const themeOptions: ThemeOptions = {
    direction: locale === 'ar' ? 'rtl' : 'ltr',
    palette: {
      mode,
      primary: {
        main: colors.primary,
      },
      secondary: {
        main: colors.secondary,
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: locale === 'ar'
        ? '"Tajawal", "Roboto", "Helvetica", "Arial", sans-serif'
        : '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: mode === 'dark' ? '#6b6b6b #2b2b2b' : '#959595 #f1f1f1',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'dark' ? '#2b2b2b' : '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'dark' ? '#6b6b6b' : '#959595',
              borderRadius: '4px',
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions, locale === 'ar' ? arSA : {});
};
