import { StyleSheet, Text, View } from "react-native";

import { TransactionListItem } from "@/src/components/dashboard/TransactionListItem";
import type { Transaction } from "@/src/db/schema";
import { useAppTheme } from "@/src/theme/theme";

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
        transactions.map((transaction, index) => (
          <TransactionListItem
            key={transaction.id}
            isLast={index === transactions.length - 1}
            transaction={transaction}
          />
        ))
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
