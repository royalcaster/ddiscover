import type { ExpoConfig } from 'expo/config';

const appJson = require('./app.json') as { expo: ExpoConfig };

const baseConfig = appJson.expo;
const basePlugins = baseConfig.plugins ?? [];
const pluginsWithoutMaps = basePlugins.filter((plugin) => {
  if (typeof plugin === 'string') {
    return plugin !== 'react-native-maps' && plugin !== '@maplibre/maplibre-react-native';
  }
  return plugin[0] !== 'react-native-maps' && plugin[0] !== '@maplibre/maplibre-react-native';
});

export default (): ExpoConfig => ({
  ...baseConfig,
  plugins: [...pluginsWithoutMaps, '@maplibre/maplibre-react-native'],
});
