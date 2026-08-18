import { format, parseISO } from 'date-fns';
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

const horizonOptions = [6, 12, 24] as const;

function formatPeriod(period: string): string {
  const formatted = format(parseISO(`${period}-01`), 'MMMM yyyy', { locale: ptBR });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function ProjectionsScreen() {
  const database = useDatabase();
  const { colors } = useAppTheme();
  const [horizon, setHorizon] = useState<(typeof horizonOptions)[number]>(12);
  const [months, setMonths] = useState<FutureProjectionMonth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProjections() {
        setIsLoading(true);

        try {
          const result = await getFutureProjections(database, horizon);

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
    }, [database, horizon]),
  );

  const totals = months.reduce(
    (summary, month) => ({
      incomeInCents: summary.incomeInCents + month.incomeInCents,
      expenseInCents: summary.expenseInCents + month.expenseInCents,
      balanceInCents: summary.balanceInCents + month.balanceInCents,
    }),
    { incomeInCents: 0, expenseInCents: 0, balanceInCents: 0 },
  );

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
            <Text style={[styles.title, { color: colors.text }]}>Próximos meses</Text>
          </View>
          <ThemeToggle />
        </View>

        <View style={[styles.segmented, { backgroundColor: colors.surfaceElevated }]}>
          {horizonOptions.map((option) => {
            const isSelected = horizon === option;

            return (
              <Pressable
                key={option}
                onPress={() => setHorizon(option)}
                style={[
                  styles.segment,
                  isSelected && { backgroundColor: colors.primaryStrong },
                ]}>
                <Text
                  style={[
                    styles.segmentText,
                    { color: isSelected ? colors.onStrong : colors.textMuted },
                  ]}>
                  {option} meses
                </Text>
              </Pressable>
            );
          })}
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
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>SALDO PROJETADO</Text>
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
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={[styles.empty, { borderColor: colors.border }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum lançamento futuro</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Parcelas e despesas recorrentes aparecerão aqui.
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
  segmented: {
    borderRadius: 6,
    flexDirection: 'row',
    marginTop: 18,
    padding: 3,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 4,
    flex: 1,
    height: 34,
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '700',
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