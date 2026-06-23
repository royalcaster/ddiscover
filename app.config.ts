import type { ExpoConfig } from 'expo/config';

const appJson = require('./app.json') as { expo: ExpoConfig };

const baseConfig = appJson.expo;
const basePlugins = baseConfig.plugins ?? [];
const publicEnvKeys = [
  'EXPO_PUBLIC_CONVEX_URL',
  'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID',
  'EXPO_PUBLIC_CLERK_GOOGLE_ANDROID_CLIENT_ID',
];
const pluginsWithoutMaps = basePlugins.filter((plugin) => {
  if (typeof plugin === 'string') {
    return plugin !== 'react-native-maps' && plugin !== '@maplibre/maplibre-react-native';
  }
  return plugin[0] !== 'react-native-maps' && plugin[0] !== '@maplibre/maplibre-react-native';
});
const publicEnvExtra = Object.fromEntries(
  publicEnvKeys
    .map((key) => [key, process.env[key]])
    .filter((entry): entry is [string, string] => Boolean(entry[1])),
);

export default (): ExpoConfig => ({
  ...baseConfig,
  extra: {
    ...(baseConfig.extra ?? {}),
    ...publicEnvExtra,
  },
  plugins: [...pluginsWithoutMaps, '@maplibre/maplibre-react-native'],
});
