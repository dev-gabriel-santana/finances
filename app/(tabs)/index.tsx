import { useFocusEffect } from "expo-router";
import Storage from "expo-sqlite/kv-store";
import { SymbolView } from "expo-symbols";
import { useCallback, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BalanceChart } from "@/src/components/dashboard/BalanceChart";
import { BalanceSummary } from "@/src/components/dashboard/BalanceSummary";
import { TransactionList } from "@/src/components/dashboard/TransactionList";
import { LoadingState } from "@/src/components/ui/LoadingState";
import { OfflineBadge } from "@/src/components/ui/OfflineBadge";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { CURRENT_BALANCE_STORAGE_KEY } from "@/src/constants/storageKeys";
import { useDatabase } from "@/src/db/provider";
import { getCurrentAccountPixAdjustment } from "@/src/db/queries/transactions";
import { useDashboard } from "@/src/hooks/useDashboard";
import { useAppTheme } from "@/src/theme/theme";
import { formatCurrency } from "@/src/utils/currency";

export default function DashboardScreen() {
  const { colors } = useAppTheme();
  const database = useDatabase();
  const [currentBalanceBaseInCents, setCurrentBalanceBaseInCents] = useState(0);
  const [currentBalanceInCents, setCurrentBalanceInCents] = useState(0);
  const [currentBalanceInput, setCurrentBalanceInput] = useState("");
  const [currentPixAdjustmentInCents, setCurrentPixAdjustmentInCents] =
    useState(0);
  const [isEditingCurrentBalance, setIsEditingCurrentBalance] = useState(false);
  const { summary, history, recentTransactions, isLoading, error, reload } =
    useDashboard();

  const loadCurrentBalance = useCallback(async () => {
    try {
      const [stored, pixAdjustment] = await Promise.all([
        Storage.getItem(CURRENT_BALANCE_STORAGE_KEY),
        getCurrentAccountPixAdjustment(database),
      ]);
      const parsed = Number(stored ?? "0");

      if (Number.isFinite(parsed) && parsed >= 0) {
        setCurrentBalanceBaseInCents(parsed);
        setCurrentPixAdjustmentInCents(pixAdjustment.balanceInCents);
        setCurrentBalanceInput(String(parsed));
        setCurrentBalanceInCents(parsed + pixAdjustment.balanceInCents);
        return;
      }
    } catch {
      // Keep current value when storage read fails.
    }

    setCurrentBalanceBaseInCents(0);
    setCurrentPixAdjustmentInCents(0);
    setCurrentBalanceInput("0");
    setCurrentBalanceInCents(0);
  }, [database]);

  useFocusEffect(
    useCallback(() => {
      void loadCurrentBalance();
    }, [loadCurrentBalance]),
  );

  const handleRefresh = useCallback(() => {
    void loadCurrentBalance();
    void reload();
  }, [loadCurrentBalance, reload]);

  const handleSaveCurrentBalance = useCallback(async () => {
    const nextBalanceInCents = Number(currentBalanceInput || 0);

    if (!Number.isFinite(nextBalanceInCents) || nextBalanceInCents < 0) {
      return;
    }

    try {
      setCurrentBalanceBaseInCents(nextBalanceInCents);
      setCurrentBalanceInCents(
        nextBalanceInCents + currentPixAdjustmentInCents,
      );
      await Storage.setItem(
        CURRENT_BALANCE_STORAGE_KEY,
        String(nextBalanceInCents),
      );
    } catch {
      setCurrentBalanceBaseInCents(nextBalanceInCents);
      setCurrentBalanceInCents(
        nextBalanceInCents + currentPixAdjustmentInCents,
      );
    } finally {
      setIsEditingCurrentBalance(false);
    }
  }, [currentBalanceInput, currentPixAdjustmentInCents]);

  const handleCancelCurrentBalanceEdit = useCallback(() => {
    setCurrentBalanceInput(String(currentBalanceBaseInCents));
    setIsEditingCurrentBalance(false);
  }, [currentBalanceBaseInCents]);

  if (isLoading && recentTransactions.length === 0 && history.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <LoadingState label="Carregando painel..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Não foi possível carregar os dados
        </Text>
        <Pressable
          onPress={handleRefresh}
          style={[
            styles.retryButton,
            { backgroundColor: colors.primaryStrong },
          ]}
        >
          <Text style={styles.retryText}>Tentar novamente</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.brand, { color: colors.primary }]}>
                FINANÇAS
              </Text>
              <Text style={[styles.heading, { color: colors.text }]}>
                Visão geral
              </Text>
              <OfflineBadge />
            </View>
            <ThemeToggle />
          </View>

          <View
            style={[
              styles.currentBalanceCard,
              {
                backgroundColor: colors.balanceSurface,
                borderColor: colors.balanceBorder,
              },
            ]}
          >
            <View style={styles.balanceHeaderRow}>
              <Text
                style={[
                  styles.currentBalanceLabel,
                  { color: colors.textMuted },
                ]}
              >
                SALDO ATUAL EM CONTA
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Editar saldo atual"
                onPress={() => {
                  setCurrentBalanceInput(String(currentBalanceBaseInCents));
                  setIsEditingCurrentBalance(true);
                }}
                style={({ pressed }) => [
                  styles.editButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: colors.text,
                    shadowOpacity: 0.12,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 1 },
                  },
                  pressed && styles.buttonPressed,
                ]}
              >
                <SymbolView
                  name={{
                    ios: "pencil",
                    android: "edit",
                    web: "edit",
                  }}
                  size={12}
                  tintColor={colors.primaryStrong}
                />
              </Pressable>
            </View>
            <Text
              style={[
                styles.currentBalanceValue,
                { color: colors.balanceText },
              ]}
            >
              {formatCurrency(currentBalanceInCents)}
            </Text>
          </View>
        </View>

        <BalanceSummary summary={summary} />

        <View
          style={[
            styles.sectionDivider,
            { backgroundColor: colors.background },
          ]}
        />
        <BalanceChart history={history} />

        <View
          style={[
            styles.sectionDivider,
            { backgroundColor: colors.background },
          ]}
        />
        <TransactionList transactions={recentTransactions} />
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={isEditingCurrentBalance}
        onRequestClose={handleCancelCurrentBalanceEdit}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Ajustar saldo atual
            </Text>
            <Text
              style={[styles.modalDescription, { color: colors.textMuted }]}
            >
              Atualize o valor base da sua conta para refletir no saldo atual e
              nas projeções.
            </Text>

            <TextInput
              autoFocus
              keyboardType="number-pad"
              onChangeText={(text) =>
                setCurrentBalanceInput(
                  text.replace(/\D/g, "").replace(/^0+(?=\d)/, ""),
                )
              }
              placeholder="R$ 0,00"
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.primary}
              style={[
                styles.balanceInput,
                {
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={
                Number(currentBalanceInput || 0) > 0
                  ? formatCurrency(Number(currentBalanceInput))
                  : ""
              }
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={handleCancelCurrentBalanceEdit}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.secondaryButton,
                  { borderColor: colors.border },
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text
                  style={[styles.secondaryButtonText, { color: colors.text }]}
                >
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  void handleSaveCurrentBalance();
                }}
                style={({ pressed }) => [
                  styles.modalButton,
                  { backgroundColor: colors.primaryStrong },
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text
                  style={[styles.primaryButtonText, { color: colors.onStrong }]}
                >
                  Salvar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingBottom: 28,
  },
  header: {
    backgroundColor: "#ffffff",
    paddingBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brand: {
    color: "#168a5b",
    fontFamily: "SpaceMono",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0,
  },
  heading: {
    color: "#17201c",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 3,
  },
  currentBalanceCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  balanceHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  currentBalanceLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  editButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    paddingHorizontal: 8,
    width: 28,
  },
  currentBalanceValue: {
    fontFamily: "SpaceMono",
    fontSize: 24,
    marginTop: 4,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 420,
    padding: 18,
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  balanceInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontFamily: "SpaceMono",
    fontSize: 22,
    height: 56,
    marginTop: 14,
    paddingHorizontal: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  modalButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.7,
  },
  sectionDivider: {
    height: 10,
  },
  loadingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  errorContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    color: "#303c36",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#17201c",
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});
