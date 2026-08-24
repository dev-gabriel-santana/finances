import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { apiLogin, apiLogout, apiRefresh, apiRegister } from '@/src/api/auth';

const REFRESH_TOKEN_KEY = 'refresh-token';

interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Prevent double-refresh in React StrictMode double-mount
  const initializing = useRef(false);

  const saveTokens = useCallback(async (pair: { accessToken: string; refreshToken: string }) => {
    setAccessToken(pair.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, pair.refreshToken);
  }, []);

  const clearTokens = useCallback(async () => {
    setAccessToken(null);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (initializing.current) return;
    initializing.current = true;

    async function tryRestoreSession() {
      try {
        const stored = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (stored) {
          const pair = await apiRefresh(stored);
          await saveTokens(pair);
        }
      } catch {
        await clearTokens();
      } finally {
        setIsLoading(false);
      }
    }

    void tryRestoreSession();
  }, [saveTokens, clearTokens]);

  const login = useCallback(
    async (email: string, password: string) => {
      const pair = await apiLogin(email, password);
      await saveTokens(pair);
    },
    [saveTokens],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const pair = await apiRegister(email, password);
      await saveTokens(pair);
    },
    [saveTokens],
  );

  const logout = useCallback(async () => {
    const stored = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY).catch(() => null);
    if (stored) await apiLogout(stored);
    await clearTokens();
  }, [clearTokens]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated: Boolean(accessToken),
        isLoading,
        login,
        register,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
