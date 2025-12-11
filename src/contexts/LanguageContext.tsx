/**
 * Language Context
 * Provides i18n language management
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TLanguage } from '@/types';

interface ILanguageContextValue {
  Language: TLanguage;
  ChangeLanguage: (lang: TLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<ILanguageContextValue | undefined>(undefined);

interface ILanguageProviderProps {
  children: ReactNode;
}

const LANGUAGE_KEY = 'deploy_center_language';

export const LanguageProvider: React.FC<ILanguageProviderProps> = ({ children }) => {
  const { t, i18n } = useTranslation();

  // Initialize from localStorage or default to 'en'
  const [language, setLanguage] = useState<TLanguage>(() => {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    return (stored as TLanguage) || 'en';
  });

  // Use React state management with page reload to ensure RTL cache is cleared
  const ChangeLanguage = (lang: TLanguage): void => {
    setLanguage(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
    i18n.changeLanguage(lang);

    // Force page reload to clear emotion cache and apply RTL properly
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Set document language and direction on mount and language change
  useEffect(() => {
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language]);

  const value: ILanguageContextValue = {
    Language: language,
    ChangeLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// Custom hook to use language context
export const useLanguage = (): ILanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
