/**
 * Language Context
 * Provides i18n language management with RTL/LTR support
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TLanguage } from '@/types';

interface ILanguageContextValue {
  Language: TLanguage;
  Direction: 'rtl' | 'ltr';
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
  const [Language, setLanguage] = useState<TLanguage>(() => {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    return (stored as TLanguage) || 'en';
  });

  const [Direction, setDirection] = useState<'rtl' | 'ltr'>(() => {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    return (stored as TLanguage) === 'ar' ? 'rtl' : 'ltr';
  });

  // Initialize i18n language
  useEffect(() => {
    i18n.changeLanguage(Language);
  }, [Language, i18n]);

  // Update document direction
  useEffect(() => {
    document.documentElement.dir = Direction;
    document.documentElement.lang = Language;
  }, [Direction, Language]);

  const ChangeLanguage = (lang: TLanguage): void => {
    setLanguage(lang);
    setDirection(lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem(LANGUAGE_KEY, lang);
    i18n.changeLanguage(lang);
  };

  const value: ILanguageContextValue = {
    Language,
    Direction,
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
