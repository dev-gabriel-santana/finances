import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { useAppTheme } from '@/src/theme/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  optional?: boolean;
}

export function TextField({
  label,
  error,
  optional = false,
  multiline,
  style,
  ...props
}: TextFieldProps) {
  const { mode, colors } = useAppTheme();

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {optional ? <Text style={[styles.optional, { color: colors.textMuted }]}>Opcional</Text> : null}
      </View>
      <TextInput
        {...props}
        multiline={multiline}
        keyboardAppearance={mode}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
          multiline && styles.multiline,
          error && styles.inputError,
          style,
        ]}
      />
      {error ? <Text style={[styles.error, { color: colors.expense }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 18,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  label: {
    color: '#28342e',
    fontSize: 13,
    fontWeight: '600',
  },
  optional: {
    color: '#89948e',
    fontSize: 10,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#d8e0dc',
    borderRadius: 6,
    borderWidth: 1,
    color: '#17201c',
    fontSize: 15,
    height: 50,
    paddingHorizontal: 14,
  },
  multiline: {
    height: 92,
    paddingTop: 13,
    textAlignVertical: 'top',
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