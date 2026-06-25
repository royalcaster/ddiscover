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
import {
  Animated,
  StyleSheet,
  TouchableNativeFeedback,
  View,
  type NativeSyntheticEvent,
} from 'react-native';

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
  selectedStroke: '#111111',
  userFill: '#f4d64d',
  userInner: '#111111',
  userStroke: '#111111',
} as const;

const CLUB_MARKER_ICON = require('../../assets/images/map/beer.png');

const CONTROL_COLORS = {
  light: {
    background: '#ffffff',
    border: 'rgba(17,17,17,0.12)',
    foreground: '#111111',
    pressed: 'rgba(0,0,0,0.08)',
    shadow: 'rgba(0,0,0,0.28)',
  },
  dark: {
    background: '#181816',
    border: 'rgba(255,255,255,0.12)',
    foreground: '#f5f0df',
    pressed: 'rgba(255,255,255,0.12)',
    shadow: 'rgba(0,0,0,0.5)',
  },
} as const;

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
  sheetMaxHeight: number;
  sheetTranslateY: Animated.Value;
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

type MapControlButtonProps = {
  accessibilityLabel: string;
  children: React.ReactNode;
  onPress: () => void;
  selected?: boolean;
  theme: keyof typeof CONTROL_COLORS;
};

function MapControlButton({
  accessibilityLabel,
  children,
  onPress,
  selected = false,
  theme,
}: MapControlButtonProps) {
  const controlColors = CONTROL_COLORS[theme];
  return (
    <View
      style={[
        styles.controlClip,
        {
          backgroundColor: controlColors.background,
          borderColor: selected ? controlColors.foreground : controlColors.border,
          shadowColor: controlColors.shadow,
        },
      ]}>
      <TouchableNativeFeedback
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        background={TouchableNativeFeedback.Ripple(controlColors.pressed, false)}
        onPress={onPress}
        useForeground>
        <View style={styles.controlButton}>{children}</View>
      </TouchableNativeFeedback>
    </View>
  );
}

/**
 * Native MapLibre map used by the Discover screen. Club and user markers are
 * rendered as map layers for smooth panning, while React Native controls stay
 * above the bottom sheet through the shared animated sheet offset.
 */
export function DiscoverMap({
  markers,
  selectedMarkerId,
  userLocation,
  cameraTarget,
  initialRegion,
  openTodayOnly,
  sheetMaxHeight,
  sheetTranslateY,
  onRegionChangeComplete,
  onSelectMarker,
  onCenterUserLocation,
  onToggleOpenToday,
}: DiscoverMapProps) {
  const { resolvedTheme } = useAppTheme();
  const controlColors = CONTROL_COLORS[resolvedTheme];
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
        attribution={false}
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

        <Images images={{ clubMarker: { source: CLUB_MARKER_ICON, sdf: false } }} />

        <GeoJSONSource
          id="club-markers"
          data={markerData}
          hitbox={{ top: 16, right: 16, bottom: 16, left: 16 }}
          onPress={handleMarkerPress}>
          <Layer
            id="club-marker-shadow"
            type="circle"
            paint={{
              'circle-radius': 16,
              'circle-color': [
                'case',
                selectedExpression,
                'rgba(244, 214, 77, 0.4)',
                'rgba(0, 0, 0, 0.24)',
              ],
              'circle-blur': 0.9,
              'circle-translate': [0, 3],
            }}
          />
          <Layer
            id="club-marker-fill"
            type="circle"
            paint={{
              'circle-radius': 14,
              'circle-color': [
                'case',
                selectedExpression,
                MAP_LAYER_COLORS.selectedFill,
                MAP_LAYER_COLORS.markerFill,
              ],
              'circle-stroke-color': [
                'case',
                selectedExpression,
                MAP_LAYER_COLORS.selectedStroke,
                MAP_LAYER_COLORS.markerStroke,
              ],
              'circle-stroke-width': 1.5,
            }}
          />
          <Layer
            id="club-marker-icon"
            type="symbol"
            layout={{
              'icon-allow-overlap': true,
              'icon-image': 'clubMarker',
              'icon-ignore-placement': true,
              'icon-size': 0.25,
            }}
          />
        </GeoJSONSource>

        <GeoJSONSource id="user-location-source" data={userData}>
          <Layer
            id="user-location-halo"
            type="circle"
            paint={{
              'circle-radius': 23,
              'circle-color': 'rgba(244, 214, 77, 0.24)',
            }}
          />
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
              'circle-radius': 6,
              'circle-color': MAP_LAYER_COLORS.userInner,
            }}
          />
        </GeoJSONSource>
      </Map>

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.mapControls,
          {
            bottom: sheetMaxHeight + 16,
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}>
        <MapControlButton
          accessibilityLabel="Karte auf eigenen Standort zentrieren"
          onPress={onCenterUserLocation}
          theme={resolvedTheme}>
          <LocateFixed size={22} color={controlColors.foreground} strokeWidth={2.5} />
        </MapControlButton>

        <MapControlButton
          accessibilityLabel="Nur heute offene Studentenclubs anzeigen"
          onPress={onToggleOpenToday}
          selected={openTodayOnly}
          theme={resolvedTheme}>
          <CalendarCheck2
            size={23}
            color={controlColors.foreground}
            strokeWidth={2.5}
          />
        </MapControlButton>
      </Animated.View>
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
    right: 16,
  },
  controlClip: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 7,
    height: 48,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    width: 48,
  },
  controlButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
});

export type { DiscoverMarker };
