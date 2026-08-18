import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Transaction } from '@/src/db/schema';
import { useAppTheme } from '@/src/theme/theme';
import { formatCurrency } from '@/src/utils/currency';
import { formatTransactionDate } from '@/src/utils/dates';

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
}

export function TransactionList({
  transactions,
  title = 'Últimos lançamentos',
}: TransactionListProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <View style={styles.headingRow}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.count, { color: colors.textMuted }]}>{transactions.length}</Text>
      </View>

      {transactions.length === 0 ? (
        <View style={[styles.emptyState, { borderColor: colors.border }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Sua movimentação aparecerá aqui</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Registre uma receita ou despesa para começar.</Text>
        </View>
      ) : (
        transactions.map((transaction, index) => {
          const isIncome = transaction.type === 'income';

          return (
            <Pressable
              key={transaction.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/transactions/[id]',
                  params: { id: String(transaction.id) },
                })
              }
              style={[
                styles.row,
                index < transactions.length - 1 && [styles.rowBorder, { borderBottomColor: colors.border }],
              ]}>
              <View
                style={[
                  styles.marker,
                  { backgroundColor: isIncome ? colors.incomeSurface : colors.expenseSurface },
                ]}>
                <Text style={[styles.markerText, { color: colors.text }]}>{isIncome ? '↓' : '↑'}</Text>
              </View>

              <View style={styles.details}>
                <Text numberOfLines={1} style={[styles.transactionTitle, { color: colors.text }]}>
                  {transaction.title}
                </Text>
                <Text numberOfLines={1} style={[styles.meta, { color: colors.textMuted }]}>
                  {transaction.category} · {formatTransactionDate(transaction.transactionDate)}
                </Text>
              </View>

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>
                {isIncome ? '+' : '-'} {formatCurrency(transaction.amountInCents)}
              </Text>
              <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    color: '#17201c',
    fontSize: 17,
    fontWeight: '700',
  },
  count: {
    color: '#7a867f',
    fontFamily: 'SpaceMono',
    fontSize: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 72,
  },
  rowBorder: {
    borderBottomColor: '#e6ebe8',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  marker: {
    alignItems: 'center',
    borderRadius: 6,
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36,
  },
  incomeMarker: {
    backgroundColor: '#dff5ea',
  },
  expenseMarker: {
    backgroundColor: '#ffe6e1',
  },
  markerText: {
    color: '#26342e',
    fontSize: 17,
    fontWeight: '700',
  },
  details: {
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  transactionTitle: {
    color: '#1a241f',
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    color: '#7a867f',
    fontSize: 11,
    marginTop: 4,
  },
  amount: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    maxWidth: '34%',
    textAlign: 'right',
  },
  chevron: {
    color: '#89948e',
    fontSize: 20,
    marginLeft: 8,
  },
  income: {
    color: '#087a4d',
  },
  expense: {
    color: '#c34231',
  },
  emptyState: {
    alignItems: 'center',
    borderColor: '#dfe6e2',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 34,
  },
  emptyTitle: {
    color: '#334139',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    color: '#7a867f',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
});