import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  cards,
  getOptionLabel,
  paymentMethods,
  paymentModalities,
} from '@/src/constants/transactions';
import { deleteTransaction } from '@/src/db/queries/transactions';
import { useDatabase } from '@/src/db/provider';
import { useTransaction } from '@/src/hooks/useTransaction';
import { useAppTheme, type ThemeColors } from '@/src/theme/theme';
import { formatCurrency } from '@/src/utils/currency';

interface DetailRowProps {
  label: string;
  value?: string | null;
  colors: ThemeColors;
}

function DetailRow({ label, value, colors }: DetailRowProps) {
  return (
    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>
        {value || 'Não informado'}
      </Text>
    </View>
  );
}

function formatDate(value: string) {
  return format(parseISO(value), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const transactionId = Number(id);
  const { transaction, isLoading, error } = useTransaction(transactionId);
  const database = useDatabase();
  const { colors } = useAppTheme();
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.expense }]}>
          {error?.message ?? 'Lançamento não encontrado'}
        </Text>
      </View>
    );
  }

  const isIncome = transaction.type === 'income';

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteTransaction(database, transaction.id);
      router.replace('/(tabs)/transactions');
    } catch {
      setIsDeleting(false);
      Alert.alert(
        'Não foi possível excluir',
        'O lançamento não foi removido. Tente novamente.',
      );
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Excluir lançamento?',
      'Esta ação é permanente e não poderá ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => void handleDelete(),
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.balanceSurface }]}>
          <Text
            style={[
              styles.type,
              { color: isIncome ? colors.income : colors.expense },
            ]}>
            {isIncome ? 'RECEITA' : 'DESPESA'}
          </Text>
          <Text style={[styles.title, { color: colors.onStrong }]}>
            {transaction.title}
          </Text>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={[
              styles.amount,
              { color: isIncome ? colors.income : colors.expense },
            ]}>
            {isIncome ? '+' : '-'} {formatCurrency(transaction.amountInCents)}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informações</Text>
          <DetailRow colors={colors} label="Categoria" value={transaction.category} />
          <DetailRow
            colors={colors}
            label="Data do lançamento"
            value={formatDate(transaction.transactionDate)}
          />
          <DetailRow colors={colors} label="Descrição" value={transaction.description} />
          {transaction.recurringRuleId ? (
            <DetailRow colors={colors} label="Recorrência" value="Mensal" />
          ) : null}
          {transaction.installmentCount && transaction.installmentNumber ? (
            <DetailRow
              colors={colors}
              label="Parcela"
              value={`${transaction.installmentNumber} de ${transaction.installmentCount}`}
            />
          ) : null}
        </View>

        {!isIncome ? (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pagamento</Text>
            <DetailRow colors={colors} label="Estabelecimento" value={transaction.merchant} />
            <DetailRow
              colors={colors}
              label="Forma de pagamento"
              value={getOptionLabel(paymentMethods, transaction.paymentMethod)}
            />
            {transaction.paymentMethod === 'card' ? (
              <>
                <DetailRow
                  colors={colors}
                  label="Cartão"
                  value={getOptionLabel(cards, transaction.cardId)}
                />
                <DetailRow
                  colors={colors}
                  label="Modalidade"
                  value={getOptionLabel(paymentModalities, transaction.paymentModality)}
                />
              </>
            ) : null}
            {transaction.invoiceDueDate ? (
              <DetailRow
                colors={colors}
                label="Vencimento da fatura"
                value={formatDate(transaction.invoiceDueDate)}
              />
            ) : null}
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            disabled={isDeleting}
            onPress={() =>
              router.push({
                pathname: '/transactions/[id]/edit',
                params: { id: String(transaction.id) },
              })
            }
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.primaryStrong },
              (pressed || isDeleting) && styles.pressed,
            ]}>
            <Text style={[styles.actionText, { color: colors.onStrong }]}>Editar lançamento</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={isDeleting}
            onPress={confirmDelete}
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              { borderColor: colors.expense },
              (pressed || isDeleting) && styles.pressed,
            ]}>
            {isDeleting ? (
              <ActivityIndicator color={colors.expense} />
            ) : (
              <Text style={[styles.actionText, { color: colors.expense }]}>Excluir lançamento</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 10,
    paddingBottom: 32,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  hero: {
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  type: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 6,
  },
  amount: {
    fontFamily: 'SpaceMono',
    fontSize: 29,
    marginTop: 14,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 13,
  },
  detailLabel: {
    fontSize: 11,
  },
  detailValue: {
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    gap: 10,
    marginHorizontal: 20,
    marginTop: 10,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 6,
    height: 50,
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});