import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

import { useAppTheme } from '@/src/theme/theme';

export default function TabLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 66,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'chart.line.uptrend.xyaxis',
                android: 'monitoring',
                web: 'monitoring',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Lançamentos',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'list.bullet.rectangle',
                android: 'receipt_long',
                web: 'receipt_long',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="projections"
        options={{
          title: 'Projeções',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'calendar.badge.clock',
                android: 'calendar_month',
                web: 'calendar_month',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Cadastros',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'slider.horizontal.3',
                android: 'tune',
                web: 'tune',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen name="cards" options={{ href: null }} />
      <Tabs.Screen name="categories" options={{ href: null }} />
    </Tabs>
  );
}
