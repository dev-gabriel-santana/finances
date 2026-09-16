import Storage from "expo-sqlite/kv-store";
import { useCallback, useEffect, useState } from "react";

import {
    CURRENT_BALANCE_STORAGE_KEY,
    INITIAL_BALANCE_ONBOARDING_DONE_KEY,
} from "@/src/constants/storageKeys";

export function useInitialBalanceOnboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentBalanceInput, setCurrentBalanceInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const close = useCallback(async () => {
    setIsVisible(false);

    try {
      await Storage.setItem(INITIAL_BALANCE_ONBOARDING_DONE_KEY, "true");
    } catch {
      // Continue rendering the app when persistence is unavailable.
    }
  }, []);

  const save = useCallback(async () => {
    const parsedValue = Number(currentBalanceInput || 0);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      return;
    }

    setIsSaving(true);

    try {
      await Storage.setItem(CURRENT_BALANCE_STORAGE_KEY, String(parsedValue));
      await Storage.setItem(INITIAL_BALANCE_ONBOARDING_DONE_KEY, "true");
      setIsVisible(false);
    } catch {
      setIsVisible(false);
    } finally {
      setIsSaving(false);
    }
  }, [currentBalanceInput]);

  useEffect(() => {
    let isActive = true;

    async function loadState() {
      try {
        const onboardingDone = await Storage.getItem(
          INITIAL_BALANCE_ONBOARDING_DONE_KEY,
        );

        if (!isActive || onboardingDone === "true") {
          return;
        }

        const storedCurrentBalance = await Storage.getItem(
          CURRENT_BALANCE_STORAGE_KEY,
        );
        const parsedCurrentBalance = Number(storedCurrentBalance ?? "0");

        if (!isActive) {
          return;
        }

        setCurrentBalanceInput(
          Number.isFinite(parsedCurrentBalance) && parsedCurrentBalance > 0
            ? String(parsedCurrentBalance)
            : "",
        );
        setIsVisible(true);
      } catch {
        if (isActive) {
          setIsVisible(true);
        }
      }
    }

    void loadState();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    close,
    currentBalanceInput,
    isSaving,
    isVisible,
    save,
    setCurrentBalanceInput,
  };
}
