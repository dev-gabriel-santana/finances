import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

const REFRESH_TOKEN_KEY = 'refresh-token';
const OFFLINE_SESSION_TOKEN = 'offline-local-session';

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
  const [accessToken, setAccessToken] = useState<string | null>(OFFLINE_SESSION_TOKEN);
  const [isLoading, setIsLoading] = useState(false);

  const saveTokens = useCallback(async (pair: { accessToken: string; refreshToken: string }) => {
    setAccessToken(pair.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, pair.refreshToken);
  }, []);

  const clearTokens = useCallback(async () => {
    setAccessToken(null);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => undefined);
  }, []);

  const setOfflineSession = useCallback(async () => {
    setAccessToken(OFFLINE_SESSION_TOKEN);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, OFFLINE_SESSION_TOKEN).catch(() => undefined);
  }, []);

  useEffect(() => {
    async function restoreOfflineSession() {
      try {
        const stored = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

        if (stored === OFFLINE_SESSION_TOKEN) {
          setAccessToken(OFFLINE_SESSION_TOKEN);
          return;
        }

        if (!stored) {
          await setOfflineSession();
        }
      } catch {
        await setOfflineSession();
      } finally {
        setIsLoading(false);
      }
    }

    void restoreOfflineSession();
  }, [setOfflineSession]);

  const login = useCallback(
    async (_email: string, _password: string) => {
      await setOfflineSession();
    },
    [setOfflineSession],
  );

  const register = useCallback(
    async (_email: string, _password: string) => {
      await setOfflineSession();
    },
    [setOfflineSession],
  );

  const logout = useCallback(async () => {
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
