import React from 'react';
import { Camera, Map, Marker, type ViewStateChangeEvent } from '@maplibre/maplibre-react-native';
import { Beer, CalendarCheck2, LocateFixed, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type NativeSyntheticEvent } from 'react-native';

import type { MapRegion } from '@/lib/map-types';
import { useAppTheme } from '@/providers/theme-provider';

const MAP_STYLES = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
} as const;

const MARKER_SIZE = 32;
const USER_MARKER_SIZE = 30;

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
  userLocation: { latitude: number; longitude: number } | null;
  cameraTarget: { latitude: number; longitude: number } | null;
  initialRegion: MapRegion;
  openTodayOnly: boolean;
  onRegionChangeComplete: (region: MapRegion) => void;
  onSelectMarker: (markerId: string) => void;
  onCenterUserLocation: () => void;
  onToggleOpenToday: () => void;
};

function zoomFromRegion(region: MapRegion) {
  return Math.max(1, Math.min(18, Math.log2(360 / region.longitudeDelta)));
}

function regionFromViewState(event: NativeSyntheticEvent<ViewStateChangeEvent>): MapRegion {
  const { bounds, center } = event.nativeEvent;
  const [west, south, east, north] = bounds;

  return {
    latitude: center[1],
    longitude: center[0],
    latitudeDelta: Math.abs(north - south),
    longitudeDelta: Math.abs(east - west),
  };
}

export function DiscoverMap({
  markers,
  selectedMarkerId,
  userLocation,
  cameraTarget,
  initialRegion,
  openTodayOnly,
  onRegionChangeComplete,
  onSelectMarker,
  onCenterUserLocation,
  onToggleOpenToday,
}: DiscoverMapProps) {
  const { resolvedTheme } = useAppTheme();
  const selectedMarker = markers.find((marker) => marker.id === selectedMarkerId);
  const centerCoordinate: [number, number] = cameraTarget
    ? [cameraTarget.longitude, cameraTarget.latitude]
    : selectedMarker
    ? [selectedMarker.longitude, selectedMarker.latitude]
    : [initialRegion.longitude, initialRegion.latitude];

  return (
    <View className="flex-1 bg-background">
      <Map
        attributionPosition={{ top: 56, left: 8 }}
        compass={false}
        logo={false}
        mapStyle={MAP_STYLES[resolvedTheme]}
        onRegionDidChange={(event) => onRegionChangeComplete(regionFromViewState(event))}
        style={styles.map}>
        <Camera
          center={centerCoordinate}
          zoom={zoomFromRegion(initialRegion)}
          duration={350}
          easing="ease"
        />
        {markers.map((marker) => {
          const selected = marker.id === selectedMarkerId;
          return (
            <Marker
              key={marker.id}
              id={marker.id}
              lngLat={[marker.longitude, marker.latitude]}
              anchor="bottom"
              onPress={() => onSelectMarker(marker.id)}>
              <Pressable
                accessibilityLabel={marker.subtitle ? `${marker.title}, ${marker.subtitle}` : marker.title}
                accessibilityRole="button"
                onPress={() => onSelectMarker(marker.id)}
                style={[
                  styles.marker,
                  selected ? styles.selectedMarker : styles.defaultMarker,
                ]}>
                <Beer size={16} color="#111111" strokeWidth={2.4} />
              </Pressable>
            </Marker>
          );
        })}
        {userLocation ? (
          <Marker
            id="user-location"
            lngLat={[userLocation.longitude, userLocation.latitude]}
            anchor="center">
            <View style={styles.userMarker}>
              <UserRound size={15} color="#111111" strokeWidth={2.5} />
            </View>
          </Marker>
        ) : null}
      </Map>

      <View style={styles.mapControls}>
        <Pressable
          accessibilityLabel="Karte auf eigenen Standort zentrieren"
          accessibilityRole="button"
          onPress={onCenterUserLocation}
          style={styles.controlButton}>
          <LocateFixed size={20} color="#111111" strokeWidth={2.4} />
        </Pressable>

        <Pressable
          accessibilityLabel="Nur heute offene Clubs anzeigen"
          accessibilityRole="button"
          onPress={onToggleOpenToday}
          style={[
            styles.filterButton,
            openTodayOnly ? styles.filterButtonActive : styles.filterButtonInactive,
          ]}>
          <CalendarCheck2 size={17} color="#111111" strokeWidth={2.4} />
          <Text style={styles.filterButtonText}>Heute offen</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    alignItems: 'center',
    borderRadius: MARKER_SIZE / 2,
    elevation: 6,
    height: MARKER_SIZE,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    width: MARKER_SIZE,
  },
  defaultMarker: {
    backgroundColor: '#ffffff',
  },
  selectedMarker: {
    backgroundColor: '#f4d63d',
  },
  userMarker: {
    alignItems: 'center',
    backgroundColor: '#f4d63d',
    borderColor: '#111111',
    borderRadius: USER_MARKER_SIZE / 2,
    borderWidth: 2,
    elevation: 8,
    height: USER_MARKER_SIZE,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.32,
    shadowRadius: 5,
    width: USER_MARKER_SIZE,
  },
  mapControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    position: 'absolute',
    right: 14,
    top: 58,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    elevation: 7,
    height: 44,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 5,
    width: 44,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 22,
    elevation: 7,
    flexDirection: 'row',
    gap: 7,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 5,
  },
  filterButtonActive: {
    backgroundColor: '#f4d63d',
  },
  filterButtonInactive: {
    backgroundColor: '#ffffff',
  },
  filterButtonText: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '700',
  },
});

export type { DiscoverMarker };
