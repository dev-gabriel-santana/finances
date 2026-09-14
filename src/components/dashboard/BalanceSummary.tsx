import { StyleSheet, Text, View } from 'react-native';

import type { BalanceSummary as BalanceSummaryData } from '@/src/db/queries/transactions';
import { useAppTheme } from '@/src/theme/theme';
import { formatCurrency } from '@/src/utils/currency';

interface BalanceSummaryProps {
  summary: BalanceSummaryData;
}

export function BalanceSummary({ summary }: BalanceSummaryProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.balanceSurface }]}>
      <Text style={[styles.eyebrow, { color: colors.textMuted }]}>SALDO ATUAL</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.65}
        style={[styles.balance, { color: colors.balanceText }]}>
        {formatCurrency(summary.balanceInCents)}
      </Text>

      <View style={[styles.divider, { backgroundColor: colors.balanceBorder }]} />

      <View style={styles.breakdown}>
        <View style={styles.metric}>
          <View style={[styles.indicator, { backgroundColor: colors.income }]} />
          <View>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Receitas</Text>
            <Text style={[styles.metricValue, { color: colors.balanceText }]}>
              {formatCurrency(summary.incomeInCents)}
            </Text>
          </View>
        </View>

        <View style={styles.metric}>
          <View style={[styles.indicator, { backgroundColor: colors.expense }]} />
          <View>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Despesas</Text>
            <Text style={[styles.metricValue, { color: colors.balanceText }]}>
              {formatCurrency(summary.expenseInCents)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16211d',
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 22,
  },
  eyebrow: {
    color: '#a9b8b1',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
  },
  balance: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 34,
    marginTop: 6,
  },
  divider: {
    backgroundColor: '#34423c',
    height: StyleSheet.hairlineWidth,
    marginVertical: 22,
  },
  breakdown: {
    flexDirection: 'row',
    gap: 26,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  indicator: {
    borderRadius: 2,
    height: 30,
    marginRight: 10,
    width: 4,
  },
  metricLabel: {
    color: '#a9b8b1',
    fontSize: 12,
  },
  metricValue: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 13,
    marginTop: 3,
  },
});