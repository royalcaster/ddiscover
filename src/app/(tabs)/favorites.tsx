import { Image } from 'expo-image';
import { Heart } from 'lucide-react-native';
import { View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { previewClubs } from '@/lib/discovery';

export default function FavoritesScreen() {
  const theme = useTheme();
  const favorites = previewClubs.slice(0, 2);

  return (
    <ScreenShell title="Favoriten">
      <View className="gap-3">
        {favorites.map((club) => (
          <Card key={club.id} className="gap-0 rounded-[22px] py-0">
            <CardContent className="flex-row gap-3 px-3 py-3">
              <Image source={club.imageUrl} contentFit="cover" className="h-20 w-20 rounded-[16px]" />
              <View className="flex-1 justify-between">
                <View className="gap-1">
                  <Text className="text-[16px] font-semibold">{club.name}</Text>
                  <Text className="text-muted-foreground text-[13px]">
                    {club.category} • {club.district}
                  </Text>
                  <Text className="text-[13px]">{club.tonight}</Text>
                </View>
                <Text className="text-muted-foreground text-[12px]">{club.walkDistance}</Text>
              </View>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <Heart size={16} color={theme.primary} />
              </View>
            </CardContent>
          </Card>
        ))}

        <Button variant="secondary" className="rounded-full">
          <Text>Weitere Clubs merken</Text>
        </Button>
      </View>
    </ScreenShell>
  );
}
