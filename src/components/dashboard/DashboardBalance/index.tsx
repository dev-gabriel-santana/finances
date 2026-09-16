import { SymbolView } from "expo-symbols";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { useAppTheme } from "@/src/theme/theme";
import { formatCurrency } from "@/src/utils/currency";

import { styles } from "./style";

interface DashboardBalanceProps {
  currentBalanceInCents: number;
  currentBalanceInput: string;
  isEditing: boolean;
  onCancel: () => void;
  onChangeInput: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
}

export function DashboardBalance({
  currentBalanceInCents,
  currentBalanceInput,
  isEditing,
  onCancel,
  onChangeInput,
  onEdit,
  onSave,
}: DashboardBalanceProps) {
  const { colors } = useAppTheme();

  return (
    <>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.balanceSurface,
            borderColor: colors.balanceBorder,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            SALDO ATUAL EM CONTA
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar saldo atual"
            onPress={onEdit}
            style={({ pressed }) => [
              styles.editButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.text,
                shadowOpacity: 0.12,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 1 },
              },
              pressed && styles.pressed,
            ]}
          >
            <SymbolView
              name={{ ios: "pencil", android: "edit", web: "edit" }}
              size={12}
              tintColor={colors.primaryStrong}
            />
          </Pressable>
        </View>
        <Text style={[styles.value, { color: colors.balanceText }]}>
          {formatCurrency(currentBalanceInCents)}
        </Text>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={onCancel}
        transparent
        visible={isEditing}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Ajustar saldo atual
            </Text>
            <Text
              style={[styles.modalDescription, { color: colors.textMuted }]}
            >
              Atualize o valor base da sua conta para refletir no saldo atual e
              nas projeções.
            </Text>

            <TextInput
              autoFocus
              keyboardType="number-pad"
              onChangeText={onChangeInput}
              placeholder="R$ 0,00"
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.primary}
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.text },
              ]}
              value={
                Number(currentBalanceInput || 0) > 0
                  ? formatCurrency(Number(currentBalanceInput))
                  : ""
              }
            />

            <View style={styles.actions}>
              <Pressable
                onPress={onCancel}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.secondaryButton,
                  { borderColor: colors.border },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.secondaryText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={onSave}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: colors.primaryStrong },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.primaryText, { color: colors.onStrong }]}>
                  Salvar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
