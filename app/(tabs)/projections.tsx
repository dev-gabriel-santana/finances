import { addMonths, endOfYear, format, parseISO, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProjectionRow } from "@/src/components/projections/ProjectionRow";
import { ProjectionSummary } from "@/src/components/projections/ProjectionSummary";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { emptyProjection, useProjections } from "@/src/hooks/useProjections";
import { useAppTheme } from "@/src/theme/theme";
import { formatCurrency } from "@/src/utils/currency";

function formatPeriod(period: string): string {
  const formatted = format(parseISO(`${period}-01`), "MMMM yyyy", {
    locale: ptBR,
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function ProjectionsScreen() {
  const { colors } = useAppTheme();
  const {
    currentBalanceInCents,
    currentBalanceInput,
    currentDate,
    currentPixAdjustmentInCents,
    error,
    firstMonth,
    handleCancelCurrentBalanceEdit,
    handleSaveCurrentBalance,
    isEditingCurrentBalance,
    isLoading,
    months,
    selectedMonth,
    selectedPeriod,
    setCurrentBalanceInput,
    setIsEditingCurrentBalance,
    setSelectedMonth,
  } = useProjections();
  const lastMonth = startOfMonth(endOfYear(currentDate));
  const isFirstMonth = selectedPeriod === format(firstMonth, "yyyy-MM");
  const isLastMonth = selectedPeriod === format(lastMonth, "yyyy-MM");

  const selectedProjection = months[0];
  const totals = selectedProjection ?? emptyProjection(selectedPeriod);
  const isSelectedCurrentMonth =
    selectedPeriod === format(currentDate, "yyyy-MM");

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headingRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              PLANEJAMENTO
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Projeção mensal
            </Text>
          </View>
          <ThemeToggle />
        </View>

        <View style={styles.monthNavigator}>
          <Pressable
            accessibilityLabel="Mês anterior"
            disabled={isFirstMonth}
            onPress={() => setSelectedMonth((month) => addMonths(month, -1))}
            style={({ pressed }) => [
              styles.monthButton,
              isFirstMonth && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.monthArrow, { color: colors.text }]}>‹</Text>
          </Pressable>
          <Text style={[styles.yearCaption, { color: colors.text }]}>
            {formatPeriod(selectedPeriod)}
          </Text>
          <Pressable
            accessibilityLabel="Próximo mês"
            disabled={isLastMonth}
            onPress={() => setSelectedMonth((month) => addMonths(month, 1))}
            style={({ pressed }) => [
              styles.monthButton,
              isLastMonth && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
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
          contentContainerStyle={
            months.length === 0 ? styles.emptyContent : styles.listContent
          }
          keyExtractor={(item) => item.key}
          sections={months.map((month) => ({
            ...month,
            title: month.period,
            data: month.items,
          }))}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
          ListHeaderComponent={
            <ProjectionSummary
              currentBalanceInCents={currentBalanceInCents}
              currentBalanceInput={currentBalanceInput}
              currentPixAdjustmentInCents={currentPixAdjustmentInCents}
              isEditingCurrentBalance={isEditingCurrentBalance}
              isSelectedCurrentMonth={isSelectedCurrentMonth}
              onCancelCurrentBalanceEdit={handleCancelCurrentBalanceEdit}
              onChangeCurrentBalanceInput={(text) =>
                setCurrentBalanceInput(
                  text.replace(/\D/g, "").replace(/^0+(?=\d)/, ""),
                )
              }
              onEditCurrentBalance={() => setIsEditingCurrentBalance(true)}
              onSaveCurrentBalance={handleSaveCurrentBalance}
              totals={totals}
            />
          }
          ListEmptyComponent={
            <View style={[styles.empty, { borderColor: colors.border }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Nenhum lançamento futuro
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Nenhum lançamento previsto para este mês.
              </Text>
            </View>
          }
          renderItem={({ item }) => <ProjectionRow item={item} />}
          renderSectionHeader={({ section }) => (
            <View
              style={[
                styles.monthHeader,
                { backgroundColor: colors.background },
              ]}
            >
              <View>
                <Text style={[styles.monthTitle, { color: colors.text }]}>
                  {formatPeriod(section.period)}
                </Text>
                <Text style={[styles.monthCount, { color: colors.textMuted }]}>
                  {section.data.length} lançamento
                  {section.data.length === 1 ? "" : "s"}
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
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eyebrow: {
    fontFamily: "SpaceMono",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 3,
  },
  yearCaption: {
    flex: 1,
    fontSize: 12,
    textAlign: "center",
  },
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 13,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 28,
  },
  emptyContent: {
    flexGrow: 1,
    padding: 20,
  },
  monthNavigator: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 14,
  },
  monthButton: {
    alignItems: "center",
    borderRadius: 6,
    height: 34,
    justifyContent: "center",
    width: 38,
  },
  monthArrow: {
    fontSize: 29,
    lineHeight: 31,
  },
  disabled: {
    opacity: 0.25,
  },
  pressed: {
    opacity: 0.65,
  },
  monthHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 66,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  monthCount: {
    fontSize: 10,
    marginTop: 3,
  },
  monthTotal: {
    fontFamily: "SpaceMono",
    fontSize: 12,
  },
  empty: {
    alignItems: "center",
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    marginTop: 24,
    padding: 30,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
  },
});
