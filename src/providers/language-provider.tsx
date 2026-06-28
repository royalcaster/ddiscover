import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  localeForLanguage,
  translate,
  type Language,
  type TranslationKey,
} from '@/i18n';

type LanguageContextValue = {
  language: Language;
  locale: string;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
  isReady: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value === 'de' || value === 'en';
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadLanguage() {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

      if (!isMounted) {
        return;
      }

      if (isLanguage(storedLanguage)) {
        setLanguageState(storedLanguage);
      }

      setIsReady(true);
    }

    void loadLanguage();

    return () => {
      isMounted = false;
    };
  }, []);

  const contextValue = useMemo<LanguageContextValue>(
    () => ({
      language,
      locale: localeForLanguage(language),
      async setLanguage(nextLanguage) {
        setLanguageState(nextLanguage);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
      },
      t(key, values) {
        return translate(language, key, values);
      },
      isReady,
    }),
    [isReady, language],
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error('useLanguage must be used within LanguageProvider.');
  }

  return value;
}
