import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Transaction } from "@/src/db/schema";
import { useAppTheme } from "@/src/theme/theme";
import { formatCurrency } from "@/src/utils/currency";
import { formatTransactionDate } from "@/src/utils/dates";

interface TransactionListItemProps {
  transaction: Transaction;
  isLast: boolean;
}

export function TransactionListItem({
  transaction,
  isLast,
}: TransactionListItemProps) {
  const { colors } = useAppTheme();
  const isIncome = transaction.type === "income";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/transactions/[id]",
          params: { id: String(transaction.id) },
        })
      }
      style={({ pressed }) => [
        styles.row,
        !isLast && [styles.rowBorder, { borderBottomColor: colors.border }],
        pressed && styles.rowPressed,
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
        <Text style={[styles.markerText, { color: colors.text }]}>
          {isIncome ? "↓" : "↑"}
        </Text>
      </View>

      <View style={styles.details}>
        <Text
          numberOfLines={1}
          style={[styles.transactionTitle, { color: colors.text }]}
        >
          {transaction.title}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.meta, { color: colors.textMuted }]}
        >
          {transaction.category} ·{" "}
          {formatTransactionDate(transaction.transactionDate)}
        </Text>
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.amount,
          { color: isIncome ? colors.income : colors.expense },
        ]}
      >
        {isIncome ? "+" : "-"} {formatCurrency(transaction.amountInCents)}
      </Text>
      <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    minHeight: 72,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  rowPressed: {
    opacity: 0.72,
  },
  rowBorder: {
    borderBottomColor: "#e6ebe8",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  marker: {
    alignItems: "center",
    borderRadius: 8,
    height: 36,
    justifyContent: "center",
    marginRight: 12,
    width: 36,
  },
  markerText: {
    color: "#26342e",
    fontSize: 17,
    fontWeight: "700",
  },
  details: {
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  transactionTitle: {
    color: "#1a241f",
    fontSize: 14,
    fontWeight: "600",
  },
  meta: {
    color: "#7a867f",
    fontSize: 11,
    marginTop: 4,
  },
  amount: {
    fontFamily: "SpaceMono",
    fontSize: 12,
    maxWidth: "34%",
    textAlign: "right",
  },
  chevron: {
    color: "#89948e",
    fontSize: 20,
    marginLeft: 8,
  },
});
