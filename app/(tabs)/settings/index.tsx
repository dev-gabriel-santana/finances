import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { useDatabase } from "@/src/db/provider";
import { clearAllTransactions } from "@/src/db/queries/transactions";
import { useAppTheme } from "@/src/theme/theme";

export default function SettingsHomeScreen() {
  const database = useDatabase();
  const { colors } = useAppTheme();

  const handleClearAllTransactions = () => {
    Alert.alert(
      "Limpar todos os lançamentos?",
      "Isso apagará receitas, despesas, parcelas e regras recorrentes. Cartões e categorias serão preservados.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar tudo",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllTransactions(database);
              Alert.alert(
                "Lançamentos apagados",
                "Todos os lançamentos e recorrências foram removidos.",
              );
            } catch {
              Alert.alert("Não foi possível limpar", "Tente novamente.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headingRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              CONFIGURAÇÕES
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Cadastros
            </Text>
          </View>
          <ThemeToggle />
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Gerencie os dados usados nos seus lançamentos.
        </Text>
      </View>

      <View style={styles.content}>
        <Pressable
          onPress={() => router.push("/(tabs)/settings/cards")}
          style={({ pressed }) => [
            styles.option,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && styles.pressed,
          ]}
        >
          <View
            style={[styles.icon, { backgroundColor: colors.primaryStrong }]}
          >
            <SymbolView
              name={{
                ios: "creditcard.fill",
                android: "credit_card",
                web: "credit_card",
              }}
              size={18}
              tintColor={colors.onStrong}
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>
              Cartões
            </Text>
            <Text
              style={[styles.optionDescription, { color: colors.textMuted }]}
            >
              Gerencie cartões e dias de fechamento
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(tabs)/settings/categories")}
          style={({ pressed }) => [
            styles.option,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && styles.pressed,
          ]}
        >
          <View
            style={[styles.icon, { backgroundColor: colors.primaryStrong }]}
          >
            <SymbolView
              name={{
                ios: "tag.fill",
                android: "sell",
                web: "sell",
              }}
              size={18}
              tintColor={colors.onStrong}
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>
              Categorias
            </Text>
            <Text
              style={[styles.optionDescription, { color: colors.textMuted }]}
            >
              Organize receitas e despesas
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
        </Pressable>

        <View
          style={[
            styles.dangerSection,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.dangerTitle, { color: colors.expense }]}>
            Dados de lançamentos
          </Text>
          <Text style={[styles.dangerDescription, { color: colors.textMuted }]}>
            Apague receitas, despesas, parcelas e recorrências de uma vez.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleClearAllTransactions}
            style={({ pressed }) => [
              styles.dangerButton,
              { borderColor: colors.expense },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.dangerButtonText, { color: colors.expense }]}>
              Limpar todos os lançamentos
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20 },
  headingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eyebrow: { fontFamily: "SpaceMono", fontSize: 10, fontWeight: "700" },
  title: { fontSize: 26, fontWeight: "700", marginTop: 3 },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  content: { gap: 10, padding: 20 },
  option: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 78,
    paddingHorizontal: 14,
  },
  icon: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    marginRight: 12,
    width: 40,
  },
  iconText: { fontSize: 18, fontWeight: "700" },
  optionContent: { flex: 1, minWidth: 0 },
  optionTitle: { fontSize: 15, fontWeight: "700" },
  optionDescription: { fontSize: 11, marginTop: 4 },
  chevron: { fontSize: 22, marginLeft: 8 },
  dangerSection: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  dangerTitle: { fontSize: 14, fontWeight: "700" },
  dangerDescription: { fontSize: 11, lineHeight: 17, marginTop: 5 },
  dangerButton: {
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    marginTop: 14,
  },
  dangerButtonText: { fontSize: 12, fontWeight: "700" },
  pressed: { opacity: 0.65 },
});
