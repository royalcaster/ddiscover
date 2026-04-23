import { Platform } from 'react-native';
import { DefaultTheme, type Theme } from '@react-navigation/native';

export const Colors = {
  light: {
    text: '#11110f',
    textSecondary: '#5d5a52',
    background: '#f7f5ef',
    backgroundElement: '#f0ede4',
    backgroundSelected: '#e7e1d0',
    surface: '#f0ede4',
    surfaceMuted: '#e7e1d0',
    border: '#d2cbb7',
    accent: '#f4d74f',
    accentForeground: '#11110f',
    success: '#3f8a5a',
    danger: '#b85c34',
    ring: '#f0cb2f',
    chartLine: '#191919',
    mapTint: '#f7d64c',
  },
  dark: {
    text: '#f6f3ea',
    textSecondary: '#b7b0a4',
    background: '#080807',
    backgroundElement: '#161613',
    backgroundSelected: '#23231f',
    surface: '#161613',
    surfaceMuted: '#23231f',
    border: '#393831',
    accent: '#f8da53',
    accentForeground: '#11110f',
    success: '#5fb27c',
    danger: '#df7b4e',
    ring: '#f8da53',
    chartLine: '#f5f1e6',
    mapTint: '#f8da53',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ResolvedTheme = keyof typeof Colors;
export type ThemeModePreference = ResolvedTheme | 'system';

function hexToRgbTriplet(hex: string) {
  const normalized = hex.replace('#', '');
  const parsed = Number.parseInt(normalized, 16);
  const red = (parsed >> 16) & 255;
  const green = (parsed >> 8) & 255;
  const blue = parsed & 255;
  return `${red} ${green} ${blue}`;
}

export function buildThemeVariables(theme: ResolvedTheme) {
  const palette = Colors[theme];

  return {
    '--background': hexToRgbTriplet(palette.background),
    '--foreground': hexToRgbTriplet(palette.text),
    '--card': hexToRgbTriplet(palette.surface),
    '--card-foreground': hexToRgbTriplet(palette.text),
    '--muted': hexToRgbTriplet(palette.surfaceMuted),
    '--muted-foreground': hexToRgbTriplet(palette.textSecondary),
    '--border': hexToRgbTriplet(palette.border),
    '--input': hexToRgbTriplet(palette.border),
    '--primary': hexToRgbTriplet(palette.accent),
    '--primary-foreground': hexToRgbTriplet(palette.accentForeground),
    '--secondary': hexToRgbTriplet(palette.surfaceMuted),
    '--secondary-foreground': hexToRgbTriplet(palette.text),
    '--accent': hexToRgbTriplet(palette.accent),
    '--accent-foreground': hexToRgbTriplet(palette.accentForeground),
    '--destructive': hexToRgbTriplet(palette.danger),
    '--destructive-foreground': hexToRgbTriplet('#fff8ef'),
    '--ring': hexToRgbTriplet(palette.ring),
    '--chart-line': hexToRgbTriplet(palette.chartLine),
    '--map-tint': hexToRgbTriplet(palette.mapTint),
  };
}

export function buildNavigationTheme(theme: ResolvedTheme): Theme {
  const palette = Colors[theme];

  return {
    ...DefaultTheme,
    dark: theme === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: palette.accent,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
      notification: palette.accent,
    },
  };
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
