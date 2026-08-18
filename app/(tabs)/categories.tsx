import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsField } from '@/src/components/settings/SettingsField';
import { ThemeToggle } from '@/src/components/ui/ThemeToggle';
import { addCategory } from '@/src/db/queries/cards-categories';
import { useDatabase } from '@/src/db/provider';
import { useAppTheme } from '@/src/theme/theme';

const CATEGORY_COLORS = [
  { name: 'Verde', value: '#168a5b' },
  { name: 'Esmeralda', value: '#0f766e' },
  { name: 'Azul', value: '#2563eb' },
  { name: 'Índigo', value: '#4f46e5' },
  { name: 'Roxo', value: '#7c3aed' },
  { name: 'Rosa', value: '#db2777' },
  { name: 'Vermelho', value: '#dc2626' },
  { name: 'Laranja', value: '#ea580c' },
  { name: 'Amarelo', value: '#ca8a04' },
  { name: 'Cinza', value: '#64748b' },
] as const;

const CATEGORY_ICONS = [
  { name: 'Alimentação', value: '🍔' },
  { name: 'Casa', value: '🏠' },
  { name: 'Transporte', value: '🚗' },
  { name: 'Saúde', value: '♥' },
  { name: 'Educação', value: '✎' },
  { name: 'Lazer', value: '★' },
  { name: 'Compras', value: '▣' },
  { name: 'Viagem', value: '✈' },
  { name: 'Salário', value: '$' },
  { name: 'Outros', value: '•' },
] as const;

export default function CategoriesScreen() {
  const database = useDatabase();
  const { colors } = useAppTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [icon, setIcon] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) { Alert.alert('Dados incompletos', 'Informe o nome da categoria.'); return; }
    setIsSaving(true);
    try {
      await addCategory(database, { name: name.trim(), color: color.trim() || null, icon: icon.trim() || null });
      setName(''); setColor(''); setIcon('');
    } catch { Alert.alert('Não foi possível salvar', 'Já existe uma categoria com esse nome.'); }
    finally { setIsSaving(false); }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <View style={styles.headingRow}>
              <View>
                <Text style={[styles.eyebrow, { color: colors.primary }]}>CADASTROS</Text>
                <Text style={[styles.title, { color: colors.text }]}>Categorias</Text>
              </View>
              <ThemeToggle />
            </View>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Organize receitas e despesas do seu jeito.</Text>
            <Pressable onPress={() => router.push('/(tabs)/settings/categories-list')} style={({ pressed }) => [styles.listLink, pressed && styles.pressed]}>
              <Text style={[styles.listLinkText, { color: colors.primary }]}>Ver todas as categorias ›</Text>
            </Pressable>
          </View>

          <View style={[styles.section, { backgroundColor: colors.surface }]}> 
              <Text style={[styles.formTitle, { color: colors.text }]}>Adicionar categoria</Text>
              <SettingsField label="Nome" onChangeText={setName} placeholder="Ex: Alimentação" value={name} />
              <Text style={[styles.colorLabel, { color: colors.text }]}>Cor da categoria</Text>
              <View style={styles.colorGrid}>
                {CATEGORY_COLORS.map((option) => {
                  const isSelected = color === option.value;

                  return (
                    <Pressable
                      accessibilityLabel={`Selecionar cor ${option.name}`}
                      key={option.value}
                      onPress={() => setColor(option.value)}
                      style={({ pressed }) => [
                        styles.colorOption,
                        { backgroundColor: option.value },
                        isSelected && [styles.colorOptionSelected, { borderColor: colors.text }],
                        pressed && styles.pressed,
                      ]}>
                      {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
              <Text style={[styles.selectedColor, { color: colors.textMuted }]}> 
                {color ? `Selecionada: ${color}` : 'Selecione uma cor'}
              </Text>
              <Text style={[styles.iconLabel, { color: colors.text }]}>Ícone da categoria</Text>
              <View style={styles.iconGrid}>
                {CATEGORY_ICONS.map((option) => {
                  const isSelected = icon === option.value;

                  return (
                    <Pressable
                      accessibilityLabel={`Selecionar ícone ${option.name}`}
                      key={option.value}
                      onPress={() => setIcon(option.value)}
                      style={({ pressed }) => [
                        styles.iconOption,
                        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                        isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                        pressed && styles.pressed,
                      ]}>
                      <Text style={[styles.iconOptionText, { color: isSelected ? colors.onStrong : colors.text }]}>
                        {option.value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={[styles.selectedIcon, { color: colors.textMuted }]}> 
                {icon ? `Selecionado: ${icon}` : 'Selecione um ícone'}
              </Text>
              <SettingsField label="Ícone" onChangeText={setIcon} placeholder="Ex: food ou 🍔" value={icon} />
              <Pressable disabled={isSaving} onPress={() => void handleAdd()} style={({ pressed }) => [styles.submitButton, { backgroundColor: colors.primaryStrong }, (pressed || isSaving) && styles.pressed]}>
                {isSaving ? <ActivityIndicator color={colors.onStrong} /> : <Text style={[styles.submitText, { color: colors.onStrong }]}>Adicionar categoria</Text>}
              </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, safeArea: { flex: 1 }, content: { paddingBottom: 32 },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20 },
  headingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  eyebrow: { fontFamily: 'SpaceMono', fontSize: 10, fontWeight: '700' }, title: { fontSize: 26, fontWeight: '700', marginTop: 3 }, subtitle: { fontSize: 12, lineHeight: 18, marginTop: 8 }, listLink: { alignSelf: 'flex-start', marginTop: 12, paddingVertical: 4 }, listLinkText: { fontSize: 12, fontWeight: '700' },
  section: { marginTop: 10, paddingHorizontal: 20, paddingVertical: 22 }, formTitle: { fontSize: 15, fontWeight: '700', marginBottom: 16 }, colorLabel: { fontSize: 12, fontWeight: '600', marginBottom: 10 }, colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 }, colorOption: { alignItems: 'center', borderColor: 'transparent', borderRadius: 18, borderWidth: 3, height: 36, justifyContent: 'center', width: 36 }, colorOptionSelected: { borderWidth: 3, transform: [{ scale: 1.12 }] }, checkmark: { color: '#ffffff', fontSize: 17, fontWeight: '800' }, selectedColor: { fontFamily: 'SpaceMono', fontSize: 10, marginBottom: 16 }, iconLabel: { fontSize: 12, fontWeight: '600', marginBottom: 10 }, iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }, iconOption: { alignItems: 'center', borderRadius: 8, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 }, iconOptionText: { fontSize: 20 }, selectedIcon: { fontFamily: 'SpaceMono', fontSize: 10, marginBottom: 12 }, submitButton: { alignItems: 'center', borderRadius: 6, height: 48, justifyContent: 'center', marginTop: 2 }, submitText: { fontSize: 13, fontWeight: '700' }, pressed: { opacity: 0.65 },
});