import { Navigation, TramFront } from 'lucide-react-native';
import { View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { previewRoute } from '@/lib/discovery';

export default function RouteScreen() {
  const theme = useTheme();

  return (
    <ScreenShell title="Route">
      <View className="gap-3">
        <Card className="rounded-[22px] py-0">
          <CardHeader className="px-4 pt-4">
            <CardTitle className="text-[18px]">Louisenstraße → Pulse</CardTitle>
          </CardHeader>
          <CardContent className="gap-4 px-4 pb-4">
            <View className="rounded-[18px] bg-secondary p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold">22:15 - 22:38</Text>
                <Text className="text-muted-foreground">23 Min.</Text>
              </View>
              <View className="mt-3 flex-row items-center gap-3">
                <Navigation size={16} color={theme.foreground} />
                <TramFront size={16} color={theme.foreground} />
                <Text className="text-sm">Zu Fuß • Tram 7 • Zu Fuß</Text>
              </View>
            </View>

            {previewRoute.map((stop) => (
              <View key={`${stop.time}-${stop.title}`} className="flex-row gap-4">
                <Text className="text-muted-foreground w-14 text-sm">{stop.time}</Text>
                <View className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-medium">{stop.title}</Text>
                  <Text className="text-muted-foreground text-sm">{stop.detail}</Text>
                </View>
              </View>
            ))}
          </CardContent>
        </Card>

        <Button variant="default" className="rounded-full">
          <Navigation size={16} color={theme.primaryForeground} />
          <Text className="text-primary-foreground">Route starten</Text>
        </Button>
      </View>
    </ScreenShell>
  );
}
