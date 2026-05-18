import type { ExpoConfig } from 'expo/config';

const appJson = require('./app.json') as { expo: ExpoConfig };

const baseConfig = appJson.expo;
const mapsApiKey =
  process.env.GOOGLE_MAPS_ANDROID_API_KEY ?? process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY;
const basePlugins = baseConfig.plugins ?? [];
const pluginsWithoutMaps = basePlugins.filter((plugin) => {
  if (typeof plugin === 'string') {
    return plugin !== 'react-native-maps';
  }
  return plugin[0] !== 'react-native-maps';
});

export default (): ExpoConfig => ({
  ...baseConfig,
  plugins: mapsApiKey
    ? [
        ...pluginsWithoutMaps,
        [
          'react-native-maps',
          {
            androidGoogleMapsApiKey: mapsApiKey,
          },
        ],
      ]
    : pluginsWithoutMaps,
  android: {
    ...baseConfig.android,
    config: {
      ...(baseConfig.android?.config ?? {}),
      googleMaps: {
        apiKey: mapsApiKey,
      },
    },
  },
});
