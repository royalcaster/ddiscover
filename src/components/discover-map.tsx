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
  type GestureResponderEvent,
  type LayoutChangeEvent,
  StyleSheet,
  TouchableNativeFeedback,
  View,
  type NativeSyntheticEvent,
} from 'react-native';

import type { MapRegion } from '@/lib/map-types';
import { useLanguage } from '@/providers/language-provider';
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
const FAST_MARKER_TAP_RADIUS = 40;
const FAST_MARKER_TAP_SLOP = 12;
const WEB_MERCATOR_MAX_LATITUDE = 85.05112878;

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

function markerFeatureCollection(markers: DiscoverMarker[]) {
  return {
    type: 'FeatureCollection',
    features: markers.map((marker) => ({
      type: 'Feature',
      id: marker.id,
      properties: {
        id: marker.id,
        title: marker.title,
        subtitle: marker.subtitle ?? '',
      },
      geometry: {
        type: 'Point',
        coordinates: [marker.longitude, marker.latitude],
      },
    })),
  } as GeoJSON.FeatureCollection;
}

function selectedMarkerFeatureCollection(marker: DiscoverMarker | null) {
  return {
    type: 'FeatureCollection',
    features: marker
      ? [
          {
            type: 'Feature',
            id: marker.id,
            properties: {
              id: marker.id,
              title: marker.title,
              subtitle: marker.subtitle ?? '',
            },
            geometry: {
              type: 'Point',
              coordinates: [marker.longitude, marker.latitude],
            },
          },
        ]
      : [],
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

function longitudeToMercatorX(longitude: number) {
  return (longitude + 180) / 360;
}

function latitudeToMercatorY(latitude: number) {
  const clampedLatitude = Math.max(
    -WEB_MERCATOR_MAX_LATITUDE,
    Math.min(WEB_MERCATOR_MAX_LATITUDE, latitude),
  );
  const latitudeRadians = (clampedLatitude * Math.PI) / 180;
  return (
    1 -
    Math.log(Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians)) / Math.PI
  ) / 2;
}

function projectMarkerToScreen(
  marker: DiscoverMarker,
  viewport: MapRegion,
  mapSize: { width: number; height: number },
) {
  if (mapSize.width <= 0 || mapSize.height <= 0) {
    return null;
  }

  const west = viewport.longitude - viewport.longitudeDelta / 2;
  const east = viewport.longitude + viewport.longitudeDelta / 2;
  const north = viewport.latitude + viewport.latitudeDelta / 2;
  const south = viewport.latitude - viewport.latitudeDelta / 2;
  const left = longitudeToMercatorX(west);
  const right = longitudeToMercatorX(east);
  const top = latitudeToMercatorY(north);
  const bottom = latitudeToMercatorY(south);
  const horizontalSpan = right - left;
  const verticalSpan = bottom - top;

  if (horizontalSpan <= 0 || verticalSpan <= 0) {
    return null;
  }

  return {
    x: ((longitudeToMercatorX(marker.longitude) - left) / horizontalSpan) * mapSize.width,
    y: ((latitudeToMercatorY(marker.latitude) - top) / verticalSpan) * mapSize.height,
  };
}

function nearestMarkerAtPoint(
  markers: DiscoverMarker[],
  viewport: MapRegion,
  mapSize: { width: number; height: number },
  point: { x: number; y: number },
) {
  let nearestMarker: DiscoverMarker | null = null;
  let nearestDistance = FAST_MARKER_TAP_RADIUS * FAST_MARKER_TAP_RADIUS;

  for (const marker of markers) {
    const screenPoint = projectMarkerToScreen(marker, viewport, mapSize);
    if (!screenPoint) continue;

    const distance =
      (screenPoint.x - point.x) ** 2 + (screenPoint.y - point.y) ** 2;

    if (distance <= nearestDistance) {
      nearestDistance = distance;
      nearestMarker = marker;
    }
  }

  return nearestMarker;
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
  const { t } = useLanguage();
  const controlColors = CONTROL_COLORS[resolvedTheme];
  const cameraRef = React.useRef<CameraRef>(null);
  const lastCameraTargetRef = React.useRef<string | null>(null);
  const mapViewportRef = React.useRef(initialRegion);
  const mapSizeRef = React.useRef({ width: 0, height: 0 });
  const selectedMarkerIdRef = React.useRef(selectedMarkerId);
  const touchStartRef = React.useRef<{ x: number; y: number; selectedMarkerId?: string } | null>(null);
  const initialCenter = React.useMemo<[number, number]>(
    () => [initialRegion.longitude, initialRegion.latitude],
    [initialRegion.latitude, initialRegion.longitude],
  );
  const initialZoom = React.useMemo(() => zoomFromRegion(initialRegion), [initialRegion]);
  const markerData = React.useMemo(
    () => markerFeatureCollection(markers),
    [markers],
  );
  const selectedMarkerData = React.useMemo(
    () =>
      selectedMarkerFeatureCollection(
        markers.find((marker) => marker.id === selectedMarkerId) ?? null,
      ),
    [markers, selectedMarkerId],
  );
  const userData = React.useMemo(() => userFeatureCollection(userLocation), [userLocation]);

  React.useEffect(() => {
    selectedMarkerIdRef.current = selectedMarkerId;
  }, [selectedMarkerId]);

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

  const selectMarker = React.useCallback(
    (markerId: string) => {
      if (selectedMarkerIdRef.current === markerId) {
        return;
      }

      selectedMarkerIdRef.current = markerId;
      onSelectMarker(markerId);
    },
    [onSelectMarker],
  );

  const selectNearestMarker = React.useCallback(
    (point: { x: number; y: number }) => {
      const marker = nearestMarkerAtPoint(
        markers,
        mapViewportRef.current,
        mapSizeRef.current,
        point,
      );

      if (!marker) {
        return null;
      }

      selectMarker(marker.id);
      return marker.id;
    },
    [markers, selectMarker],
  );

  const handleMarkerPress = React.useCallback(
    (event: NativeSyntheticEvent<PressEventWithFeatures>) => {
      const feature = event.nativeEvent.features?.[0];
      const markerId = feature?.properties?.id;
      if (typeof markerId === 'string') {
        event.stopPropagation();
        selectMarker(markerId);
      }
    },
    [selectMarker],
  );

  const handleRegionDidChange = React.useCallback(
    (event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
      const nextRegion = regionFromViewState(event);
      mapViewportRef.current = nextRegion;
      onRegionChangeComplete(nextRegion);
    },
    [onRegionChangeComplete],
  );

  const handleMapLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    mapSizeRef.current = { width, height };
  }, []);

  const handleMapTouchStart = React.useCallback((event: GestureResponderEvent) => {
    if (event.nativeEvent.touches.length > 1) {
      touchStartRef.current = null;
      return;
    }

    const touchStart = {
      x: event.nativeEvent.locationX,
      y: event.nativeEvent.locationY,
    };
    const selectedOnStart = selectNearestMarker(touchStart);

    touchStartRef.current = {
      ...touchStart,
      selectedMarkerId: selectedOnStart ?? undefined,
    };
  }, [selectNearestMarker]);

  const handleMapTouchEnd = React.useCallback(
    (event: GestureResponderEvent) => {
      const touchStart = touchStartRef.current;
      touchStartRef.current = null;

      if (!touchStart) return;

      const endPoint = {
        x: event.nativeEvent.locationX,
        y: event.nativeEvent.locationY,
      };
      const movement =
        (endPoint.x - touchStart.x) ** 2 + (endPoint.y - touchStart.y) ** 2;

      if (movement > FAST_MARKER_TAP_SLOP * FAST_MARKER_TAP_SLOP) {
        return;
      }

      if (!touchStart.selectedMarkerId) {
        selectNearestMarker(endPoint);
      }
    },
    [selectNearestMarker],
  );

  return (
    <View className="flex-1 bg-background">
      <View
        onLayout={handleMapLayout}
        onTouchCancel={() => {
          touchStartRef.current = null;
        }}
        onTouchEnd={handleMapTouchEnd}
        onTouchStart={handleMapTouchStart}
        style={styles.map}>
        <Map
          attribution={false}
          compass={false}
          logo={false}
          mapStyle={MAP_STYLES[resolvedTheme]}
          onRegionDidChange={handleRegionDidChange}
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
            hitbox={{ top: 32, right: 32, bottom: 32, left: 32 }}
            onPress={handleMarkerPress}>
            <Layer
              id="club-marker-shadow"
              type="circle"
              paint={{
                'circle-radius': 16,
                'circle-color': 'rgba(0, 0, 0, 0.24)',
                'circle-blur': 0.9,
                'circle-translate': [0, 3],
              }}
            />
            <Layer
              id="club-marker-fill"
              type="circle"
              paint={{
                'circle-radius': 14,
                'circle-color': MAP_LAYER_COLORS.markerFill,
                'circle-stroke-color': MAP_LAYER_COLORS.markerStroke,
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

          <GeoJSONSource id="selected-club-marker" data={selectedMarkerData}>
            <Layer
              id="selected-club-marker-shadow"
              type="circle"
              paint={{
                'circle-radius': 16,
                'circle-color': 'rgba(244, 214, 77, 0.4)',
                'circle-blur': 0.9,
                'circle-translate': [0, 3],
              }}
            />
            <Layer
              id="selected-club-marker-fill"
              type="circle"
              paint={{
                'circle-radius': 14,
                'circle-color': MAP_LAYER_COLORS.selectedFill,
                'circle-stroke-color': MAP_LAYER_COLORS.selectedStroke,
                'circle-stroke-width': 1.5,
              }}
            />
            <Layer
              id="selected-club-marker-icon"
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
      </View>

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
          accessibilityLabel={t('discover.centerUserLocation')}
          onPress={onCenterUserLocation}
          theme={resolvedTheme}>
          <LocateFixed size={22} color={controlColors.foreground} strokeWidth={2.5} />
        </MapControlButton>

        <MapControlButton
          accessibilityLabel={t('discover.showOpenToday')}
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
