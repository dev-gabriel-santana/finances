import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeToggle } from '@/src/components/ui/ThemeToggle';
import { SettingsField } from '@/src/components/settings/SettingsField';
import {
  addCard,
} from '@/src/db/queries/cards-categories';
import { useDatabase } from '@/src/db/provider';
import { useAppTheme } from '@/src/theme/theme';

export default function CardsScreen() {
  const database = useDatabase();
  const { colors } = useAppTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [closingDay, setClosingDay] = useState('');

  const handleAdd = async () => {
    const parsedClosingDay = Number(closingDay);
    if (!name.trim() || !brand.trim()) {
      Alert.alert('Dados incompletos', 'Informe o nome e a bandeira do cartão.');
      return;
    }
    if (!Number.isInteger(parsedClosingDay) || parsedClosingDay < 1 || parsedClosingDay > 31) {
      Alert.alert('Dia inválido', 'Informe um dia de fechamento entre 1 e 31.');
      return;
    }

    setIsSaving(true);
    try {
      await addCard(database, { name: name.trim(), brand: brand.trim(), closingDay: parsedClosingDay });
      setName('');
      setBrand('');
      setClosingDay('');
    } catch {
      Alert.alert('Não foi possível salvar', 'Já existe um cartão com esse nome.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <View style={styles.headingRow}>
              <View>
                <Text style={[styles.eyebrow, { color: colors.primary }]}>CADASTROS</Text>
                <Text style={[styles.title, { color: colors.text }]}>Meus cartões</Text>
              </View>
              <ThemeToggle />
            </View>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Gerencie os cartões usados nos seus lançamentos.</Text>
            <Pressable onPress={() => router.push('/(tabs)/settings/cards-list')} style={({ pressed }) => [styles.listLink, pressed && styles.pressed]}>
              <Text style={[styles.listLinkText, { color: colors.primary }]}>Ver todos os cartões ›</Text>
            </Pressable>
          </View>

          <View style={[styles.section, { backgroundColor: colors.surface }]}> 
              <Text style={[styles.formTitle, { color: colors.text }]}>Adicionar cartão</Text>
              <SettingsField label="Nome" onChangeText={setName} placeholder="Ex: Nubank pessoal" value={name} />
              <SettingsField label="Bandeira" onChangeText={setBrand} placeholder="Ex: Visa" value={brand} />
              <SettingsField keyboardType="number-pad" label="Dia de fechamento" onChangeText={(value) => setClosingDay(value.replace(/\D/g, ''))} placeholder="Ex: 10" value={closingDay} />
              <Pressable disabled={isSaving} onPress={() => void handleAdd()} style={({ pressed }) => [styles.submitButton, { backgroundColor: colors.primaryStrong }, (pressed || isSaving) && styles.pressed]}>
                {isSaving ? <ActivityIndicator color={colors.onStrong} /> : <Text style={[styles.submitText, { color: colors.onStrong }]}>Adicionar cartão</Text>}
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
  headingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  eyebrow: { fontFamily: 'SpaceMono', fontSize: 10, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '700', marginTop: 3 },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  listLink: { alignSelf: 'flex-start', marginTop: 12, paddingVertical: 4 },
  listLinkText: { fontSize: 12, fontWeight: '700' },
  section: { marginTop: 10, paddingHorizontal: 20, paddingVertical: 22 },
  formTitle: { fontSize: 15, fontWeight: '700', marginBottom: 16 },
  submitButton: { alignItems: 'center', borderRadius: 6, height: 48, justifyContent: 'center', marginTop: 2 },
  submitText: { fontSize: 13, fontWeight: '700' },
  emptyText: { fontSize: 12, marginBottom: 4 },
  pressed: { opacity: 0.65 },
});