import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/theme';

export function OfflineBadge() {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.primaryStrong,
          borderColor: colors.primaryStrong,
        },
      ]}>
      <Text style={[styles.text, { color: colors.onStrong }]}>MODO LOCAL</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
