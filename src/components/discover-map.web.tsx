import { Beer, CalendarCheck2, LocateFixed, UserRound } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { MapRegion } from '@/lib/map-types';

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

export function DiscoverMap({
  markers,
  selectedMarkerId,
  userLocation,
  openTodayOnly,
  initialRegion,
  onRegionChangeComplete,
  onSelectMarker,
  onCenterUserLocation,
  onToggleOpenToday,
}: DiscoverMapProps) {
  return (
    <View className="h-[360px] overflow-hidden rounded-[14px] border border-border bg-secondary px-4 py-4">
      <View className="flex-row items-start justify-between gap-3">
        <View>
          <Text className="text-sm font-semibold">Kartenansicht (Web-Fallback)</Text>
          <Text className="text-muted-foreground mt-1 text-xs">
            Interaktive Marker sind in der nativen App verfügbar.
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
            onPress={onCenterUserLocation}>
            <LocateFixed size={18} color="#111111" strokeWidth={2.4} />
          </Pressable>
          <Pressable
            className={openTodayOnly ? 'h-10 flex-row items-center justify-center gap-2 rounded-full bg-primary px-3' : 'h-10 flex-row items-center justify-center gap-2 rounded-full bg-white px-3'}
            onPress={onToggleOpenToday}>
            <CalendarCheck2 size={18} color="#111111" strokeWidth={2.4} />
            <Text className="text-xs font-bold text-[#111111]">Heute offen</Text>
          </Pressable>
        </View>
      </View>
      {userLocation ? (
        <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-card px-3 py-2">
          <View className="h-8 w-8 items-center justify-center rounded-full border-2 border-foreground bg-primary">
            <UserRound size={14} color="#111111" strokeWidth={2.5} />
          </View>
          <Text className="text-sm font-medium">Eigener Standort gesetzt</Text>
        </View>
      ) : null}
      <View className="mt-4 gap-2">
        {markers.map((marker) => {
          const selected = marker.id === selectedMarkerId;
          return (
            <Pressable
              key={marker.id}
              className={selected ? 'rounded-xl border border-primary bg-card px-3 py-2' : 'rounded-xl border border-border bg-card px-3 py-2'}
              onPress={() => {
                onSelectMarker(marker.id);
                onRegionChangeComplete(initialRegion);
              }}>
              <View className="flex-row items-center gap-2">
                <View
                  className={
                    selected
                      ? 'h-8 w-8 items-center justify-center rounded-full bg-primary'
                      : 'h-8 w-8 items-center justify-center rounded-full bg-white'
                  }>
                  <Beer size={14} color="#111111" strokeWidth={2.4} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium">{marker.title}</Text>
                  {marker.subtitle ? (
                    <Text className="text-muted-foreground text-xs">{marker.subtitle}</Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export type { DiscoverMarker };
