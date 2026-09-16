import {
    createContext,
    type PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { Keyboard, Text, View } from "react-native";

import { useAppTheme } from "@/src/theme/theme";

import { styles } from "./style";

interface SnackbarProps {
  message: string | null;
  onDismiss: () => void;
}

interface SnackbarContextValue {
  showSuccess: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function Snackbar({ message, onDismiss }: SnackbarProps) {
  const { colors } = useAppTheme();

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeout = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timeout);
  }, [message, onDismiss]);

  if (!message) {
    return null;
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[styles.container, { backgroundColor: colors.incomeSurface }]}
    >
      <Text style={[styles.message, { color: colors.income }]}>{message}</Text>
    </View>
  );
}

export function SnackbarProvider({ children }: PropsWithChildren) {
  const [message, setMessage] = useState<string | null>(null);

  const showSuccess = useCallback((successMessage: string) => {
    Keyboard.dismiss();
    setMessage(successMessage);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSuccess }}>
      {children}
      <Snackbar message={message} onDismiss={() => setMessage(null)} />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }

  return context;
}
