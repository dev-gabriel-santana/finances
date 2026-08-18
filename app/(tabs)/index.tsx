import { useCallback } from 'react';
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
import { useDashboard } from '@/src/hooks/useDashboard';
import { useAppTheme } from '@/src/theme/theme';

export default function DashboardScreen() {
  const { colors } = useAppTheme();
  const {
    summary,
    history,
    recentTransactions,
    isLoading,
    error,
    reload,
  } = useDashboard();

  const handleRefresh = useCallback(() => {
    void reload();
  }, [reload]);

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
