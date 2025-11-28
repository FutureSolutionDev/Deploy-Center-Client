/**
 * i18n Configuration
 * Internationalization setup with English and Arabic support with RTL
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import EnTranslation from './locales/en.json';
import ArTranslation from './locales/ar.json';

const savedLanguage = localStorage.getItem('deploy_center_language') || 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: EnTranslation,
      },
      ar: {
        translation: ArTranslation,
      },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'deploy_center_language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

// Set initial RTL direction
if (savedLanguage === 'ar') {
  document.body.setAttribute('dir', 'rtl');
  document.body.classList.add('rtl');
} else {
  document.body.setAttribute('dir', 'ltr');
  document.body.classList.remove('rtl');
}

export default i18n;
