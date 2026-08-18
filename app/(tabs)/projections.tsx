import { addMonths, endOfYear, format, getMonth, parseISO, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, type barDataItem } from 'react-native-gifted-charts';

import { ThemeToggle } from '@/src/components/ui/ThemeToggle';
import {
  getFutureProjections,
  type FutureProjection,
  type FutureProjectionMonth,
} from '@/src/db/projections';
import { useDatabase } from '@/src/db/provider';
import { useAppTheme } from '@/src/theme/theme';
import { formatCurrency } from '@/src/utils/currency';
import { formatTransactionDate } from '@/src/utils/dates';

function formatPeriod(period: string): string {
  const formatted = format(parseISO(`${period}-01`), 'MMMM yyyy', { locale: ptBR });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function ProjectionsScreen() {
  const database = useDatabase();
  const { colors } = useAppTheme();
  const [months, setMonths] = useState<FutureProjectionMonth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const currentDate = new Date();
  const firstMonth = startOfMonth(currentDate);
  const lastMonth = startOfMonth(endOfYear(currentDate));
  const [selectedMonth, setSelectedMonth] = useState(firstMonth);
  const selectedPeriod = format(selectedMonth, 'yyyy-MM');
  const isFirstMonth = selectedPeriod === format(firstMonth, 'yyyy-MM');
  const isLastMonth = selectedPeriod === format(lastMonth, 'yyyy-MM');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProjections() {
        setIsLoading(true);

        try {
          const result = await getFutureProjections(
            database,
            1,
            currentDate,
            selectedMonth,
          );

          if (isActive) {
            setMonths(result);
            setError(null);
          }
        } catch (cause) {
          if (isActive) {
            setError(
              cause instanceof Error
                ? cause
                : new Error('Falha ao carregar projeções'),
            );
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadProjections();

      return () => {
        isActive = false;
      };
    }, [database, selectedPeriod, selectedMonth]),
  );

  const selectedProjection = months[0];
  const totals = selectedProjection ?? {
    incomeInCents: 0,
    expenseInCents: 0,
    balanceInCents: 0,
    items: [],
    period: selectedPeriod,
  };
  const chartData: barDataItem[] = [
    {
      value: totals.incomeInCents / 100,
      label: 'Receitas',
      frontColor: colors.income,
      topLabelComponent: () => (
        <Text style={[styles.chartValue, { color: colors.income }]}>
          {formatCurrency(totals.incomeInCents)}
        </Text>
      ),
    },
    {
      value: totals.expenseInCents / 100,
      label: 'Despesas',
      frontColor: colors.expense,
      topLabelComponent: () => (
        <Text style={[styles.chartValue, { color: colors.expense }]}>
          {formatCurrency(totals.expenseInCents)}
        </Text>
      ),
    },
  ];

  const renderProjection = ({ item }: { item: FutureProjection }) => {
    const isIncome = item.type === 'income';
    const detail = item.installmentCount
      ? `Parcela ${item.installmentNumber}/${item.installmentCount}`
      : item.isRecurring
        ? 'Recorrente prevista'
        : item.category;

    return (
      <Pressable
        disabled={!item.transactionId}
        onPress={() =>
          item.transactionId
            ? router.push({
                pathname: '/transactions/[id]',
                params: { id: String(item.transactionId) },
              })
            : undefined
        }
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
          pressed && item.transactionId !== null && styles.pressed,
        ]}>
        <View
          style={[
            styles.marker,
            {
              backgroundColor: isIncome
                ? colors.incomeSurface
                : colors.expenseSurface,
            },
          ]}>
          <Text style={[styles.markerText, { color: isIncome ? colors.income : colors.expense }]}>
            {item.isRecurring ? '↻' : item.installmentCount ? '#' : isIncome ? '+' : '−'}
          </Text>
        </View>

        <View style={styles.rowContent}>
          <Text numberOfLines={1} style={[styles.rowTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text numberOfLines={1} style={[styles.rowMeta, { color: colors.textMuted }]}>
            {detail} · {formatTransactionDate(item.transactionDate)}
          </Text>
        </View>

        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[
            styles.rowAmount,
            { color: isIncome ? colors.income : colors.expense },
          ]}>
          {isIncome ? '+' : '-'} {formatCurrency(item.amountInCents)}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headingRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>PLANEJAMENTO</Text>
            <Text style={[styles.title, { color: colors.text }]}>Projeção mensal</Text>
          </View>
          <ThemeToggle />
        </View>

        <View style={styles.monthNavigator}>
          <Pressable
            accessibilityLabel="Mês anterior"
            disabled={isFirstMonth}
            onPress={() => setSelectedMonth((month) => addMonths(month, -1))}
            style={({ pressed }) => [styles.monthButton, isFirstMonth && styles.disabled, pressed && styles.pressed]}>
            <Text style={[styles.monthArrow, { color: colors.text }]}>‹</Text>
          </Pressable>
          <Text style={[styles.yearCaption, { color: colors.text }]}>{formatPeriod(selectedPeriod)}</Text>
          <Pressable
            accessibilityLabel="Próximo mês"
            disabled={isLastMonth}
            onPress={() => setSelectedMonth((month) => addMonths(month, 1))}
            style={({ pressed }) => [styles.monthButton, isLastMonth && styles.disabled, pressed && styles.pressed]}>
            <Text style={[styles.monthArrow, { color: colors.text }]}>›</Text>
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.expense }]}>
            Não foi possível carregar as projeções.
          </Text>
        </View>
      ) : (
        <SectionList
          contentContainerStyle={months.length === 0 ? styles.emptyContent : styles.listContent}
          keyExtractor={(item) => item.key}
          sections={months.map((month) => ({ ...month, title: month.period, data: month.items }))}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
          ListHeaderComponent={
            months.length > 0 ? (
              <View style={[styles.summary, { backgroundColor: colors.balanceSurface }]}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>SALDO DO MÊS</Text>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[styles.summaryBalance, { color: colors.onStrong }]}>
                  {formatCurrency(totals.balanceInCents)}
                </Text>
                <View style={styles.summaryBreakdown}>
                  <Text style={[styles.summaryMetric, { color: colors.income }]}>
                    + {formatCurrency(totals.incomeInCents)}
                  </Text>
                  <Text style={[styles.summaryMetric, { color: colors.expense }]}>
                    - {formatCurrency(totals.expenseInCents)}
                  </Text>
                </View>
                <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}> 
                  <BarChart
                    data={chartData}
                    barWidth={46}
                    barBorderRadius={5}
                    height={150}
                    noOfSections={4}
                    spacing={42}
                    yAxisTextStyle={[styles.axisText, { color: colors.textMuted }]}
                    xAxisLabelTextStyle={[styles.axisLabel, { color: colors.textMuted }]}
                    rulesColor={colors.border}
                    yAxisColor="transparent"
                    xAxisColor={colors.border}
                    formatYLabel={(value) => `R$ ${value}`}
                  />
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={[styles.empty, { borderColor: colors.border }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum lançamento futuro</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}> 
                Nenhum lançamento previsto para este mês.
              </Text>
            </View>
          }
          renderItem={renderProjection}
          renderSectionHeader={({ section }) => (
            <View style={[styles.monthHeader, { backgroundColor: colors.background }]}>
              <View>
                <Text style={[styles.monthTitle, { color: colors.text }]}>
                  {formatPeriod(section.period)}
                </Text>
                <Text style={[styles.monthCount, { color: colors.textMuted }]}>
                  {section.data.length} lançamento{section.data.length === 1 ? '' : 's'}
                </Text>
              </View>
              <Text style={[styles.monthTotal, { color: colors.expense }]}>
                {formatCurrency(section.expenseInCents)}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 3,
  },
  yearCaption: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 28,
  },
  emptyContent: {
    flexGrow: 1,
    padding: 20,
  },
  summary: {
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  summaryBalance: {
    fontFamily: 'SpaceMono',
    fontSize: 28,
    marginTop: 5,
  },
  summaryBreakdown: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 14,
  },
  summaryMetric: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
  },
  monthNavigator: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 14,
  },
  monthButton: {
    alignItems: 'center',
    borderRadius: 6,
    height: 34,
    justifyContent: 'center',
    width: 38,
  },
  monthArrow: {
    fontSize: 29,
    lineHeight: 31,
  },
  disabled: {
    opacity: 0.25,
  },
  chartContainer: {
    borderRadius: 8,
    marginTop: 20,
    paddingBottom: 8,
    paddingTop: 12,
  },
  chartValue: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    marginBottom: 4,
  },
  axisText: {
    fontSize: 9,
  },
  axisLabel: {
    fontSize: 10,
  },
  monthHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 66,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  monthCount: {
    fontSize: 10,
    marginTop: 3,
  },
  monthTotal: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 72,
    paddingHorizontal: 20,
  },
  marker: {
    alignItems: 'center',
    borderRadius: 6,
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36,
  },
  markerText: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowContent: {
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  rowMeta: {
    fontSize: 10,
    marginTop: 4,
  },
  rowAmount: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    maxWidth: '34%',
    textAlign: 'right',
  },
  pressed: {
    opacity: 0.65,
  },
  empty: {
    alignItems: 'center',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    marginTop: 24,
    padding: 30,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
});