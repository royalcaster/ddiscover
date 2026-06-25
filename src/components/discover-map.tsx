import React from 'react';
import {
  Camera,
  GeoJSONSource,
  Images,
  Layer,
  Map,
  type CameraRef,
  type PressEventWithFeatures,
  type ViewStateChangeEvent,
} from '@maplibre/maplibre-react-native';
import { CalendarCheck2, LocateFixed } from 'lucide-react-native';
import { Pressable, StyleSheet, View, type NativeSyntheticEvent } from 'react-native';

import type { MapRegion } from '@/lib/map-types';
import { useAppTheme } from '@/providers/theme-provider';

const MAP_STYLES = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
} as const;

const MAP_LAYER_COLORS = {
  markerFill: '#ffffff',
  markerIcon: '#111111',
  markerStroke: '#111111',
  selectedFill: '#f4d64d',
  userFill: '#3b82f6',
  userStroke: '#ffffff',
} as const;

const CLUB_MARKER_ICON = require('../../assets/images/tabIcons/explore.png');

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

function markerFeatureCollection(markers: DiscoverMarker[], selectedMarkerId: string | null) {
  return {
    type: 'FeatureCollection',
    features: markers.map((marker) => ({
      type: 'Feature',
      id: marker.id,
      properties: {
        id: marker.id,
        title: marker.title,
        subtitle: marker.subtitle ?? '',
        selected: marker.id === selectedMarkerId,
      },
      geometry: {
        type: 'Point',
        coordinates: [marker.longitude, marker.latitude],
      },
    })),
  } as GeoJSON.FeatureCollection;
}

function userFeatureCollection(userLocation: DiscoverMapProps['userLocation']) {
  return {
    type: 'FeatureCollection',
    features: userLocation
      ? [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [userLocation.longitude, userLocation.latitude],
            },
          },
        ]
      : [],
  } as GeoJSON.FeatureCollection;
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
  const { colors, resolvedTheme } = useAppTheme();
  const cameraRef = React.useRef<CameraRef>(null);
  const lastCameraTargetRef = React.useRef<string | null>(null);
  const selectedExpression = React.useMemo(
    () => ['boolean', ['get', 'selected'], false] as ['boolean', ['get', string], boolean],
    [],
  );
  const initialCenter = React.useMemo<[number, number]>(
    () => [initialRegion.longitude, initialRegion.latitude],
    [initialRegion.latitude, initialRegion.longitude],
  );
  const initialZoom = React.useMemo(() => zoomFromRegion(initialRegion), [initialRegion]);
  const markerData = React.useMemo(
    () => markerFeatureCollection(markers, selectedMarkerId),
    [markers, selectedMarkerId],
  );
  const userData = React.useMemo(() => userFeatureCollection(userLocation), [userLocation]);

  React.useEffect(() => {
    if (!cameraTarget) {
      lastCameraTargetRef.current = null;
      return;
    }

    const cameraTargetKey = `${cameraTarget.longitude}:${cameraTarget.latitude}`;
    if (lastCameraTargetRef.current === cameraTargetKey) {
      return;
    }

    lastCameraTargetRef.current = cameraTargetKey;
    cameraRef.current?.easeTo({
      center: [cameraTarget.longitude, cameraTarget.latitude],
      duration: 320,
      easing: 'ease',
    });
  }, [cameraTarget]);

  const handleMarkerPress = React.useCallback(
    (event: NativeSyntheticEvent<PressEventWithFeatures>) => {
      const feature = event.nativeEvent.features?.[0];
      const markerId = feature?.properties?.id;
      if (typeof markerId === 'string') {
        event.stopPropagation();
        onSelectMarker(markerId);
      }
    },
    [onSelectMarker],
  );

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
          ref={cameraRef}
          initialViewState={{
            center: initialCenter,
            zoom: initialZoom,
          }}
        />

        <Images images={{ clubMarker: { source: CLUB_MARKER_ICON, sdf: true } }} />

        <GeoJSONSource
          id="club-markers"
          data={markerData}
          hitbox={{ top: 16, right: 16, bottom: 16, left: 16 }}
          onPress={handleMarkerPress}>
          <Layer
            id="club-marker-shadow"
            type="circle"
            paint={{
              'circle-radius': ['case', selectedExpression, 19, 16],
              'circle-color': 'rgba(0, 0, 0, 0.28)',
              'circle-blur': 0.9,
              'circle-translate': [0, 3],
            }}
          />
          <Layer
            id="club-marker-fill"
            type="circle"
            paint={{
              'circle-radius': ['case', selectedExpression, 17, 15],
              'circle-color': [
                'case',
                selectedExpression,
                MAP_LAYER_COLORS.selectedFill,
                MAP_LAYER_COLORS.markerFill,
              ],
              'circle-stroke-color': MAP_LAYER_COLORS.markerStroke,
              'circle-stroke-width': ['case', selectedExpression, 2.5, 1.5],
            }}
          />
          <Layer
            id="club-marker-icon"
            type="symbol"
            layout={{
              'icon-allow-overlap': true,
              'icon-image': 'clubMarker',
              'icon-ignore-placement': true,
              'icon-size': ['case', selectedExpression, 0.64, 0.56],
            }}
            paint={{
              'icon-color': MAP_LAYER_COLORS.markerIcon,
            }}
          />
        </GeoJSONSource>

        <GeoJSONSource id="user-location-source" data={userData}>
          <Layer
            id="user-location-outer"
            type="circle"
            paint={{
              'circle-radius': 16,
              'circle-color': MAP_LAYER_COLORS.userFill,
              'circle-stroke-color': MAP_LAYER_COLORS.userStroke,
              'circle-stroke-width': 2,
            }}
          />
          <Layer
            id="user-location-inner"
            type="circle"
            paint={{
              'circle-radius': 5,
              'circle-color': MAP_LAYER_COLORS.userStroke,
            }}
          />
        </GeoJSONSource>
      </Map>

      <View style={styles.mapControls}>
        <Pressable
          accessibilityLabel="Karte auf eigenen Standort zentrieren"
          accessibilityRole="button"
          android_ripple={{ color: colors.secondary }}
          onPress={onCenterUserLocation}
          style={({ pressed }) => [
            styles.controlButton,
            {
              backgroundColor: pressed ? colors.secondary : colors.card,
            },
          ]}>
          <LocateFixed size={20} color={colors.foreground} strokeWidth={2.4} />
        </Pressable>

        <Pressable
          accessibilityLabel="Nur heute offene Clubs anzeigen"
          accessibilityRole="button"
          android_ripple={{ color: openTodayOnly ? colors.primary : colors.secondary }}
          onPress={onToggleOpenToday}
          style={({ pressed }) => [
            styles.filterButton,
            {
              backgroundColor: openTodayOnly ? colors.primary : pressed ? colors.secondary : colors.card,
            },
          ]}>
          <CalendarCheck2
            size={21}
            color={openTodayOnly ? colors.primaryForeground : colors.foreground}
            strokeWidth={2.4}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    alignItems: 'flex-end',
    gap: 12,
    position: 'absolute',
    bottom: 250,
    right: 16,
  },
  controlButton: {
    alignItems: 'center',
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
    height: 44,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 5,
    width: 44,
  },
});

export type { DiscoverMarker };
