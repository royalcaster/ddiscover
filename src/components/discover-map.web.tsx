import type { Region } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

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
    <View className="h-[360px] overflow-hidden rounded-[14px] border border-border bg-secondary px-4 py-4">
      <Text className="text-sm font-semibold">Kartenansicht (Web-Fallback)</Text>
      <Text className="text-muted-foreground mt-1 text-xs">
        Interaktive Marker sind in der nativen App verfuegbar.
      </Text>
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
                <MapPin size={14} color={selected ? '#f4d63d' : '#8c8d90'} />
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
