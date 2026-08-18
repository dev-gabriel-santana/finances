import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { LineChart, type lineDataItem } from 'react-native-gifted-charts';

import type { MonthlyBalance } from '@/src/db/queries/transactions';
import { useAppTheme } from '@/src/theme/theme';
import { formatCompactCurrency } from '@/src/utils/currency';
import { formatMonthPeriod } from '@/src/utils/dates';

interface BalanceChartProps {
  history: MonthlyBalance[];
}

export function BalanceChart({ history }: BalanceChartProps) {
  const { colors } = useAppTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const chartData: lineDataItem[] = history.map((item) => ({
    value: item.balanceInCents / 100,
    label: formatMonthPeriod(item.period),
    dataPointText: formatCompactCurrency(item.balanceInCents),
  }));

  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]} onLayout={handleLayout}>
      <View style={styles.headingRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Balanço mensal</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Receitas menos despesas</Text>
        </View>
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>Saldo</Text>
        </View>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyLine, { borderTopColor: colors.border }]} />
          <Text style={[styles.emptyText, { backgroundColor: colors.surface, color: colors.textMuted }]}>Nenhum lançamento neste período</Text>
        </View>
      ) : containerWidth > 0 ? (
        <View style={styles.chart}>
          <LineChart
            data={chartData}
            width={Math.max(containerWidth - 74, 220)}
            height={168}
            color={colors.primary}
            thickness={3}
            curved
            areaChart
            startFillColor={colors.primary}
            endFillColor={colors.surface}
            startOpacity={0.22}
            endOpacity={0}
            dataPointsColor={colors.primary}
            dataPointsRadius={4}
            hideDataPoints={history.length > 8}
            initialSpacing={12}
            endSpacing={12}
            noOfSections={4}
            rulesColor={colors.border}
            rulesType="solid"
            yAxisColor="transparent"
            xAxisColor={colors.border}
            yAxisTextStyle={[styles.axisText, { color: colors.textMuted }]}
            xAxisLabelTextStyle={[styles.axisLabel, { color: colors.textMuted }]}
            yAxisLabelWidth={48}
            formatYLabel={(value) =>
              formatCompactCurrency(Math.round(Number(value) * 100))
            }
          />
        </View>
      ) : null}
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
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  title: {
    color: '#17201c',
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: '#738078',
    fontSize: 12,
    marginTop: 3,
  },
  legend: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 3,
  },
  legendDot: {
    backgroundColor: '#168a5b',
    borderRadius: 4,
    height: 8,
    marginRight: 6,
    width: 8,
  },
  legendText: {
    color: '#526058',
    fontSize: 11,
  },
  chart: {
    marginLeft: -8,
    overflow: 'hidden',
  },
  axisText: {
    color: '#7c8881',
    fontSize: 9,
  },
  axisLabel: {
    color: '#68746d',
    fontSize: 10,
    textTransform: 'capitalize',
  },
  emptyState: {
    height: 174,
    justifyContent: 'center',
  },
  emptyLine: {
    borderTopColor: '#d7dfdb',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  emptyText: {
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    color: '#78847d',
    fontSize: 12,
    paddingHorizontal: 12,
    position: 'absolute',
  },
});