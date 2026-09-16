import { Pressable, Text, TextInput, View } from "react-native";
import { BarChart, type barDataItem } from "react-native-gifted-charts";

import type { FutureProjectionMonth } from "@/src/db/projections";
import { useAppTheme } from "@/src/theme/theme";
import { formatCurrency } from "@/src/utils/currency";

import { styles } from "./style";

interface ProjectionSummaryProps {
  currentBalanceInCents: number;
  currentBalanceInput: string;
  currentPixAdjustmentInCents: number;
  isEditingCurrentBalance: boolean;
  isSelectedCurrentMonth: boolean;
  onCancelCurrentBalanceEdit: () => void;
  onChangeCurrentBalanceInput: (value: string) => void;
  onEditCurrentBalance: () => void;
  onSaveCurrentBalance: () => void;
  totals: FutureProjectionMonth;
}

export function ProjectionSummary({
  currentBalanceInCents,
  currentBalanceInput,
  currentPixAdjustmentInCents,
  isEditingCurrentBalance,
  isSelectedCurrentMonth,
  onCancelCurrentBalanceEdit,
  onChangeCurrentBalanceInput,
  onEditCurrentBalance,
  onSaveCurrentBalance,
  totals,
}: ProjectionSummaryProps) {
  const { colors } = useAppTheme();
  const futureBalanceAfterBillsInCents =
    currentBalanceInCents +
    totals.balanceInCents -
    (isSelectedCurrentMonth ? currentPixAdjustmentInCents : 0);
  const chartData: barDataItem[] = [
    {
      value: totals.incomeInCents / 100,
      label: "Receitas",
      frontColor: colors.income,
      topLabelComponent: () => (
        <Text style={[styles.chartValue, { color: colors.income }]}>
          {formatCurrency(totals.incomeInCents)}
        </Text>
      ),
    },
    {
      value: totals.expenseInCents / 100,
      label: "Despesas",
      frontColor: colors.expense,
      topLabelComponent: () => (
        <Text style={[styles.chartValue, { color: colors.expense }]}>
          {formatCurrency(totals.expenseInCents)}
        </Text>
      ),
    },
  ];

  return (
    <View style={[styles.summary, { backgroundColor: colors.balanceSurface }]}>
      <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
        SALDO ATUAL EM CONTA
      </Text>

      {isEditingCurrentBalance ? (
        <View style={styles.currentBalanceEditArea}>
          <TextInput
            keyboardType="number-pad"
            keyboardAppearance="default"
            onChangeText={onChangeCurrentBalanceInput}
            placeholder="R$ 0,00"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            style={[
              styles.currentBalanceInput,
              {
                borderColor: colors.balanceBorder,
                color: colors.onStrong,
              },
            ]}
            value={
              Number(currentBalanceInput || 0) > 0
                ? formatCurrency(Number(currentBalanceInput))
                : ""
            }
          />

          <View style={styles.currentBalanceActions}>
            <Pressable
              onPress={onSaveCurrentBalance}
              style={({ pressed }) => [
                styles.currentBalanceActionButton,
                { backgroundColor: colors.primaryStrong },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.currentBalanceActionText,
                  { color: colors.onStrong },
                ]}
              >
                Salvar
              </Text>
            </Pressable>
            <Pressable
              onPress={onCancelCurrentBalanceEdit}
              style={({ pressed }) => [
                styles.currentBalanceActionButton,
                styles.currentBalanceActionSecondary,
                { borderColor: colors.balanceBorder },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.currentBalanceActionText,
                  { color: colors.onStrong },
                ]}
              >
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={[styles.summaryBalance, { color: colors.onStrong }]}
          >
            {formatCurrency(currentBalanceInCents)}
          </Text>
          <Pressable
            onPress={onEditCurrentBalance}
            style={({ pressed }) => [
              styles.editCurrentBalanceButton,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[styles.editCurrentBalanceText, { color: colors.primary }]}
            >
              Editar saldo atual
            </Text>
          </Pressable>
        </>
      )}

      <View
        style={[
          styles.futureBalanceBlock,
          { borderColor: colors.balanceBorder },
        ]}
      >
        <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
          SALDO FUTURO - APOS PAGAR TUDO
        </Text>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[styles.futureBalanceValue, { color: colors.onStrong }]}
        >
          {formatCurrency(futureBalanceAfterBillsInCents)}
        </Text>
        <Text style={[styles.futureFormula, { color: colors.textMuted }]}>
          {formatCurrency(currentBalanceInCents)} +{" "}
          {formatCurrency(totals.incomeInCents)} -{" "}
          {formatCurrency(totals.expenseInCents)}
        </Text>
      </View>

      <Text
        style={[
          styles.summaryLabel,
          styles.monthSummaryLabel,
          { color: colors.textMuted },
        ]}
      >
        SALDO DO MÊS
      </Text>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[styles.summaryBalance, { color: colors.onStrong }]}
      >
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
      <View
        style={[styles.chartContainer, { backgroundColor: colors.surface }]}
      >
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
  );
}
