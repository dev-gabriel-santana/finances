import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionList } from '@/src/components/dashboard/TransactionList';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { OfflineBadge } from '@/src/components/ui/OfflineBadge';
import { ThemeToggle } from '@/src/components/ui/ThemeToggle';
import { listTransactions } from '@/src/db/queries/transactions';
import { useDatabase } from '@/src/db/provider';
import type { Transaction } from '@/src/db/schema';
import { useAppTheme } from '@/src/theme/theme';

export default function TransactionsScreen() {
  const database = useDatabase();
  const { colors } = useAppTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadTransactions() {
        setIsLoading(true);
        const result = await listTransactions(database);

        if (isActive) {
          setTransactions(result);
          setIsLoading(false);
        }
      }

      void loadTransactions();

      return () => {
        isActive = false;
      };
    }, [database]),
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headingRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>HISTÓRICO</Text>
            <Text style={[styles.title, { color: colors.text }]}>Lançamentos</Text>
            <OfflineBadge />
          </View>
          <ThemeToggle />
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push('/transactions/expense')}
            style={({ pressed }) => [
              styles.actionButton,
              styles.expenseButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.actionSymbol}>−</Text>
            <Text style={styles.actionText}>Despesa</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/transactions/income')}
            style={({ pressed }) => [
              styles.actionButton,
              styles.incomeButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.actionSymbol}>+</Text>
            <Text style={styles.actionText}>Receita</Text>
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <LoadingState label="Carregando lançamentos..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <TransactionList title="Todos os lançamentos" transactions={transactions} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f2f5f3',
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  eyebrow: {
    color: '#168a5b',
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0,
  },
  title: {
    color: '#17201c',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 3,
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    flexDirection: 'row',
    height: 44,
    justifyContent: 'center',
  },
  expenseButton: {
    backgroundColor: '#c34231',
  },
  incomeButton: {
    backgroundColor: '#087a4d',
  },
  pressed: {
    opacity: 0.7,
  },
  actionSymbol: {
    color: '#ffffff',
    fontSize: 20,
    marginRight: 7,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 28,
    paddingTop: 10,
  },
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});