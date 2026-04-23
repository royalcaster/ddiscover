import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider, type Theme } from '@react-navigation/native';
import * as SystemUI from 'expo-system-ui';
import { vars, useColorScheme as useNativeWindColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { View, useColorScheme as useSystemColorScheme } from 'react-native';

import { Colors, ThemeModePreference, type ResolvedTheme, buildNavigationTheme, buildThemeVariables } from '@/constants/theme';

type ThemeContextValue = {
  colors: (typeof Colors)[ResolvedTheme];
  navigationTheme: Theme;
  preference: ThemeModePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemeModePreference) => Promise<void>;
  isReady: boolean;
};

const STORAGE_KEY = 'ddiscover:theme-preference';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(
  preference: ThemeModePreference,
  systemColorScheme: ReturnType<typeof useSystemColorScheme>,
): ResolvedTheme {
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
  const colors = Colors[resolvedTheme];
  const navigationTheme = useMemo(() => buildNavigationTheme(resolvedTheme), [resolvedTheme]);
  const themeVariables = useMemo(() => vars(buildThemeVariables(resolvedTheme)), [resolvedTheme]);

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

  return (
    <ThemeContext.Provider value={contextValue}>
      <NavigationThemeProvider value={navigationTheme ?? DefaultTheme}>
        <View style={themeVariables} className="flex-1 bg-background">
          {children}
        </View>
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useAppTheme must be used within AppThemeProvider.');
  }

  return value;
}
