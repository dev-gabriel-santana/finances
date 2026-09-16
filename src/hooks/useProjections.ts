import { format, startOfMonth } from "date-fns";
import { useFocusEffect } from "expo-router";
import Storage from "expo-sqlite/kv-store";
import { useCallback, useState } from "react";

import { CURRENT_BALANCE_STORAGE_KEY } from "@/src/constants/storageKeys";
import {
    getFutureProjections,
    type FutureProjectionMonth,
} from "@/src/db/projections";
import { useDatabase } from "@/src/db/provider";
import { getCurrentAccountPixAdjustment } from "@/src/db/queries/transactions";

const emptyProjection = (period: string): FutureProjectionMonth => ({
  incomeInCents: 0,
  expenseInCents: 0,
  balanceInCents: 0,
  items: [],
  period,
});

export function useProjections() {
  const database = useDatabase();
  const currentDate = new Date();
  const firstMonth = startOfMonth(currentDate);
  const [selectedMonth, setSelectedMonth] = useState(firstMonth);
  const selectedPeriod = format(selectedMonth, "yyyy-MM");
  const [months, setMonths] = useState<FutureProjectionMonth[]>([]);
  const [currentBalanceBaseInCents, setCurrentBalanceBaseInCents] = useState(0);
  const [currentBalanceInCents, setCurrentBalanceInCents] = useState(0);
  const [currentPixAdjustmentInCents, setCurrentPixAdjustmentInCents] =
    useState(0);
  const [currentBalanceInput, setCurrentBalanceInput] = useState("");
  const [isEditingCurrentBalance, setIsEditingCurrentBalance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProjections() {
        setIsLoading(true);

        try {
          const [result, storedCurrentBalance, pixAdjustment] =
            await Promise.all([
              getFutureProjections(database, 1, currentDate, selectedMonth),
              Storage.getItem(CURRENT_BALANCE_STORAGE_KEY),
              getCurrentAccountPixAdjustment(database, currentDate),
            ]);

          if (isActive) {
            setMonths(result);
            const parsedCurrentBalance = Number(storedCurrentBalance ?? "0");

            if (
              Number.isFinite(parsedCurrentBalance) &&
              parsedCurrentBalance >= 0
            ) {
              setCurrentBalanceBaseInCents(parsedCurrentBalance);
              setCurrentBalanceInCents(
                parsedCurrentBalance + pixAdjustment.balanceInCents,
              );
              setCurrentBalanceInput(String(parsedCurrentBalance));
              setCurrentPixAdjustmentInCents(pixAdjustment.balanceInCents);
            } else {
              setCurrentBalanceBaseInCents(0);
              setCurrentBalanceInCents(0);
              setCurrentBalanceInput("");
              setCurrentPixAdjustmentInCents(0);
            }
            setError(null);
          }
        } catch (cause) {
          if (isActive) {
            setError(
              cause instanceof Error
                ? cause
                : new Error("Falha ao carregar projeções"),
            );
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadProjections();

      return () => {
        isActive = false;
      };
    }, [database, selectedPeriod, selectedMonth]),
  );

  const handleSaveCurrentBalance = async () => {
    const nextBalanceInCents = Number(currentBalanceInput || 0);

    if (!Number.isFinite(nextBalanceInCents) || nextBalanceInCents < 0) {
      return;
    }

    setCurrentBalanceInCents(nextBalanceInCents + currentPixAdjustmentInCents);
    setCurrentBalanceBaseInCents(nextBalanceInCents);
    setIsEditingCurrentBalance(false);

    try {
      await Storage.setItem(
        CURRENT_BALANCE_STORAGE_KEY,
        String(nextBalanceInCents),
      );
    } catch {
      // Keep local state even when persistence fails.
    }
  };

  const handleCancelCurrentBalanceEdit = () => {
    setCurrentBalanceInput(String(currentBalanceBaseInCents));
    setIsEditingCurrentBalance(false);
  };

  return {
    currentBalanceBaseInCents,
    currentBalanceInCents,
    currentDate,
    currentPixAdjustmentInCents,
    currentBalanceInput,
    error,
    firstMonth,
    handleCancelCurrentBalanceEdit,
    handleSaveCurrentBalance,
    isEditingCurrentBalance,
    isLoading,
    months,
    selectedMonth,
    selectedPeriod,
    setCurrentBalanceInput,
    setIsEditingCurrentBalance,
    setSelectedMonth,
  };
}

export { emptyProjection };
