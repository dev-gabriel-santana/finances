import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Transaction } from "@/src/db/schema";
import { useAppTheme } from "@/src/theme/theme";
import { formatCurrency } from "@/src/utils/currency";
import { formatTransactionDate } from "@/src/utils/dates";

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
}

export function TransactionList({
  transactions,
  title = "Últimos lançamentos",
}: TransactionListProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <View style={styles.headingRow}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.count, { color: colors.textMuted }]}>
            {transactions.length}
          </Text>
        </View>
      </View>

      {transactions.length === 0 ? (
        <View
          style={[
            styles.emptyState,
            {
              borderColor: colors.border,
              backgroundColor: colors.surfaceElevated,
            },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Ainda não há movimentações
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Registre uma receita ou despesa no seu dispositivo para começar.
          </Text>
        </View>
      ) : (
        transactions.map((transaction, index) => {
          const isIncome = transaction.type === "income";

          return (
            <Pressable
              key={transaction.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/transactions/[id]",
                  params: { id: String(transaction.id) },
                })
              }
              style={({ pressed }) => [
                styles.row,
                index < transactions.length - 1 && [
                  styles.rowBorder,
                  { borderBottomColor: colors.border },
                ],
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
                {isIncome ? "+" : "-"}{" "}
                {formatCurrency(transaction.amountInCents)}
              </Text>
              <Text style={[styles.chevron, { color: colors.textMuted }]}>
                ›
              </Text>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  headingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    color: "#17201c",
    fontSize: 17,
    fontWeight: "700",
  },
  countBadge: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  count: {
    fontFamily: "SpaceMono",
    fontSize: 11,
    fontWeight: "700",
  },
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
  emptyState: {
    alignItems: "center",
    borderColor: "#dfe6e2",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 34,
  },
  emptyTitle: {
    color: "#334139",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyText: {
    color: "#7a867f",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
});
