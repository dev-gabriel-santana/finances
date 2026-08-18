import { Picker } from '@react-native-picker/picker';
import { StyleSheet, Text, View } from 'react-native';

import type { SelectOption } from '@/src/constants/transactions';
import { useAppTheme } from '@/src/theme/theme';

interface SelectFieldProps {
  label: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  error,
  placeholder = 'Selecione',
}: SelectFieldProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={[
        styles.pickerFrame,
        { backgroundColor: colors.surface, borderColor: colors.border },
        error && styles.pickerError,
      ]}>
        <Picker
          dropdownIconColor={colors.textMuted}
          onValueChange={(selectedValue) => onChange(String(selectedValue))}
          selectedValue={value ?? ''}
          style={[styles.picker, { color: colors.text }]}>
          <Picker.Item color={colors.textMuted} label={placeholder} value="" />
          {options.map((option) => (
            <Picker.Item color={colors.text} key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
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
  pickerFrame: {
    backgroundColor: '#ffffff',
    borderColor: '#d8e0dc',
    borderRadius: 6,
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    color: '#17201c',
    height: 50,
  },
  pickerError: {
    borderColor: '#c34231',
  },
  error: {
    color: '#b73d2e',
    fontSize: 11,
    marginTop: 5,
  },
});