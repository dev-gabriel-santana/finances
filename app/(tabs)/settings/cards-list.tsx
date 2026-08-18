import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listCards, removeCard } from '@/src/db/queries/cards-categories';
import { useDatabase } from '@/src/db/provider';
import type { Card } from '@/src/db/schema';
import { useAppTheme } from '@/src/theme/theme';

export default function CardsListScreen() {
  const database = useDatabase();
  const { colors } = useAppTheme();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCards = useCallback(async () => {
    setIsLoading(true);
    try { setCards(await listCards(database)); }
    catch { Alert.alert('Não foi possível carregar', 'Tente novamente.'); }
    finally { setIsLoading(false); }
  }, [database]);

  useFocusEffect(useCallback(() => { void loadCards(); }, [loadCards]));

  const handleRemove = (card: Card) => {
    Alert.alert('Remover cartão?', `O cartão ${card.name} será removido.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        try { await removeCard(database, card.id); await loadCards(); }
        catch { Alert.alert('Não foi possível remover', 'Tente novamente.'); }
      } },
    ]);
  };

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {isLoading ? <View style={styles.centered}><ActivityIndicator color={colors.primary} /></View> : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.description, { color: colors.textMuted }]}>Todos os cartões cadastrados no dispositivo.</Text>
          {cards.length === 0 ? <View style={[styles.empty, { borderColor: colors.border }]}><Text style={[styles.emptyText, { color: colors.textMuted }]}>Nenhum cartão cadastrado.</Text></View> : cards.map((card) => (
            <View key={card.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.badge, { backgroundColor: colors.primary }]}><Text style={[styles.badgeText, { color: colors.onStrong }]}>▣</Text></View>
              <View style={styles.rowContent}><Text style={[styles.rowTitle, { color: colors.text }]}>{card.name}</Text><Text style={[styles.rowMeta, { color: colors.textMuted }]}>{card.brand} · Fecha dia {card.closingDay}</Text></View>
              <Pressable accessibilityLabel={`Remover ${card.name}`} onPress={() => handleRemove(card)} style={({ pressed }) => [styles.remove, pressed && styles.pressed]}><Text style={[styles.removeText, { color: colors.expense }]}>×</Text></Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, content: { gap: 10, padding: 20 }, centered: { alignItems: 'center', flex: 1, justifyContent: 'center' }, description: { fontSize: 12, marginBottom: 6 }, row: { alignItems: 'center', borderRadius: 8, borderWidth: 1, flexDirection: 'row', minHeight: 74, paddingHorizontal: 14 }, badge: { alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', marginRight: 12, width: 36 }, badgeText: { fontSize: 16, fontWeight: '700' }, rowContent: { flex: 1, minWidth: 0 }, rowTitle: { fontSize: 14, fontWeight: '700' }, rowMeta: { fontSize: 11, marginTop: 4 }, remove: { alignItems: 'center', height: 36, justifyContent: 'center', width: 36 }, removeText: { fontSize: 27 }, empty: { alignItems: 'center', borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, padding: 28 }, emptyText: { fontSize: 12 }, pressed: { opacity: 0.6 },
});