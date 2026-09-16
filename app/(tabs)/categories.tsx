import { router, useLocalSearchParams } from "expo-router";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryColorPicker } from "@/src/components/settings/CategoryColorPicker";
import { CategoryIconPicker } from "@/src/components/settings/CategoryIconPicker";
import { SettingsField } from "@/src/components/settings/SettingsField";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { useCreateCategory } from "@/src/hooks/useCreateCategory";
import { useAppTheme } from "@/src/theme/theme";

export default function CategoriesScreen() {
  const { colors } = useAppTheme();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { color, handleAdd, icon, isSaving, name, setColor, setIcon, setName } =
    useCreateCategory();

  const handleSubmit = async () => {
    const createdCategory = await handleAdd();

    if (!createdCategory || !returnTo) {
      return;
    }

    router.dismissTo({
      pathname:
        returnTo === "income"
          ? "/transactions/income"
          : "/transactions/expense",
      params: {
        createdCategory: createdCategory.name,
      },
    });
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <View style={styles.headingRow}>
              <View>
                <Text style={[styles.eyebrow, { color: colors.primary }]}>
                  CADASTROS
                </Text>
                <Text style={[styles.title, { color: colors.text }]}>
                  Categorias
                </Text>
              </View>
              <ThemeToggle />
            </View>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Organize receitas e despesas do seu jeito.
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/settings/categories-list")}
              style={({ pressed }) => [
                styles.listLink,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.listLinkText, { color: colors.primary }]}>
                Ver todas as categorias ›
              </Text>
            </Pressable>
          </View>

          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              Adicionar categoria
            </Text>
            <SettingsField
              label="Nome"
              onChangeText={setName}
              placeholder="Ex: Alimentação"
              value={name}
            />
            <CategoryColorPicker onChange={setColor} value={color} />
            <CategoryIconPicker onChange={setIcon} value={icon} />
            <Pressable
              disabled={isSaving}
              onPress={() => void handleSubmit()}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: colors.primaryStrong },
                (pressed || isSaving) && styles.pressed,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.onStrong} />
              ) : (
                <Text style={[styles.submitText, { color: colors.onStrong }]}>
                  Adicionar categoria
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  content: { paddingBottom: 32 },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20 },
  headingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eyebrow: { fontFamily: "SpaceMono", fontSize: 10, fontWeight: "700" },
  title: { fontSize: 26, fontWeight: "700", marginTop: 3 },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  listLink: { alignSelf: "flex-start", marginTop: 12, paddingVertical: 4 },
  listLinkText: { fontSize: 12, fontWeight: "700" },
  section: { marginTop: 10, paddingHorizontal: 20, paddingVertical: 22 },
  formTitle: { fontSize: 15, fontWeight: "700", marginBottom: 16 },
  submitButton: {
    alignItems: "center",
    borderRadius: 6,
    height: 48,
    justifyContent: "center",
    marginTop: 2,
  },
  submitText: { fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.65 },
});
