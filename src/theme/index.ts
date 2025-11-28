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
        ? '"Tajawal", "Cairo", "Roboto", "Helvetica", "Arial", sans-serif'
        : '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: locale === 'ar' ? { direction: 'rtl' } : {},
      h2: locale === 'ar' ? { direction: 'rtl' } : {},
      h3: locale === 'ar' ? { direction: 'rtl' } : {},
      h4: locale === 'ar' ? { direction: 'rtl' } : {},
      h5: locale === 'ar' ? { direction: 'rtl' } : {},
      h6: locale === 'ar' ? { direction: 'rtl' } : {},
      body1: locale === 'ar' ? { direction: 'rtl' } : {},
      body2: locale === 'ar' ? { direction: 'rtl' } : {},
      subtitle1: locale === 'ar' ? { direction: 'rtl' } : {},
      subtitle2: locale === 'ar' ? { direction: 'rtl' } : {},
      caption: locale === 'ar' ? { direction: 'rtl' } : {},
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          body: {
            direction: locale === 'ar' ? 'rtl' : 'ltr',
            fontFamily: locale === 'ar'
              ? '"Tajawal", "Cairo", "Roboto", "Helvetica", "Arial", sans-serif'
              : '"Roboto", "Helvetica", "Arial", sans-serif',
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
          // RTL Support
          '@font-face': locale === 'ar' ? [
            {
              fontFamily: 'Tajawal',
              fontStyle: 'normal',
              fontWeight: 400,
              src: 'url(https://fonts.gstatic.com/s/tajawal/v8/Iura6YBj_oCad4k1NzGqvRnJvMk.woff2) format("woff2")',
              unicodeRange: 'U+0600-06FF',
            },
            {
              fontFamily: 'Tajawal',
              fontStyle: 'bold',
              fontWeight: 700,
              src: 'url(https://fonts.gstatic.com/s/tajawal/v8/Iure6YBj_oCad4k1nJeKvVy-MuHk.woff2) format("woff2")',
              unicodeRange: 'U+0600-06FF',
            },
          ] : [],
        }),
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', // Important for Arabic text
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            ...(locale === 'ar' && {
              right: 20,
              left: 'auto',
              transformOrigin: 'top right',
            }),
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            ...(locale === 'ar' && {
              textAlign: 'right',
            }),
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            direction: locale === 'ar' ? 'rtl' : 'ltr',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            ...(locale === 'ar' && {
              textAlign: 'right',
            }),
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            ...(locale === 'ar' && {
              right: 0,
              left: 'auto',
            }),
          },
        },
      },
      MuiGrid: {
        styleOverrides: {
          root: {
            direction: locale === 'ar' ? 'rtl' : 'ltr',
          },
        },
      },
    },
  };

  return createTheme(themeOptions, locale === 'ar' ? arSA : {});
};
