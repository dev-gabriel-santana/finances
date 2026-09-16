import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { useDatabase } from "@/src/db/provider";
import { listCards, listCategories } from "@/src/db/queries/cards-categories";
import type { Card, Category } from "@/src/db/schema";

export function useTransactionFormOptions() {
  const database = useDatabase();
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadOptions = useCallback(async () => {
    setIsLoading(true);

    try {
      const [cardRows, categoryRows] = await Promise.all([
        listCards(database),
        listCategories(database),
      ]);
      setCards(cardRows);
      setCategories(categoryRows);
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [database]);

  useFocusEffect(
    useCallback(() => {
      void loadOptions();
    }, [loadOptions]),
  );

  return {
    cards,
    categories,
    isLoading,
    hasError,
  };
}
