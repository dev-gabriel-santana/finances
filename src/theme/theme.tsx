import Storage from "expo-sqlite/kv-store";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { Appearance, type ColorSchemeName } from "react-native";

export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryStrong: string;
  income: string;
  incomeSurface: string;
  expense: string;
  expenseSurface: string;
  balanceSurface: string;
  balanceBorder: string;
  balanceText: string;
  onStrong: string;
}

const palettes: Record<ThemeMode, ThemeColors> = {
  light: {
    background: "#f4f7f4",
    surface: "#ffffff",
    surfaceElevated: "#f7faf8",
    text: "#17201c",
    textMuted: "#65766f",
    border: "#dfe9e4",
    primary: "#1b8f65",
    primaryStrong: "#0f7a57",
    income: "#0f8f62",
    incomeSurface: "#dff7ec",
    expense: "#d95c46",
    expenseSurface: "#fee8e1",
    balanceSurface: "#13241d",
    balanceBorder: "#2d403a",
    balanceText: "#f4fff8",
    onStrong: "#ffffff",
  },
  dark: {
    background: "#0d1412",
    surface: "#161f1d",
    surfaceElevated: "#1e2925",
    text: "#ebf4f1",
    textMuted: "#9db0a8",
    border: "#33413d",
    primary: "#6fe0aa",
    primaryStrong: "#46c48c",
    income: "#7ae5b5",
    incomeSurface: "#173b2d",
    expense: "#ff9c82",
    expenseSurface: "#492d28",
    balanceSurface: "#0a110f",
    balanceBorder: "#2d3935",
    balanceText: "#e8fff3",
    onStrong: "#f2faf7",
  },
};

interface AppThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "app-theme-mode";
const AppThemeContext = createContext<AppThemeContextValue | null>(null);

function normalizeScheme(
  scheme: ColorSchemeName | null | undefined,
): ThemeMode {
  return scheme === "dark" ? "dark" : "light";
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>(() =>
    normalizeScheme(Appearance.getColorScheme()),
  );

  useEffect(() => {
    Storage.getItem(THEME_STORAGE_KEY)
      .then((storedMode) => {
        if (storedMode === "light" || storedMode === "dark") {
          setMode(storedMode);
        }
      })
      .catch(() => undefined);
  }, []);

  const toggleTheme = () => {
    setMode((currentMode) => {
      const nextMode = currentMode === "light" ? "dark" : "light";
      void Storage.setItem(THEME_STORAGE_KEY, nextMode).catch(() => undefined);
      return nextMode;
    });
  };

  return (
    <AppThemeContext.Provider
      value={{ mode, colors: palettes[mode], toggleTheme }}
    >
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const theme = useContext(AppThemeContext);

  if (!theme) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }

  return theme;
}
