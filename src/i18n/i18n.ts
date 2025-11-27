/**
 * i18n Configuration
 * Internationalization setup with English and Arabic support
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import EnTranslation from './locales/en.json';
import ArTranslation from './locales/ar.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: EnTranslation,
    },
    ar: {
      translation: ArTranslation,
    },
  },
  lng: 'en', // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
