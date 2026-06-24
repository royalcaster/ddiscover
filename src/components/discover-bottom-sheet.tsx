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
import { useAppTheme } from '@/providers/theme-provider';

const COLLAPSED_CLUB_SUMMARY_HEIGHT = 122;
const COLLAPSED_EMPTY_HEIGHT = 112;

type SheetSnapState = 'collapsed' | 'half' | 'expanded';

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
  const { colors, resolvedTheme } = useAppTheme();
  const { height } = useWindowDimensions();
  const maxSheetHeight = Math.min(height * 0.78, 680);
  const collapsedHeight = selectedClub
    ? Math.min(maxSheetHeight - 24, COLLAPSED_CLUB_SUMMARY_HEIGHT)
    : COLLAPSED_EMPTY_HEIGHT;
  const snapPoints = React.useMemo(
    () => ({
      expanded: 0,
      half: Math.max(0, maxSheetHeight * 0.38),
      collapsed: Math.max(0, maxSheetHeight - collapsedHeight),
    }),
    [collapsedHeight, maxSheetHeight],
  );
  const translateY = React.useRef(new Animated.Value(snapPoints.collapsed)).current;
  const dragStartY = React.useRef(snapPoints.collapsed);
  const currentTranslateY = React.useRef(snapPoints.collapsed);
  const scrollOffsetY = React.useRef(0);
  const [snapState, setSnapState] = React.useState<SheetSnapState>('collapsed');
  const nextEvent = events[0] ?? null;
  const clubFavorited = selectedClub ? isClubFavorited(selectedClub._id) : false;
  const sheetBackgroundColor = resolvedTheme === 'light' ? 'hsl(0 0% 97%)' : colors.card;
  const rippleColor = resolvedTheme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)';
  const scrollEnabled = snapState === 'expanded';

  const animateTo = React.useCallback(
    (toValue: number, nextState?: SheetSnapState) => {
      currentTranslateY.current = toValue;
      if (nextState) {
        setSnapState(nextState);
      }
      Animated.spring(translateY, {
        toValue,
        useNativeDriver: true,
        damping: 26,
        stiffness: 230,
        mass: 0.9,
      }).start();
    },
    [translateY],
  );

  React.useEffect(() => {
    animateTo(snapPoints.collapsed, 'collapsed');
  }, [animateTo, selectedClub?._id, snapPoints.collapsed]);

  const nearestSnap = React.useCallback(
    (projectedY: number): SheetSnapState => {
      const entries = Object.entries(snapPoints) as [SheetSnapState, number][];
      return entries.reduce((nearest, entry) =>
        Math.abs(entry[1] - projectedY) < Math.abs(nearest[1] - projectedY) ? entry : nearest,
      )[0];
    },
    [snapPoints],
  );

  const shouldDragSheet = React.useCallback(
    (dy: number, dx: number) => {
      if (Math.abs(dy) <= 5 || Math.abs(dy) <= Math.abs(dx)) {
        return false;
      }

      if (currentTranslateY.current > snapPoints.expanded + 2) {
        return true;
      }

      return dy > 0 && scrollOffsetY.current <= 1;
    },
    [snapPoints.expanded],
  );

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          shouldDragSheet(gestureState.dy, gestureState.dx),
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          shouldDragSheet(gestureState.dy, gestureState.dx),
        onPanResponderGrant: () => {
          translateY.stopAnimation((value) => {
            dragStartY.current = value;
            currentTranslateY.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const nextTranslateY = Math.min(
            snapPoints.collapsed,
            Math.max(0, dragStartY.current + gestureState.dy),
          );
          currentTranslateY.current = nextTranslateY;
          translateY.setValue(nextTranslateY);
        },
        onPanResponderRelease: (_, gestureState) => {
          const projectedY = currentTranslateY.current + gestureState.vy * 120;
          const nextState = nearestSnap(projectedY);
          animateTo(snapPoints[nextState], nextState);
        },
        onPanResponderTerminate: () => {
          const nextState = nearestSnap(currentTranslateY.current);
          animateTo(snapPoints[nextState], nextState);
        },
      }),
    [animateTo, nearestSnap, shouldDragSheet, snapPoints, translateY],
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-[28px] border border-border bg-card"
      style={[
        styles.sheet,
        {
          maxHeight: maxSheetHeight,
          minHeight: maxSheetHeight,
          transform: [{ translateY }],
          backgroundColor: sheetBackgroundColor,
          borderColor: colors.border,
        },
      ]}>
      <View className="items-center px-5 pb-2 pt-2">
        <View className="h-1.5 w-12 rounded-full bg-muted" />
      </View>

      {selectedClub ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
          nestedScrollEnabled
          contentContainerStyle={{ paddingBottom: bottomInset + 22 }}
          onScroll={(event) => {
            scrollOffsetY.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
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
                    accessibilityLabel="Clubseite öffnen"
                    android_ripple={{ color: rippleColor, borderless: true }}
                    className="h-11 w-11 items-center justify-center rounded-full bg-secondary"
                    onPress={() => onOpenSource(selectedClub.websiteUrl)}>
                    <ExternalLink size={19} color={colors.foreground} />
                  </Pressable>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={clubFavorited ? 'Club aus Favoriten entfernen' : 'Club speichern'}
                  android_ripple={{ color: rippleColor, borderless: true }}
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
                  <Text className="text-sm font-semibold text-foreground">Nächstes Event</Text>
                </View>
                <GripHorizontal size={16} color={colors.mutedForeground} />
              </View>

              {nextEvent ? (
                <Pressable
                  android_ripple={{ color: rippleColor }}
                  className="gap-2"
                  onPress={() => onOpenEvent(nextEvent._id)}>
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
                  Keine bevorstehenden Events für diesen Club.
                </Text>
              )}
            </View>

            <View className="flex-row flex-wrap gap-2">
              {nextEvent ? (
                <>
                  <Button
                    size="sm"
                    variant={isEventFavorited(nextEvent._id) ? 'default' : 'outline'}
                    android_ripple={{ color: rippleColor }}
                    className="rounded-full"
                    onPress={() => onToggleEventFavorite(nextEvent._id)}>
                    <Heart
                      size={14}
                      color={isEventFavorited(nextEvent._id) ? colors.primaryForeground : colors.foreground}
                      fill={isEventFavorited(nextEvent._id) ? colors.primaryForeground : 'transparent'}
                    />
                    <Text>{isEventFavorited(nextEvent._id) ? 'Event gespeichert' : 'Event speichern'}</Text>
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    android_ripple={{ color: rippleColor }}
                    className="rounded-full"
                    onPress={() => onOpenEvent(nextEvent._id)}>
                    <CalendarClock size={14} />
                    <Text>Details</Text>
                  </Button>

                  {nextEvent.sourceUrl ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      android_ripple={{ color: rippleColor }}
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
                      android_ripple={{ color: rippleColor }}
                      className="flex-row gap-3 rounded-[16px] border border-border bg-background px-3 py-3"
                      onPress={() => onOpenEvent(event._id)}>
                      <View className="h-11 w-11 items-center justify-center rounded-full bg-secondary">
                        <Music2 size={18} color={colors.foreground} />
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
                        android_ripple={{ color: rippleColor, borderless: true }}
                        className="h-10 w-10 items-center justify-center rounded-full"
                        onPress={(pressEvent) => {
                          pressEvent.stopPropagation();
                          onToggleEventFavorite(event._id);
                        }}>
                        <Heart
                          size={18}
                          color={favorited ? colors.foreground : colors.mutedForeground}
                          fill={favorited ? colors.foreground : 'transparent'}
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
            {isLoading ? 'Clubs werden geladen...' : 'Keine Clubs verfügbar'}
          </Text>
          <Text className="text-muted-foreground text-sm">
            {errorMessage
              ? `Convex konnte nicht geladen werden: ${errorMessage}`
              : 'Sobald Clubs geladen sind, erscheint hier die Club- und Eventübersicht.'}
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
