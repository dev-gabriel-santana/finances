import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/src/theme/theme";

interface LoadingStateProps {
  label?: string;
  compact?: boolean;
}

export function LoadingState({
  label = "Carregando...",
  compact = false,
}: LoadingStateProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        compact ? styles.compact : styles.full,
        { backgroundColor: colors.background },
      ]}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <ActivityIndicator color={colors.primaryStrong} size="small" />
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  full: {
    flex: 1,
    padding: 20,
  },
  compact: {
    paddingVertical: 18,
  },
  card: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});
