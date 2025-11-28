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

  // Use React state management
  const ChangeLanguage = (lang: TLanguage): void => {
    setLanguage(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
    i18n.changeLanguage(lang);
  };

  // Set document language on mount and language change
  useEffect(() => {
    document.documentElement.lang = language;
    // Always LTR - no direction changes needed
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
