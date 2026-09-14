import { useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingState } from "@/src/components/ui/LoadingState";
import { useDatabase } from "@/src/db/provider";
import {
  listCategories,
  removeCategory,
} from "@/src/db/queries/cards-categories";
import type { Category } from "@/src/db/schema";
import { useAppTheme } from "@/src/theme/theme";

const DEFAULT_CATEGORY_ICON: { ios: string; android: string; web: string } = {
  ios: "tag.fill",
  android: "sell",
  web: "sell",
};

const CATEGORY_ICON_MAP: Record<
  string,
  { ios: string; android: string; web: string }
> = {
  "🍔": { ios: "fork.knife", android: "restaurant", web: "restaurant" },
  "🏠": { ios: "house.fill", android: "home", web: "home" },
  "🚗": { ios: "car.fill", android: "directions_car", web: "directions_car" },
  "♥": { ios: "heart.fill", android: "favorite", web: "favorite" },
  "✎": { ios: "book.fill", android: "menu_book", web: "menu_book" },
  "★": { ios: "star.fill", android: "star", web: "star" },
  "👜": { ios: "bag.fill", android: "shopping_bag", web: "shopping_bag" },
  "✈": { ios: "airplane", android: "flight", web: "flight" },
  $: { ios: "dollarsign.circle.fill", android: "payments", web: "payments" },
  "•": DEFAULT_CATEGORY_ICON,
  "fork.knife": { ios: "fork.knife", android: "restaurant", web: "restaurant" },
  "house.fill": { ios: "house.fill", android: "home", web: "home" },
  "car.fill": {
    ios: "car.fill",
    android: "directions_car",
    web: "directions_car",
  },
  "heart.fill": { ios: "heart.fill", android: "favorite", web: "favorite" },
  "book.fill": { ios: "book.fill", android: "menu_book", web: "menu_book" },
  "star.fill": { ios: "star.fill", android: "star", web: "star" },
  "bag.fill": { ios: "bag.fill", android: "shopping_bag", web: "shopping_bag" },
  "tag.fill": DEFAULT_CATEGORY_ICON,
  airplane: { ios: "airplane", android: "flight", web: "flight" },
  "dollarsign.circle.fill": {
    ios: "dollarsign.circle.fill",
    android: "payments",
    web: "payments",
  },
};

const getCategoryIconConfig = (icon?: string | null) => {
  if (!icon) {
    return DEFAULT_CATEGORY_ICON;
  }

  return CATEGORY_ICON_MAP[icon] ?? DEFAULT_CATEGORY_ICON;
};

export default function CategoriesListScreen() {
  const database = useDatabase();
  const { colors } = useAppTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      setCategories(await listCategories(database));
    } catch {
      Alert.alert("Não foi possível carregar", "Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [database]);

  useFocusEffect(
    useCallback(() => {
      void loadCategories();
    }, [loadCategories]),
  );

  const handleRemove = (category: Category) => {
    Alert.alert(
      "Remover categoria?",
      `A categoria ${category.name} será removida.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await removeCategory(database, category.id);
              await loadCategories();
            } catch {
              Alert.alert("Não foi possível remover", "Tente novamente.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {isLoading ? (
        <LoadingState label="Carregando categorias..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Todas as categorias cadastradas no dispositivo.
          </Text>
          {categories.length === 0 ? (
            <View style={[styles.empty, { borderColor: colors.border }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Nenhuma categoria cadastrada
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Crie sua primeira categoria para organizar gastos e receitas.
              </Text>
            </View>
          ) : (
            categories.map((category) => {
              const iconConfig = getCategoryIconConfig(category.icon);

              return (
                <View
                  key={category.id}
                  style={[
                    styles.row,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: category.color || colors.primary },
                    ]}
                  >
                    <SymbolView
                      name={iconConfig as any}
                      size={16}
                      tintColor={colors.onStrong}
                    />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>
                      {category.name}
                    </Text>
                    <Text style={[styles.rowMeta, { color: colors.textMuted }]}>
                      {category.color || "Sem cor"}
                      {category.icon ? ` · ${category.icon}` : ""}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel={`Remover ${category.name}`}
                    onPress={() => handleRemove(category)}
                    style={({ pressed }) => [
                      styles.remove,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[styles.removeText, { color: colors.expense }]}
                    >
                      ×
                    </Text>
                  </Pressable>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: 10, padding: 20 },
  centered: { alignItems: "center", flex: 1, justifyContent: "center" },
  description: { fontSize: 12, marginBottom: 6 },
  row: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 74,
    paddingHorizontal: 14,
  },
  badge: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    marginRight: 12,
    width: 36,
  },
  badgeText: { fontSize: 17, fontWeight: "700" },
  rowContent: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: 14, fontWeight: "700" },
  rowMeta: { fontSize: 11, marginTop: 4 },
  remove: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  removeText: { fontSize: 27 },
  empty: {
    alignItems: "center",
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: 28,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  emptyText: { fontSize: 12, textAlign: "center" },
  pressed: { opacity: 0.6 },
});
