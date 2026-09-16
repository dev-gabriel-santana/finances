import { useFocusEffect } from "expo-router";
import Storage from "expo-sqlite/kv-store";
import { useCallback, useState } from "react";

import { CURRENT_BALANCE_STORAGE_KEY } from "@/src/constants/storageKeys";
import { useDatabase } from "@/src/db/provider";
import { getCurrentAccountPixAdjustment } from "@/src/db/queries/transactions";

export function useDashboardBalance() {
  const database = useDatabase();
  const [currentBalanceBaseInCents, setCurrentBalanceBaseInCents] = useState(0);
  const [currentBalanceInCents, setCurrentBalanceInCents] = useState(0);
  const [currentBalanceInput, setCurrentBalanceInput] = useState("");
  const [currentPixAdjustmentInCents, setCurrentPixAdjustmentInCents] =
    useState(0);
  const [isEditingCurrentBalance, setIsEditingCurrentBalance] = useState(false);

  const reloadBalance = useCallback(async () => {
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
      void reloadBalance();
    }, [reloadBalance]),
  );

  const saveCurrentBalance = useCallback(async () => {
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

  const cancelCurrentBalanceEdit = useCallback(() => {
    setCurrentBalanceInput(String(currentBalanceBaseInCents));
    setIsEditingCurrentBalance(false);
  }, [currentBalanceBaseInCents]);

  const startCurrentBalanceEdit = useCallback(() => {
    setCurrentBalanceInput(String(currentBalanceBaseInCents));
    setIsEditingCurrentBalance(true);
  }, [currentBalanceBaseInCents]);

  return {
    cancelCurrentBalanceEdit,
    currentBalanceInCents,
    currentBalanceInput,
    currentPixAdjustmentInCents,
    isEditingCurrentBalance,
    reloadBalance,
    saveCurrentBalance,
    setCurrentBalanceInput,
    startCurrentBalanceEdit,
  };
}
