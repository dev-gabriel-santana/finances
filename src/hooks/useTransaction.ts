import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getTransactionById } from '@/src/db/queries/transactions';
import { useDatabase } from '@/src/db/provider';
import type { Transaction } from '@/src/db/schema';

export function useTransaction(id: number) {
  const database = useDatabase();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTransaction = useCallback(async () => {
    if (!Number.isInteger(id) || id <= 0) {
      setError(new Error('Lançamento inválido'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const result = await getTransactionById(database, id);
      setTransaction(result);
      setError(result ? null : new Error('Lançamento não encontrado'));
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error('Falha ao carregar lançamento'));
    } finally {
      setIsLoading(false);
    }
  }, [database, id]);

  useFocusEffect(
    useCallback(() => {
      void loadTransaction();
    }, [loadTransaction]),
  );

  return { transaction, isLoading, error, reload: loadTransaction };
}