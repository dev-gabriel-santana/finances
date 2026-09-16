import { endOfMonth, format, startOfMonth, subDays } from "date-fns";
import { router, Stack } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DateField } from "@/src/components/forms/DateField";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { useSpendingByCard } from "@/src/hooks/useSpendingByCard";
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

export function SpendingCardsScreen() {
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
  const { error, isLoading, items } = useSpendingByCard(
    startDate,
    endDate,
    period !== "custom" || customRangeReady,
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headingRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              ANÁLISE
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Gastos por cartão
            </Text>
          </View>
          <ThemeToggle />
        </View>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>
            ‹ Gastos por categoria
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
            Nenhum cartão cadastrado
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Cadastre um cartão para acompanhar seus gastos por cartão.
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/settings/cards")}
            style={[
              styles.emptyButton,
              { backgroundColor: colors.primaryStrong },
            ]}
          >
            <Text style={[styles.emptyButtonText, { color: colors.onStrong }]}>
              Cadastrar cartão
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.list,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {items.map((item, index) => (
              <Pressable
                key={item.cardId}
                onPress={() =>
                  router.push({
                    pathname: "/spending-card/[id]",
                    params: { id: String(item.cardId) },
                  })
                }
                style={({ pressed }) => [
                  styles.cardRow,
                  index < items.length - 1 && styles.cardRowBorder,
                  { borderBottomColor: colors.border },
                  pressed && styles.cardRowPressed,
                ]}
              >
                <View style={styles.cardHeading}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardName, { color: colors.text }]}>
                      {item.cardName}
                    </Text>
                    <Text
                      style={[styles.cardBrand, { color: colors.textMuted }]}
                    >
                      {item.cardBrand}
                    </Text>
                  </View>
                  <Text style={[styles.cardTotal, { color: colors.expense }]}>
                    {formatCurrency(item.amountInCents)}
                  </Text>
                </View>
                <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
                  {item.transactionCount} lançamento
                  {item.transactionCount === 1 ? "" : "s"}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
