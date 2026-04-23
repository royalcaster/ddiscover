import { MoonStar, UserRound } from 'lucide-react-native';
import { View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { ThemeModeToggle } from '@/components/theme-mode-toggle';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const theme = useTheme();

  return (
    <ScreenShell
      eyebrow="Profil"
      title="Einstellungen und Konto"
      description="Theme switching already works. This screen becomes the natural home for personalization once auth and favorites deepen.">
      <View className="gap-3">
        <Card className="py-4">
          <CardContent className="gap-4 px-4">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <UserRound size={20} color={theme.primary} />
              </View>
              <View>
                <Text className="text-base font-semibold">Gastmodus</Text>
                <Text className="text-muted-foreground text-sm">
                  Clubs entdecken ohne Konto
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent className="gap-4 px-4">
            <View className="flex-row items-center gap-2">
              <MoonStar size={18} color={theme.primary} />
              <Text className="text-base font-semibold">Farbschema</Text>
            </View>
            <ThemeModeToggle />
          </CardContent>
        </Card>
      </View>
    </ScreenShell>
  );
}
