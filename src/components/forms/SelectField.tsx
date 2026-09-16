import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import type { SelectOption } from "@/src/constants/transactions";
import { useAppTheme } from "@/src/theme/theme";

interface SelectFieldProps {
  label: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  error,
  placeholder = "Selecione",
  emptyMessage = "Nenhuma opção cadastrada",
  emptyActionLabel,
  onEmptyAction,
}: SelectFieldProps) {
  const { colors } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [
          styles.pickerFrame,
          { backgroundColor: colors.surface, borderColor: colors.border },
          error && styles.pickerError,
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.value,
            { color: selectedLabel ? colors.text : colors.textMuted },
          ]}
        >
          {selectedLabel ?? placeholder}
        </Text>
        <Text style={[styles.chevron, { color: colors.textMuted }]}>⌄</Text>
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        transparent
        visible={isOpen}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              styles.menu,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.menuTitle, { color: colors.text }]}>
              {label}
            </Text>
            {options.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.empty, { color: colors.textMuted }]}>
                  {emptyMessage}
                </Text>
                {emptyActionLabel && onEmptyAction ? (
                  <Pressable
                    onPress={() => {
                      setIsOpen(false);
                      onEmptyAction();
                    }}
                    style={({ pressed }) => [
                      styles.emptyAction,
                      { backgroundColor: colors.primaryStrong },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.emptyActionText,
                        { color: colors.onStrong },
                      ]}
                    >
                      {emptyActionLabel}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    style={({ pressed }) => [
                      styles.option,
                      { borderBottomColor: colors.border },
                      isSelected && { backgroundColor: colors.primary },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: isSelected ? colors.onStrong : colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected ? (
                      <Text
                        style={[styles.checkmark, { color: colors.onStrong }]}
                      >
                        ✓
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })
            )}
          </Pressable>
        </Pressable>
      </Modal>
      {error ? (
        <Text style={[styles.error, { color: colors.expense }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 18,
  },
  label: {
    color: "#28342e",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
  },
  pickerFrame: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e0dc",
    borderRadius: 6,
    borderWidth: 1,
    height: 50,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  value: {
    flex: 1,
    fontSize: 14,
  },
  chevron: {
    fontSize: 18,
    marginLeft: 10,
  },
  pickerError: {
    borderColor: "#c34231",
  },
  error: {
    color: "#b73d2e",
    fontSize: 11,
    marginTop: 5,
  },
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  menu: {
    borderRadius: 10,
    borderWidth: 1,
    maxHeight: "75%",
    overflow: "hidden",
    width: "100%",
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  option: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: 18,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "800",
  },
  empty: {
    padding: 18,
  },
  emptyState: {
    padding: 18,
  },
  emptyAction: {
    alignItems: "center",
    borderRadius: 6,
    minHeight: 42,
    justifyContent: "center",
    marginTop: 4,
    paddingHorizontal: 14,
  },
  emptyActionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  addOption: {
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  addOptionText: {
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.7,
  },
});
