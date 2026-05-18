import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

type DiscoverMarker = {
  id: string;
  title: string;
  subtitle?: string;
  latitude: number;
  longitude: number;
};

type DiscoverMapProps = {
  markers: DiscoverMarker[];
  selectedMarkerId: string | null;
  initialRegion: Region;
  onRegionChangeComplete: (region: Region) => void;
  onSelectMarker: (markerId: string) => void;
};

export function DiscoverMap({
  markers,
  selectedMarkerId,
  initialRegion,
  onRegionChangeComplete,
  onSelectMarker,
}: DiscoverMapProps) {
  return (
    <View className="flex-1 bg-background">
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        onRegionChangeComplete={onRegionChangeComplete}
        style={styles.map}>
        {markers.map((marker) => {
          const selected = marker.id === selectedMarkerId;
          return (
            <Marker
              key={marker.id}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title={marker.title}
              description={marker.subtitle}
              pinColor={selected ? '#f4d63d' : '#5b616a'}
              onPress={() => onSelectMarker(marker.id)}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export type { DiscoverMarker };
