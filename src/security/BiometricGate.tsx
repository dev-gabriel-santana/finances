import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/theme';

type GateState = 'checking' | 'locked' | 'unlocked' | 'unavailable';

export function BiometricGate({ children }: PropsWithChildren) {
  const { colors } = useAppTheme();
  const [state, setState] = useState<GateState>(
    Platform.OS === 'web' ? 'unavailable' : 'checking',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isAuthenticating = useRef(false);

  const authenticate = useCallback(async () => {
    if (Platform.OS === 'web' || isAuthenticating.current) {
      return;
    }

    isAuthenticating.current = true;
    setErrorMessage(null);

    try {
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);

      if (!hasHardware || !isEnrolled) {
        setState('unavailable');
        return;
      }

      setState('locked');
      const result = await LocalAuthentication.authenticateAsync({
        biometricsSecurityLevel: 'strong',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar código do dispositivo',
        promptMessage: 'Desbloquear Finanças',
        promptSubtitle: 'Confirme sua identidade para acessar seus dados',
      });

      if (result.success) {
        setState('unlocked');
      } else {
        setState('locked');
        setErrorMessage('Autenticação não concluída. Tente novamente.');
      }
    } catch {
      setState('locked');
      setErrorMessage('Não foi possível iniciar a autenticação.');
    } finally {
      isAuthenticating.current = false;
    }
  }, []);

  useEffect(() => {
    void authenticate();
  }, [authenticate]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void authenticate();
      } else if (nextState === 'background' || nextState === 'inactive') {
        setState((currentState) =>
          currentState === 'unavailable' ? currentState : 'locked',
        );
      }
    });

    return () => subscription.remove();
  }, [authenticate]);

  if (state === 'unlocked' || state === 'unavailable') {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.lockIcon, { backgroundColor: colors.primaryStrong }]}>
        <Text style={[styles.lockSymbol, { color: colors.onStrong }]}>⌁</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Finanças protegidas</Text>
      <Text style={[styles.description, { color: colors.textMuted }]}>
        Confirme sua identidade para acessar seus lançamentos e saldos.
      </Text>
      {errorMessage ? (
        <Text style={[styles.error, { color: colors.expense }]}>{errorMessage}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => void authenticate()}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primaryStrong },
          pressed && styles.pressed,
        ]}>
        <Text style={[styles.buttonText, { color: colors.onStrong }]}>Desbloquear</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  lockIcon: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 20,
    width: 56,
  },
  lockSymbol: {
    fontSize: 29,
    fontWeight: '700',
    transform: [{ rotate: '90deg' }],
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 290,
    textAlign: 'center',
  },
  error: {
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    borderRadius: 6,
    height: 50,
    justifyContent: 'center',
    marginTop: 24,
    minWidth: 180,
    paddingHorizontal: 22,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});