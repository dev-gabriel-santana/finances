import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/src/theme/theme';

interface SettingsFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'number-pad';
}

export function SettingsField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: SettingsFieldProps) {
  const { colors, mode } = useAppTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        keyboardAppearance={mode}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderRadius: 6, borderWidth: 1, fontSize: 14, height: 48, paddingHorizontal: 13 },
});