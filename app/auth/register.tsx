import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { TextField } from '@/src/components/forms/TextField';
import { useAuth } from '@/src/auth/AuthContext';
import { useAppTheme } from '@/src/theme/theme';

const schema = z
  .object({
    email: z.string().email('E-mail inválido'),
    password: z
      .string()
      .min(8, 'Mínimo de 8 caracteres')
      .regex(/[A-Z]/, 'Precisa de ao menos uma letra maiúscula')
      .regex(/[0-9]/, 'Precisa de ao menos um número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { register: registerUser } = useAuth();
  const { colors } = useAppTheme();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setApiError(null);
    try {
      await registerUser(values.email, values.password);
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Não foi possível criar a conta. Tente novamente.',
      );
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.brand, { color: colors.primary }]}>FINANÇAS</Text>
            <Text style={[styles.title, { color: colors.text }]}>Criar conta</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <TextField
              label="E-mail"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              returnKeyType="next"
              value={watch('email') ?? ''}
              onChangeText={(v) => setValue('email', v, { shouldValidate: true })}
              error={errors.email?.message}
            />
            <TextField
              label="Senha"
              autoComplete="new-password"
              secureTextEntry
              returnKeyType="next"
              value={watch('password') ?? ''}
              onChangeText={(v) => setValue('password', v, { shouldValidate: true })}
              error={errors.password?.message}
            />
            <TextField
              label="Confirmar senha"
              autoComplete="new-password"
              secureTextEntry
              returnKeyType="done"
              value={watch('confirmPassword') ?? ''}
              onChangeText={(v) => setValue('confirmPassword', v, { shouldValidate: true })}
              onSubmitEditing={handleSubmit(onSubmit)}
              error={errors.confirmPassword?.message}
            />

            {apiError ? (
              <Text style={[styles.errorBanner, { color: colors.expense }]}>{apiError}</Text>
            ) : null}

            <Pressable
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.primaryStrong },
                (pressed || isSubmitting) && styles.pressed,
              ]}>
              {isSubmitting ? (
                <ActivityIndicator color={colors.onStrong} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.onStrong }]}>Criar conta</Text>
              )}
            </Pressable>
          </View>

          <Pressable
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onPress={() => router.replace('/auth/login' as any)}
            style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
            <Text style={[styles.linkText, { color: colors.textMuted }]}>
              Já tem conta?{' '}
              <Text style={[styles.linkAction, { color: colors.primary }]}>Entrar</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 20 },
  header: { marginBottom: 4 },
  brand: { fontFamily: 'SpaceMono', fontSize: 10, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '700', marginTop: 6 },
  card: { borderRadius: 10, padding: 20 },
  errorBanner: { fontSize: 13, marginBottom: 12, textAlign: 'center' },
  button: {
    alignItems: 'center',
    borderRadius: 6,
    height: 50,
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: { fontSize: 15, fontWeight: '700' },
  link: { alignItems: 'center', paddingVertical: 8 },
  linkText: { fontSize: 13 },
  linkAction: { fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
