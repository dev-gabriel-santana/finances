import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { FutureProjection } from "@/src/db/projections";
import { useAppTheme } from "@/src/theme/theme";
import { formatCurrency } from "@/src/utils/currency";
import { formatTransactionDate } from "@/src/utils/dates";

interface ProjectionRowProps {
  item: FutureProjection;
}

export function ProjectionRow({ item }: ProjectionRowProps) {
  const { colors } = useAppTheme();
  const isIncome = item.type === "income";
  const detail = item.installmentCount
    ? `Parcela ${item.installmentNumber}/${item.installmentCount}`
    : item.isRecurring
      ? "Recorrente prevista"
      : item.category;

  return (
    <Pressable
      disabled={!item.transactionId}
      onPress={() =>
        item.transactionId
          ? router.push({
              pathname: "/transactions/[id]",
              params: { id: String(item.transactionId) },
            })
          : undefined
      }
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
        pressed && item.transactionId !== null && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.marker,
          {
            backgroundColor: isIncome
              ? colors.incomeSurface
              : colors.expenseSurface,
          },
        ]}
      >
        <Text
          style={[
            styles.markerText,
            { color: isIncome ? colors.income : colors.expense },
          ]}
        >
          {item.isRecurring
            ? "↻"
            : item.installmentCount
              ? "#"
              : isIncome
                ? "+"
                : "−"}
        </Text>
      </View>

      <View style={styles.rowContent}>
        <Text
          numberOfLines={1}
          style={[styles.rowTitle, { color: colors.text }]}
        >
          {item.title}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.rowMeta, { color: colors.textMuted }]}
        >
          {detail} · {formatTransactionDate(item.transactionDate)}
        </Text>
      </View>

      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[
          styles.rowAmount,
          { color: isIncome ? colors.income : colors.expense },
        ]}
      >
        {isIncome ? "+" : "-"} {formatCurrency(item.amountInCents)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 72,
    paddingHorizontal: 20,
  },
  marker: {
    alignItems: "center",
    borderRadius: 6,
    height: 36,
    justifyContent: "center",
    marginRight: 12,
    width: 36,
  },
  markerText: {
    fontSize: 16,
    fontWeight: "700",
  },
  rowContent: {
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  rowMeta: {
    fontSize: 10,
    marginTop: 4,
  },
  rowAmount: {
    fontFamily: "SpaceMono",
    fontSize: 11,
    maxWidth: "34%",
    textAlign: "right",
  },
  pressed: {
    opacity: 0.65,
  },
});
