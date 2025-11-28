// Arabic locale removed - LTR only
import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';

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

export const CreateTheme = (mode: 'light' | 'dark', color: TThemeColor = 'blue'): Theme => {
  const colors = ThemeColors[color];

  const themeOptions: ThemeOptions = {
    direction: 'ltr', // Always LTR regardless of language
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
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Standard font family
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          body: {
            direction: 'ltr', // Always LTR
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            scrollbarColor: theme.palette.mode === 'dark' ? '#6b6b6b #2b2b2b' : '#959595 #f1f1f1',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.mode === 'dark' ? '#2b2b2b' : '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.mode === 'dark' ? '#6b6b6b' : '#959595',
              borderRadius: '4px',
            },
          },
        }),
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
