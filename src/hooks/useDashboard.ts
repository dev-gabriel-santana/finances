import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useDatabase } from '@/src/db/provider';
import { generateDueRecurringExpenses } from '@/src/db/automation';
import {
  getBalanceSummary,
  getMonthlyBalanceHistory,
  listTransactions,
  type BalanceSummary,
  type MonthlyBalance,
} from '@/src/db/queries/transactions';
import type { Transaction } from '@/src/db/schema';

interface DashboardData {
  summary: BalanceSummary;
  history: MonthlyBalance[];
  recentTransactions: Transaction[];
}

const initialData: DashboardData = {
  summary: {
    incomeInCents: 0,
    expenseInCents: 0,
    balanceInCents: 0,
  },
  history: [],
  recentTransactions: [],
};

export function useDashboard() {
  const database = useDatabase();
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);

    try {
      await generateDueRecurringExpenses(database);
      const [summary, history, recentTransactions] = await Promise.all([
        getBalanceSummary(database),
        getMonthlyBalanceHistory(database),
        listTransactions(database, { limit: 8 }),
      ]);

      setData({ summary, history, recentTransactions });
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error('Falha ao carregar dados'));
    } finally {
      setIsLoading(false);
    }
  }, [database]);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  return { ...data, isLoading, error, reload: loadDashboard };
}