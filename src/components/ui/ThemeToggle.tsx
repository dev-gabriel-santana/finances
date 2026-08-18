import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { useAppTheme } from '@/src/theme/theme';

export function ThemeToggle() {
  const { mode, colors, toggleTheme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={mode === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
      accessibilityRole="button"
      hitSlop={8}
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        pressed && styles.pressed,
      ]}>
      <SymbolView
        name={{
          ios: mode === 'dark' ? 'sun.max.fill' : 'moon.fill',
          android: mode === 'dark' ? 'light_mode' : 'dark_mode',
          web: mode === 'dark' ? 'light_mode' : 'dark_mode',
        }}
        size={19}
        tintColor={colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  pressed: {
    opacity: 0.6,
  },
});