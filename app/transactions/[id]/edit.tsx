import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { TransactionForm } from '@/src/components/forms/TransactionForm';
import { useTransaction } from '@/src/hooks/useTransaction';
import { useAppTheme } from '@/src/theme/theme';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transaction, isLoading, error } = useTransaction(Number(id));
  const { colors } = useAppTheme();

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

  return <TransactionForm transaction={transaction} type={transaction.type} />;
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    backgroundColor: '#f2f5f3',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#c34231',
    fontSize: 14,
    textAlign: 'center',
  },
});