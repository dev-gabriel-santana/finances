import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { useDatabase } from "@/src/db/provider";
import { listCards } from "@/src/db/queries/cards-categories";
import { listExpenseTransactionsByCard } from "@/src/db/queries/transactions";
import type { Card, Transaction } from "@/src/db/schema";

export function useSpendingCardDetail(cardId: number) {
  const database = useDatabase();
  const [card, setCard] = useState<Card | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const [cards, cardTransactions] = await Promise.all([
        listCards(database),
        listExpenseTransactionsByCard(database, cardId),
      ]);
      setCard(cards.find((item) => item.id === cardId) ?? null);
      setTransactions(cardTransactions);
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause : new Error("Falha ao carregar cartão"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [cardId, database]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { card, error, isLoading, transactions, reload: load };
}
