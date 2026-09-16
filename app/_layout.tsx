import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  Stack,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import Storage from "expo-sqlite/kv-store";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import "react-native-reanimated";

import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import {
  CURRENT_BALANCE_STORAGE_KEY,
  INITIAL_BALANCE_ONBOARDING_DONE_KEY,
} from "@/src/constants/storageKeys";
import { DatabaseProvider } from "@/src/db/provider";
import { AppThemeProvider, useAppTheme } from "@/src/theme/theme";
import { formatCurrency } from "@/src/utils/currency";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppThemeProvider>
      <DatabaseProvider>
        <RootLayoutNav />
      </DatabaseProvider>
    </AppThemeProvider>
  );
}

function RootLayoutNav() {
  const { mode, colors } = useAppTheme();
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);
  const [currentBalanceInput, setCurrentBalanceInput] = useState("");
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);

  const closeOnboarding = useCallback(async () => {
    setIsOnboardingVisible(false);

    try {
      await Storage.setItem(INITIAL_BALANCE_ONBOARDING_DONE_KEY, "true");
    } catch {
      // Ignore persistence errors and continue rendering app.
    }
  }, []);

  const saveOnboarding = useCallback(async () => {
    const parsedValue = Number(currentBalanceInput || 0);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      return;
    }

    setIsSavingOnboarding(true);

    try {
      await Storage.setItem(CURRENT_BALANCE_STORAGE_KEY, String(parsedValue));
      await Storage.setItem(INITIAL_BALANCE_ONBOARDING_DONE_KEY, "true");
      setIsOnboardingVisible(false);
    } catch {
      setIsOnboardingVisible(false);
    } finally {
      setIsSavingOnboarding(false);
    }
  }, [currentBalanceInput]);

  useEffect(() => {
    let isActive = true;

    async function loadOnboardingState() {
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
        setIsOnboardingVisible(true);
      } catch {
        if (isActive) {
          setIsOnboardingVisible(true);
        }
      }
    }

    void loadOnboardingState();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <NavigationThemeProvider value={mode === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerBackTitle: "Voltar",
          headerRight: () => <ThemeToggle />,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="transactions/expense"
          options={{ headerBackTitle: "Voltar", title: "Nova despesa" }}
        />
        <Stack.Screen
          name="transactions/income"
          options={{ headerBackTitle: "Voltar", title: "Nova receita" }}
        />
        <Stack.Screen
          name="transactions/[id]"
          options={{ title: "Detalhes" }}
        />
        <Stack.Screen
          name="transactions/[id]/edit"
          options={{ title: "Editar lançamento" }}
        />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>

      <Modal
        animationType="fade"
        onRequestClose={() => {
          void closeOnboarding();
        }}
        transparent
        visible={isOnboardingVisible}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Quanto você tem na conta hoje?
              </Text>
              <Pressable
                accessibilityLabel="Fechar"
                disabled={isSavingOnboarding}
                onPress={() => {
                  void closeOnboarding();
                }}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[styles.closeButtonText, { color: colors.textMuted }]}
                >
                  Fechar
                </Text>
              </Pressable>
            </View>

            <Text
              style={[styles.modalDescription, { color: colors.textMuted }]}
            >
              Esse valor ajuda o app a mostrar sua projeção futura após pagar
              todas as contas e lançamentos previstos.
            </Text>

            <TextInput
              keyboardAppearance={mode}
              keyboardType="number-pad"
              onChangeText={(text) =>
                setCurrentBalanceInput(
                  text.replace(/\D/g, "").replace(/^0+(?=\d)/, ""),
                )
              }
              placeholder="R$ 0,00"
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.primary}
              style={[
                styles.balanceInput,
                {
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={
                Number(currentBalanceInput || 0) > 0
                  ? formatCurrency(Number(currentBalanceInput))
                  : ""
              }
            />

            <View style={styles.modalActions}>
              <Pressable
                disabled={isSavingOnboarding}
                onPress={() => {
                  void closeOnboarding();
                }}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.secondaryButton,
                  { borderColor: colors.border },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[styles.secondaryButtonText, { color: colors.text }]}
                >
                  Agora não
                </Text>
              </Pressable>
              <Pressable
                disabled={isSavingOnboarding}
                onPress={() => {
                  void saveOnboarding();
                }}
                style={({ pressed }) => [
                  styles.modalButton,
                  { backgroundColor: colors.primaryStrong },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[styles.primaryButtonText, { color: colors.onStrong }]}
                >
                  Salvar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </NavigationThemeProvider>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 440,
    padding: 18,
    width: "100%",
  },
  modalHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    marginRight: 10,
  },
  closeButton: {
    minHeight: 28,
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  modalDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  balanceInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontFamily: "SpaceMono",
    fontSize: 22,
    height: 56,
    marginTop: 14,
    paddingHorizontal: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  modalButton: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
