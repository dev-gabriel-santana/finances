import Storage from 'expo-sqlite/kv-store';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';

export type ThemeMode = 'light' | 'dark';

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
  onStrong: string;
}

const palettes: Record<ThemeMode, ThemeColors> = {
  light: {
    background: '#f2f5f3',
    surface: '#ffffff',
    surfaceElevated: '#f8faf9',
    text: '#17201c',
    textMuted: '#758078',
    border: '#d8e0dc',
    primary: '#168a5b',
    primaryStrong: '#087a4d',
    income: '#087a4d',
    incomeSurface: '#dff5ea',
    expense: '#c34231',
    expenseSurface: '#ffe6e1',
    balanceSurface: '#16211d',
    balanceBorder: '#34423c',
    onStrong: '#ffffff',
  },
  dark: {
    background: '#0f1412',
    surface: '#171e1b',
    surfaceElevated: '#202824',
    text: '#edf4f0',
    textMuted: '#9ca9a2',
    border: '#35413b',
    primary: '#55d89a',
    primaryStrong: '#35b77b',
    income: '#65dda3',
    incomeSurface: '#193b2d',
    expense: '#ff8a78',
    expenseSurface: '#482721',
    balanceSurface: '#0a0f0d',
    balanceBorder: '#2d3933',
    onStrong: '#ffffff',
  },
};

interface AppThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'app-theme-mode';
const AppThemeContext = createContext<AppThemeContextValue | null>(null);

function normalizeScheme(scheme: ColorSchemeName | null | undefined): ThemeMode {
  return scheme === 'dark' ? 'dark' : 'light';
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>(() =>
    normalizeScheme(Appearance.getColorScheme()),
  );

  useEffect(() => {
    Storage.getItem(THEME_STORAGE_KEY)
      .then((storedMode) => {
        if (storedMode === 'light' || storedMode === 'dark') {
          setMode(storedMode);
        }
      })
      .catch(() => undefined);
  }, []);

  const toggleTheme = () => {
    setMode((currentMode) => {
      const nextMode = currentMode === 'light' ? 'dark' : 'light';
      void Storage.setItem(THEME_STORAGE_KEY, nextMode).catch(() => undefined);
      return nextMode;
    });
  };

  return (
    <AppThemeContext.Provider
      value={{ mode, colors: palettes[mode], toggleTheme }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const theme = useContext(AppThemeContext);

  if (!theme) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }

  return theme;
}