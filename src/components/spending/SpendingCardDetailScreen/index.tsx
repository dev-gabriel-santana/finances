import { router, Stack } from "expo-router";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TransactionList } from "@/src/components/dashboard/TransactionList";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { useSpendingCardDetail } from "@/src/hooks/useSpendingCardDetail";
import { useAppTheme } from "@/src/theme/theme";

import { styles } from "./style";

interface SpendingCardDetailScreenProps {
  cardId: number;
}

export function SpendingCardDetailScreen({
  cardId,
}: SpendingCardDetailScreenProps) {
  const { colors } = useAppTheme();
  const { card, error, isLoading, transactions } =
    useSpendingCardDetail(cardId);

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headingRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              CARTÃO
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {card?.name ?? "Detalhes do cartão"}
            </Text>
          </View>
          <ThemeToggle />
        </View>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>
            ‹ Gastos por cartão
          </Text>
        </Pressable>
        {card ? (
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {card.brand}
          </Text>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.expense }]}>
            Não foi possível carregar os lançamentos.
          </Text>
        </View>
      ) : !card ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Cartão não encontrado
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TransactionList
            title="Lançamentos deste cartão"
            transactions={transactions}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
