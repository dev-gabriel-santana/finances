import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { useDatabase } from "@/src/db/provider";
import { listCategories } from "@/src/db/queries/cards-categories";
import {
    getExpenseTotalsByCategory,
    type ExpenseTotalByCategory,
} from "@/src/db/queries/transactions";

const fallbackColors = [
  "#1b8f65",
  "#d95c46",
  "#3b82c4",
  "#c28b2c",
  "#8b5fbf",
  "#2f9c95",
  "#d47b42",
];

export interface ExpenseBreakdownItem extends ExpenseTotalByCategory {
  color: string;
}

const initialItems: ExpenseBreakdownItem[] = [];

export function useExpenseBreakdown(
  startDate?: string,
  endDate?: string,
  enabled = true,
) {
  const database = useDatabase();
  const [items, setItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBreakdown = useCallback(async () => {
    setIsLoading(true);

    if (!enabled) {
      setItems(initialItems);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      const [totals, categories] = await Promise.all([
        getExpenseTotalsByCategory(database, { startDate, endDate }),
        listCategories(database),
      ]);
      const colorsByCategory = new Map(
        categories.map((category) => [category.name, category.color]),
      );

      setItems(
        totals.map((item, index) => ({
          ...item,
          color:
            colorsByCategory.get(item.category) ||
            fallbackColors[index % fallbackColors.length]!,
        })),
      );
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
      void loadBreakdown();
    }, [loadBreakdown]),
  );

  const totalInCents = items.reduce(
    (total, item) => total + item.amountInCents,
    0,
  );

  return { items, totalInCents, isLoading, error, reload: loadBreakdown };
}
