import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  Stack,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { InitialBalanceOnboarding } from "@/src/components/onboarding/InitialBalanceOnboarding";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { DatabaseProvider } from "@/src/db/provider";
import { AppThemeProvider, useAppTheme } from "@/src/theme/theme";

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

      <InitialBalanceOnboarding />
    </NavigationThemeProvider>
  );
}
