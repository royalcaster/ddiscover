import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { type ThemeModePreference } from '@/constants/theme';
import { NAV_THEME, THEME, type ThemeMode } from '@/lib/theme';

type ThemeContextValue = {
  colors: (typeof THEME)[ThemeMode];
  navigationTheme: (typeof NAV_THEME)[ThemeMode];
  preference: ThemeModePreference;
  resolvedTheme: ThemeMode;
  setPreference: (preference: ThemeModePreference) => Promise<void>;
  isReady: boolean;
};

const STORAGE_KEY = 'ddiscover:theme-preference';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(
  preference: ThemeModePreference,
  systemColorScheme: ReturnType<typeof useSystemColorScheme>,
): ThemeMode {
  if (preference === 'system') {
    return systemColorScheme === 'dark' ? 'dark' : 'light';
  }

  return preference;
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [preference, setPreferenceState] = useState<ThemeModePreference>('system');
  const [isReady, setIsReady] = useState(false);

  const resolvedTheme = resolveTheme(preference, systemColorScheme);
  const colors = THEME[resolvedTheme];
  const navigationTheme = useMemo(() => NAV_THEME[resolvedTheme], [resolvedTheme]);

  useEffect(() => {
    let isMounted = true;

    async function loadPreference() {
      const storedPreference = await AsyncStorage.getItem(STORAGE_KEY);

      if (!isMounted) {
        return;
      }

      if (storedPreference === 'light' || storedPreference === 'dark' || storedPreference === 'system') {
        setPreferenceState(storedPreference);
      }

      setIsReady(true);
    }

    void loadPreference();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    setColorScheme(preference);
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background, isReady, preference, setColorScheme]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      colors,
      navigationTheme,
      preference,
      resolvedTheme,
      async setPreference(nextPreference) {
        setPreferenceState(nextPreference);
        await AsyncStorage.setItem(STORAGE_KEY, nextPreference);
      },
      isReady,
    }),
    [colors, isReady, navigationTheme, preference, resolvedTheme],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useAppTheme must be used within AppThemeProvider.');
  }

  return value;
}
