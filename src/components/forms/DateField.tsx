import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/theme';

interface DateFieldProps {
  label: string;
  value?: Date;
  onChange: (date: Date) => void;
  error?: string;
  optional?: boolean;
}

export function DateField({
  label,
  value,
  onChange,
  error,
  optional = false,
}: DateFieldProps) {
  const { mode, colors } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setIsOpen(false);
    }

    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {optional ? <Text style={[styles.optional, { color: colors.textMuted }]}>Opcional</Text> : null}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsOpen((current) => !current)}
        style={[
          styles.button,
          { backgroundColor: colors.surface, borderColor: colors.border },
          error && styles.buttonError,
        ]}>
        <Text style={[styles.value, { color: value ? colors.text : colors.textMuted }]}>
          {value
            ? format(value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
            : 'Selecionar data'}
        </Text>
        <Text style={[styles.icon, { color: colors.textMuted }]}>▣</Text>
      </Pressable>

      {isOpen ? (
        <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <DateTimePicker
            accentColor={colors.primary}
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            mode="date"
            onChange={handleChange}
            themeVariant={mode}
            value={value ?? new Date()}
          />
          {Platform.OS === 'ios' ? (
            <Pressable onPress={() => setIsOpen(false)} style={styles.doneButton}>
              <Text style={[styles.doneText, { color: colors.primary }]}>Concluir</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
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
  button: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d8e0dc',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    height: 50,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  buttonError: {
    borderColor: '#c34231',
  },
  value: {
    color: '#17201c',
    fontSize: 14,
  },
  placeholder: {
    color: '#89948e',
  },
  icon: {
    color: '#526058',
    fontSize: 15,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderColor: '#d8e0dc',
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  doneButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  doneText: {
    color: '#087a4d',
    fontSize: 13,
    fontWeight: '700',
  },
  error: {
    color: '#b73d2e',
    fontSize: 11,
    marginTop: 5,
  },
});