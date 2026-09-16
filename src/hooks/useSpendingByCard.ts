import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { useDatabase } from "@/src/db/provider";
import {
    getExpenseTotalsByCard,
    type ExpenseTotalByCard,
} from "@/src/db/queries/transactions";

export function useSpendingByCard(
  startDate?: string,
  endDate?: string,
  enabled = true,
) {
  const database = useDatabase();
  const [items, setItems] = useState<ExpenseTotalByCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);

    if (!enabled) {
      setItems([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      setItems(await getExpenseTotalsByCard(database, { startDate, endDate }));
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause : new Error("Falha ao carregar gastos"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [database, enabled, endDate, startDate]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { error, isLoading, items, reload: load };
}
