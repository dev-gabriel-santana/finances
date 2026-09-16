import { endOfMonth, format, startOfMonth, subDays } from "date-fns";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { PieChart, type pieDataItem } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

import { DateField } from "@/src/components/forms/DateField";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { useExpenseBreakdown } from "@/src/hooks/useExpenseBreakdown";
import { useAppTheme } from "@/src/theme/theme";
import { formatCurrency } from "@/src/utils/currency";

import { styles } from "./style";

type PeriodFilter = "all" | "month" | "last30" | "custom";

const periodOptions: Array<{ label: string; value: PeriodFilter }> = [
  { label: "Todo histórico", value: "all" },
  { label: "Mês atual", value: "month" },
  { label: "Últimos 30 dias", value: "last30" },
  { label: "Personalizado", value: "custom" },
];

export function SpendingScreen() {
  const { colors } = useAppTheme();
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const today = new Date();
  const customRangeReady = Boolean(customStartDate && customEndDate);
  const startDate =
    period === "month"
      ? format(startOfMonth(today), "yyyy-MM-dd")
      : period === "last30"
        ? format(subDays(today, 29), "yyyy-MM-dd")
        : period === "custom" && customStartDate
          ? format(customStartDate, "yyyy-MM-dd")
          : undefined;
  const endDate =
    period === "month"
      ? format(endOfMonth(today), "yyyy-MM-dd")
      : period === "last30"
        ? format(today, "yyyy-MM-dd")
        : period === "custom" && customEndDate
          ? format(customEndDate, "yyyy-MM-dd")
          : undefined;
  const { error, isLoading, items, totalInCents } = useExpenseBreakdown(
    startDate,
    endDate,
    period !== "custom" || customRangeReady,
  );
  const chartData: pieDataItem[] = items.map((item) => ({
    value: item.amountInCents,
    color: item.color,
  }));

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headingRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              ANÁLISE
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Gastos por categoria
            </Text>
          </View>
          <ThemeToggle />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/spending-cards")}
          style={({ pressed }) => [
            styles.cardViewButton,
            { backgroundColor: colors.primaryStrong },
            pressed && styles.cardViewButtonPressed,
          ]}
        >
          <SymbolView
            name={{
              ios: "creditcard.fill",
              android: "credit_card",
              web: "credit_card",
            }}
            size={20}
            tintColor={colors.onStrong}
          />
          <Text style={[styles.cardViewButtonText, { color: colors.onStrong }]}>
            Ver gastos por cartão
          </Text>
        </Pressable>

        <View style={styles.filterArea}>
          <View style={styles.filters}>
            {periodOptions.map((option) => {
              const isSelected = period === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => setPeriod(option.value)}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterLabel,
                      { color: isSelected ? colors.onStrong : colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {period === "custom" ? (
            <View style={styles.customFilters}>
              <DateField
                label="Data inicial"
                onChange={setCustomStartDate}
                value={customStartDate}
              />
              <DateField
                label="Data final"
                onChange={setCustomEndDate}
                value={customEndDate}
              />
            </View>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.expense }]}>
            Não foi possível carregar os gastos.
          </Text>
        </View>
      ) : period === "custom" && !customRangeReady ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Selecione um intervalo
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Escolha as datas inicial e final para visualizar os gastos.
          </Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Nenhum gasto registrado
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Seus gastos por categoria aparecerão aqui.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.chartPanel,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.chart}>
              <PieChart
                data={chartData}
                donut
                innerRadius={78}
                radius={116}
                centerLabelComponent={() => (
                  <View
                    style={[
                      styles.centerLabel,
                      { backgroundColor: colors.surfaceElevated },
                    ]}
                  >
                    <Text
                      style={[
                        styles.centerCaption,
                        { color: colors.textMuted },
                      ]}
                    >
                      TOTAL GASTO
                    </Text>
                    <Text style={[styles.centerValue, { color: colors.text }]}>
                      {formatCurrency(totalInCents)}
                    </Text>
                  </View>
                )}
              />
            </View>

            <View style={styles.legend}>
              {items.map((item) => (
                <View key={item.category} style={styles.legendRow}>
                  <View
                    style={[styles.swatch, { backgroundColor: item.color }]}
                  />
                  <Text style={[styles.legendCategory, { color: colors.text }]}>
                    {item.category}
                  </Text>
                  <Text
                    style={[styles.legendAmount, { color: colors.textMuted }]}
                  >
                    {formatCurrency(item.amountInCents)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
