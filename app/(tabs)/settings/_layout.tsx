import { Stack } from 'expo-router';

import { useAppTheme } from '@/src/theme/theme';

export default function SettingsLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerBackTitle: 'Voltar',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="cards" options={{ title: 'Cartões' }} />
      <Stack.Screen name="cards-list" options={{ title: 'Todos os cartões' }} />
      <Stack.Screen name="categories" options={{ title: 'Categorias' }} />
      <Stack.Screen name="categories-list" options={{ title: 'Todas as categorias' }} />
    </Stack>
  );
}