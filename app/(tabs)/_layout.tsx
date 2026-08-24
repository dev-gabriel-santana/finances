import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/src/auth/AuthContext';
import { useAppTheme } from '@/src/theme/theme';

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarContentHeight = 66;

  const handleLogout = () => {
    Alert.alert('Sair da conta?', 'Você precisará fazer login novamente para acessar o app.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => void logout() },
    ]);
  };

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
          height: tabBarContentHeight + insets.bottom,
          paddingBottom: 8 + insets.bottom,
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
      <Tabs.Screen
        name="logout"
        options={{
          title: 'Sair',
          tabBarActiveTintColor: colors.expense,
          tabBarButton: ({ onPress: _ignored, style, children }) => (
            <Pressable
              accessibilityLabel="Sair da conta"
              accessibilityRole="button"
              onPress={handleLogout}
              style={style}>
              {children}
            </Pressable>
          ),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'rectangle.portrait.and.arrow.right',
                android: 'logout',
                web: 'logout',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
