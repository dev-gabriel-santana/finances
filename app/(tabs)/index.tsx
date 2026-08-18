import Storage from 'expo-sqlite/kv-store';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalanceChart } from '@/src/components/dashboard/BalanceChart';
import { BalanceSummary } from '@/src/components/dashboard/BalanceSummary';
import { TransactionList } from '@/src/components/dashboard/TransactionList';
import { ThemeToggle } from '@/src/components/ui/ThemeToggle';
import { CURRENT_BALANCE_STORAGE_KEY } from '@/src/constants/storageKeys';
import { useDashboard } from '@/src/hooks/useDashboard';
import { useAppTheme } from '@/src/theme/theme';
import { formatCurrency } from '@/src/utils/currency';

export default function DashboardScreen() {
  const { colors } = useAppTheme();
  const [currentBalanceInCents, setCurrentBalanceInCents] = useState(0);
  const {
    summary,
    history,
    recentTransactions,
    isLoading,
    error,
    reload,
  } = useDashboard();

  const loadCurrentBalance = useCallback(async () => {
    try {
      const stored = await Storage.getItem(CURRENT_BALANCE_STORAGE_KEY);
      const parsed = Number(stored ?? '0');

      if (Number.isFinite(parsed) && parsed >= 0) {
        setCurrentBalanceInCents(parsed);
        return;
      }
    } catch {
      // Keep current value when storage read fails.
    }

    setCurrentBalanceInCents(0);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadCurrentBalance();
    }, [loadCurrentBalance]),
  );

  const handleRefresh = useCallback(() => {
    void loadCurrentBalance();
    void reload();
  }, [loadCurrentBalance, reload]);

  if (isLoading && recentTransactions.length === 0 && history.length === 0) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Não foi possível carregar os dados</Text>
        <Pressable onPress={handleRefresh} style={[styles.retryButton, { backgroundColor: colors.primaryStrong }]}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.brand, { color: colors.primary }]}>FINANÇAS</Text>
              <Text style={[styles.heading, { color: colors.text }]}>Visão geral</Text>
            </View>
            <ThemeToggle />
          </View>

          <View style={[styles.currentBalanceCard, { backgroundColor: colors.balanceSurface, borderColor: colors.balanceBorder }]}> 
            <Text style={[styles.currentBalanceLabel, { color: colors.textMuted }]}>SALDO ATUAL EM CONTA</Text>
            <Text style={[styles.currentBalanceValue, { color: colors.onStrong }]}>
              {formatCurrency(currentBalanceInCents)}
            </Text>
          </View>
        </View>

        <BalanceSummary summary={summary} />

        <View style={[styles.sectionDivider, { backgroundColor: colors.background }]} />
        <BalanceChart history={history} />

        <View style={[styles.sectionDivider, { backgroundColor: colors.background }]} />
        <TransactionList transactions={recentTransactions} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f5f3',
  },
  content: {
    paddingBottom: 28,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brand: {
    color: '#168a5b',
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0,
  },
  heading: {
    color: '#17201c',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 3,
  },
  currentBalanceCard: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  currentBalanceLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  currentBalanceValue: {
    fontFamily: 'SpaceMono',
    fontSize: 24,
    marginTop: 4,
  },
  sectionDivider: {
    backgroundColor: '#f2f5f3',
    height: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#f2f5f3',
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#f2f5f3',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#303c36',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#17201c',
    borderRadius: 6,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
