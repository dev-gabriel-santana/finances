import { StyleSheet, Text, TextInput, View } from 'react-native';

import { formatCurrency } from '@/src/utils/currency';
import { useAppTheme } from '@/src/theme/theme';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
}

export function CurrencyInput({ value, onChange, onBlur, error }: CurrencyInputProps) {
  const { mode, colors } = useAppTheme();
  const amountInCents = Number(value || 0);

  const handleChange = (text: string) => {
    onChange(text.replace(/\D/g, '').replace(/^0+(?=\d)/, ''));
  };

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>Valor</Text>
      <TextInput
        accessibilityLabel="Valor do lançamento"
        keyboardType="number-pad"
        keyboardAppearance={mode}
        onBlur={onBlur}
        onChangeText={handleChange}
        placeholder="R$ 0,00"
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
          error && styles.inputError,
        ]}
        value={amountInCents > 0 ? formatCurrency(amountInCents) : ''}
      />
      {error ? <Text style={[styles.error, { color: colors.expense }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 18,
  },
  label: {
    color: '#28342e',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#d8e0dc',
    borderRadius: 6,
    borderWidth: 1,
    color: '#17201c',
    fontFamily: 'SpaceMono',
    fontSize: 20,
    height: 56,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: '#c34231',
  },
  error: {
    color: '#b73d2e',
    fontSize: 11,
    marginTop: 5,
  },
});