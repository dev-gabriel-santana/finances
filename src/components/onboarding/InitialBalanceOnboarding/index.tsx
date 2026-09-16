import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { useInitialBalanceOnboarding } from "@/src/hooks/useInitialBalanceOnboarding";
import { useAppTheme } from "@/src/theme/theme";
import { formatCurrency } from "@/src/utils/currency";

import { styles } from "./style";

export function InitialBalanceOnboarding() {
  const { mode, colors } = useAppTheme();
  const {
    close,
    currentBalanceInput,
    isSaving,
    isVisible,
    save,
    setCurrentBalanceInput,
  } = useInitialBalanceOnboarding();

  const handleInputChange = (text: string) => {
    setCurrentBalanceInput(text.replace(/\D/g, "").replace(/^0+(?=\d)/, ""));
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => {
        void close();
      }}
      transparent
      visible={isVisible}
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
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Quanto você tem na conta hoje?
            </Text>
            <Pressable
              accessibilityLabel="Fechar"
              disabled={isSaving}
              onPress={() => {
                void close();
              }}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.closeButtonText, { color: colors.textMuted }]}
              >
                Fechar
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.modalDescription, { color: colors.textMuted }]}>
            Esse valor ajuda o app a mostrar sua projeção futura após pagar
            todas as contas e lançamentos previstos.
          </Text>

          <TextInput
            keyboardAppearance={mode}
            keyboardType="number-pad"
            onChangeText={handleInputChange}
            placeholder="R$ 0,00"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            style={[
              styles.balanceInput,
              {
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={
              Number(currentBalanceInput || 0) > 0
                ? formatCurrency(Number(currentBalanceInput))
                : ""
            }
          />

          <View style={styles.modalActions}>
            <Pressable
              disabled={isSaving}
              onPress={() => {
                void close();
              }}
              style={({ pressed }) => [
                styles.modalButton,
                styles.secondaryButton,
                { borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.secondaryButtonText, { color: colors.text }]}
              >
                Agora não
              </Text>
            </Pressable>
            <Pressable
              disabled={isSaving}
              onPress={() => {
                void save();
              }}
              style={({ pressed }) => [
                styles.modalButton,
                { backgroundColor: colors.primaryStrong },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.primaryButtonText, { color: colors.onStrong }]}
              >
                Salvar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
