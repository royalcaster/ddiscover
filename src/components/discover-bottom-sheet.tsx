import type { Id } from '../../convex/_generated/dataModel';
import { Building2, CalendarClock, ExternalLink, GripHorizontal, Heart, MapPin, Music2 } from 'lucide-react-native';
import React from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

const COLLAPSED_CLUB_SUMMARY_HEIGHT = 122;
const COLLAPSED_EMPTY_HEIGHT = 112;

type DiscoverSheetClub = {
  _id: Id<'clubs'>;
  name: string;
  city?: string;
  addressLine?: string;
  websiteUrl?: string;
};

type DiscoverSheetEvent = {
  _id: Id<'events'>;
  title: string;
  startsAt: number;
  locationName?: string;
  sourceUrl?: string;
};

type DiscoverBottomSheetProps = {
  selectedClub: DiscoverSheetClub | null;
  events: DiscoverSheetEvent[];
  isLoading?: boolean;
  errorMessage?: string | null;
  bottomInset: number;
  isClubFavorited: (clubId: Id<'clubs'>) => boolean;
  isEventFavorited: (eventId: Id<'events'>) => boolean;
  onToggleClubFavorite: (clubId: Id<'clubs'>) => void;
  onToggleEventFavorite: (eventId: Id<'events'>) => void;
  onOpenEvent: (eventId: Id<'events'>) => void;
  onOpenSource: (url?: string) => void;
};

function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function DiscoverBottomSheet({
  selectedClub,
  events,
  isLoading = false,
  errorMessage = null,
  bottomInset,
  isClubFavorited,
  isEventFavorited,
  onToggleClubFavorite,
  onToggleEventFavorite,
  onOpenEvent,
  onOpenSource,
}: DiscoverBottomSheetProps) {
  const colors = useTheme();
  const { height } = useWindowDimensions();
  const maxSheetHeight = Math.min(height * 0.72, 620);
  const collapsedHeight = selectedClub
    ? Math.min(maxSheetHeight - 24, COLLAPSED_CLUB_SUMMARY_HEIGHT)
    : COLLAPSED_EMPTY_HEIGHT;
  const collapsedTranslateY = Math.max(0, maxSheetHeight - collapsedHeight);
  const translateY = React.useRef(new Animated.Value(collapsedTranslateY)).current;
  const dragStartY = React.useRef(collapsedTranslateY);
  const currentTranslateY = React.useRef(collapsedTranslateY);
  const nextEvent = events[0] ?? null;
  const clubFavorited = selectedClub ? isClubFavorited(selectedClub._id) : false;

  const animateTo = React.useCallback(
    (toValue: number) => {
      currentTranslateY.current = toValue;
      Animated.spring(translateY, {
        toValue,
        useNativeDriver: true,
        damping: 24,
        stiffness: 220,
        mass: 0.9,
      }).start();
    },
    [translateY],
  );

  React.useEffect(() => {
    animateTo(collapsedTranslateY);
  }, [animateTo, collapsedTranslateY, selectedClub?._id]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderGrant: () => {
          translateY.stopAnimation((value) => {
            dragStartY.current = value;
            currentTranslateY.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const nextTranslateY = Math.min(
            collapsedTranslateY,
            Math.max(0, dragStartY.current + gestureState.dy),
          );
          translateY.setValue(nextTranslateY);
        },
        onPanResponderRelease: (_, gestureState) => {
          const projectedY = currentTranslateY.current + gestureState.dy + gestureState.vy * 80;
          animateTo(projectedY > collapsedTranslateY * 0.5 ? collapsedTranslateY : 0);
        },
        onPanResponderTerminate: () => {
          animateTo(currentTranslateY.current > collapsedTranslateY * 0.5 ? collapsedTranslateY : 0);
        },
      }),
    [animateTo, collapsedTranslateY, translateY],
  );

  return (
    <Animated.View
      className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-[28px] border border-border bg-card"
      style={[
        styles.sheet,
        {
          maxHeight: maxSheetHeight,
          minHeight: maxSheetHeight,
          transform: [{ translateY }],
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}>
      <View {...panResponder.panHandlers} className="items-center px-5 pb-2 pt-2">
        <View className="h-1.5 w-12 rounded-full bg-muted" />
      </View>

      {selectedClub ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomInset + 22 }}
          className="px-4">
          <View className="gap-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1 gap-2">
                <View className="flex-row items-center gap-2">
                  <Badge variant="secondary" className="rounded-full px-2.5 py-1">
                    <Building2 size={12} color={colors.foreground} />
                    <Text>Club</Text>
                  </Badge>
                  <Text className="text-muted-foreground text-xs font-medium">
                    {events.length} {events.length === 1 ? 'Event' : 'Events'}
                  </Text>
                </View>
                <Text className="text-2xl font-bold leading-8 text-foreground" numberOfLines={1}>
                  {selectedClub.name}
                </Text>
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} color={colors.mutedForeground} />
                  <Text className="text-muted-foreground text-sm" numberOfLines={1}>
                    {selectedClub.addressLine ?? selectedClub.city ?? 'Dresden'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                {selectedClub.websiteUrl ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Clubseite oeffnen"
                    className="h-11 w-11 items-center justify-center rounded-full bg-secondary"
                    onPress={() => onOpenSource(selectedClub.websiteUrl)}>
                    <ExternalLink size={19} color={colors.foreground} />
                  </Pressable>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={clubFavorited ? 'Club aus Favoriten entfernen' : 'Club speichern'}
                  className="h-11 w-11 items-center justify-center rounded-full bg-secondary"
                  onPress={() => onToggleClubFavorite(selectedClub._id)}>
                  <Heart
                    size={20}
                    color={clubFavorited ? colors.primary : colors.foreground}
                    fill={clubFavorited ? colors.primary : 'transparent'}
                  />
                </Pressable>
              </View>
            </View>

            <View className="gap-3 rounded-[18px] border border-border bg-background px-3 py-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Badge className="rounded-full px-2.5 py-1">
                    <Text>Event</Text>
                  </Badge>
                  <Text className="text-sm font-semibold text-foreground">Naechstes Event</Text>
                </View>
                <GripHorizontal size={16} color={colors.mutedForeground} />
              </View>

              {nextEvent ? (
                <Pressable className="gap-2" onPress={() => onOpenEvent(nextEvent._id)}>
                  <Text className="text-lg font-semibold text-foreground" numberOfLines={2}>
                    {nextEvent.title}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <CalendarClock size={14} color={colors.mutedForeground} />
                    <Text className="text-muted-foreground text-sm">
                      {formatDateTime(nextEvent.startsAt)}
                    </Text>
                  </View>
                </Pressable>
              ) : (
                <Text className="text-muted-foreground text-sm">
                  Keine bevorstehenden Events fuer diesen Club.
                </Text>
              )}
            </View>

            <View className="flex-row flex-wrap gap-2">
              {nextEvent ? (
                <>
                  <Button
                    size="sm"
                    variant={isEventFavorited(nextEvent._id) ? 'default' : 'outline'}
                    className="rounded-full"
                    onPress={() => onToggleEventFavorite(nextEvent._id)}>
                    <Heart
                      size={14}
                      color={isEventFavorited(nextEvent._id) ? colors.primaryForeground : colors.primary}
                      fill={isEventFavorited(nextEvent._id) ? colors.primaryForeground : 'transparent'}
                    />
                    <Text>{isEventFavorited(nextEvent._id) ? 'Event gespeichert' : 'Event speichern'}</Text>
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    onPress={() => onOpenEvent(nextEvent._id)}>
                    <CalendarClock size={14} />
                    <Text>Details</Text>
                  </Button>

                  {nextEvent.sourceUrl ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-full"
                      onPress={() => onOpenSource(nextEvent.sourceUrl)}>
                      <ExternalLink size={14} />
                      <Text>Quelle</Text>
                    </Button>
                  ) : null}
                </>
              ) : null}

            </View>

            <View className="gap-2 pt-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">Events in diesem Club</Text>
                <Text className="text-muted-foreground text-sm">{events.length}</Text>
              </View>

              {events.length > 0 ? (
                events.map((event) => {
                  const favorited = isEventFavorited(event._id);
                  return (
                    <Pressable
                      key={event._id}
                      className="flex-row gap-3 rounded-[16px] border border-border bg-background px-3 py-3"
                      onPress={() => onOpenEvent(event._id)}>
                      <View className="h-11 w-11 items-center justify-center rounded-full bg-secondary">
                        <Music2 size={18} color={colors.primary} />
                      </View>
                      <View className="min-w-0 flex-1 gap-1">
                        <View className="flex-row items-center gap-2">
                          <Badge variant="outline" className="px-2 py-0.5">
                            <Text>Event</Text>
                          </Badge>
                          <Text className="text-muted-foreground text-xs">
                            {formatDateTime(event.startsAt)}
                          </Text>
                        </View>
                        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                          {event.title}
                        </Text>
                        <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                          {event.locationName ?? selectedClub.name}
                        </Text>
                      </View>
                      <Pressable
                        className="h-10 w-10 items-center justify-center rounded-full"
                        onPress={(pressEvent) => {
                          pressEvent.stopPropagation();
                          onToggleEventFavorite(event._id);
                        }}>
                        <Heart
                          size={18}
                          color={favorited ? colors.primary : colors.mutedForeground}
                          fill={favorited ? colors.primary : 'transparent'}
                        />
                      </Pressable>
                    </Pressable>
                  );
                })
              ) : (
                <View className="rounded-[16px] border border-border bg-background px-3 py-5">
                  <Text className="text-muted-foreground text-sm">
                    Dieser Club hat aktuell keine importierten kommenden Events.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View className="gap-2 px-5 pb-8">
          <Text className="text-lg font-semibold text-foreground">
            {isLoading ? 'Clubs werden geladen...' : 'Keine Clubs verfuegbar'}
          </Text>
          <Text className="text-muted-foreground text-sm">
            {errorMessage
              ? `Convex konnte nicht geladen werden: ${errorMessage}`
              : 'Sobald Clubs geladen sind, erscheint hier die Club- und Eventuebersicht.'}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
});
