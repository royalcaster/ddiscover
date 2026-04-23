import { Heart } from 'lucide-react-native';
import { View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

export default function FavoritesScreen() {
  const theme = useTheme();

  return (
    <ScreenShell
      eyebrow="Favoriten"
      title="Merkliste und Club-Shortcuts"
      description="Placeholder shell for saved clubs and events. The structure is here so the navigation matches the product design.">
      <Card className="py-4">
        <CardContent className="items-center gap-4 px-4 py-10">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Heart size={22} color={theme.primary} />
          </View>
          <View className="items-center gap-2">
            <Text className="text-lg font-semibold">Noch keine Favoriten</Text>
            <Text className="text-muted-foreground max-w-[320px] text-center text-sm">
              Save clubs and event cards from Discover or Calendar once those interactions are wired.
            </Text>
          </View>
          <Button variant="secondary">
            <Text>Discover oeffnen</Text>
          </Button>
        </CardContent>
      </Card>
    </ScreenShell>
  );
}
