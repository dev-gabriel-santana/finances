import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSnackbar } from "@/src/components/ui/Snackbar";
import {
    paymentMethods,
    paymentModalities,
} from "@/src/constants/transactions";
import {
    createInstallments,
    createRecurringTransaction,
} from "@/src/db/automation";
import { useDatabase } from "@/src/db/provider";
import {
    insertTransaction,
    updateTransaction,
} from "@/src/db/queries/transactions";
import type { Transaction, TransactionType } from "@/src/db/schema";
import { useTransactionFormOptions } from "@/src/hooks/useTransactionFormOptions";
import {
    transactionFormSchema,
    type TransactionFormValues,
} from "@/src/schemas/transaction-form";
import { useAppTheme } from "@/src/theme/theme";
import { formatCurrency } from "@/src/utils/currency";

import { CurrencyInput } from "./CurrencyInput";
import { DateField } from "./DateField";
import { SelectField } from "./SelectField";
import { TextField } from "./TextField";

interface TransactionFormProps {
  type: TransactionType;
  transaction?: Transaction;
}

export function TransactionForm({ type, transaction }: TransactionFormProps) {
  const database = useDatabase();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{
    createdCategory?: string;
    createdCardId?: string;
  }>();
  const createdCategory =
    typeof params.createdCategory === "string"
      ? params.createdCategory
      : undefined;
  const createdCardId =
    typeof params.createdCardId === "string" ? params.createdCardId : undefined;
  const { showSuccess } = useSnackbar();
  const {
    cards: availableCards,
    categories: availableCategories,
    isLoading: isLoadingOptions,
    hasError: optionsError,
  } = useTransactionFormOptions();
  const isExpense = type === "expense";
  const isEditing = Boolean(transaction);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type,
      title: transaction?.title ?? "",
      description: transaction?.description ?? "",
      amount: transaction ? String(transaction.amountInCents) : "",
      category: transaction?.category ?? "",
      transactionDate: transaction
        ? parseISO(transaction.transactionDate)
        : new Date(),
      merchant: transaction?.merchant ?? "",
      paymentMethod: transaction?.paymentMethod ?? undefined,
      cardId: transaction?.cardId ?? undefined,
      paymentModality: transaction?.paymentModality ?? undefined,
      invoiceDueDate: transaction?.invoiceDueDate
        ? parseISO(transaction.invoiceDueDate)
        : undefined,
      isRecurring: false,
      installmentCount: "1",
    },
  });

  const appliedCreatedCategory = useRef<string | undefined>(undefined);
  const appliedCreatedCardId = useRef<string | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      if (
        createdCategory &&
        appliedCreatedCategory.current !== createdCategory
      ) {
        setValue("category", createdCategory);
        appliedCreatedCategory.current = createdCategory;
      }

      if (createdCardId && appliedCreatedCardId.current !== createdCardId) {
        setValue("cardId", createdCardId);
        appliedCreatedCardId.current = createdCardId;
      }

      if (createdCategory || createdCardId) {
        router.setParams({
          createdCategory: undefined,
          createdCardId: undefined,
        });
      }
    }, [createdCardId, createdCategory, setValue]),
  );
  const paymentMethod = watch("paymentMethod");
  const paymentModality = watch("paymentModality");
  const isRecurring = watch("isRecurring");
  const installmentCount = watch("installmentCount");
  const amount = watch("amount");
  const usesCard = isExpense && paymentMethod === "card";
  const usesCredit = usesCard && paymentModality === "credit";
  const installments = Number(installmentCount) || 1;
  const installmentPreview = Math.floor(Number(amount || 0) / installments);
  const categoryOptions = availableCategories.map((category) => ({
    label: category.name,
    value: category.name,
  }));
  const cardOptions = availableCards.map((card) => ({
    label: `${card.name} · ${card.brand}`,
    value: String(card.id),
  }));

  const onSubmit = async (values: TransactionFormValues) => {
    try {
      const input = {
        type,
        title: values.title,
        description: values.description || null,
        amountInCents: Number(values.amount),
        category: values.category,
        transactionDate: format(values.transactionDate, "yyyy-MM-dd"),
        merchant: isExpense ? values.merchant || null : null,
        paymentMethod: isExpense ? (values.paymentMethod ?? null) : null,
        cardId: usesCard ? (values.cardId ?? null) : null,
        paymentModality: usesCard ? (values.paymentModality ?? null) : null,
        invoiceDueDate:
          usesCredit && values.invoiceDueDate
            ? format(values.invoiceDueDate, "yyyy-MM-dd")
            : null,
      };

      const savedTransaction = transaction
        ? await updateTransaction(database, transaction.id, input)
        : values.isRecurring
          ? await createRecurringTransaction(database, input)
          : Number(values.installmentCount) > 1 && values.invoiceDueDate
            ? await createInstallments(database, {
                ...input,
                installmentCount: Number(values.installmentCount),
                invoiceDueDate: format(values.invoiceDueDate, "yyyy-MM-dd"),
              })
            : await insertTransaction(database, input);

      Alert.alert(
        isEditing
          ? "Lançamento atualizado"
          : isExpense
            ? "Despesa registrada"
            : "Receita registrada",
        isEditing
          ? "As alterações foram salvas no dispositivo."
          : "O lançamento foi salvo no dispositivo.",
        [
          {
            text: "Concluir",
            onPress: () =>
              router.replace({
                pathname: "/transactions/[id]",
                params: { id: String(savedTransaction.id) },
              }),
          },
        ],
      );
      showSuccess(
        isEditing
          ? "Lançamento atualizado com sucesso"
          : isExpense
            ? "Despesa registrada com sucesso"
            : "Receita registrada com sucesso",
      );
    } catch {
      Alert.alert(
        "Não foi possível salvar",
        "Revise os dados e tente novamente.",
      );
    }
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.intro, { backgroundColor: colors.surface }]}>
            <Text
              style={[
                styles.typeMarker,
                { color: isExpense ? colors.expense : colors.income },
              ]}
            >
              {isExpense ? "SAÍDA" : "ENTRADA"}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {isEditing
                ? "Editar lançamento"
                : isExpense
                  ? "Nova despesa"
                  : "Nova receita"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {isEditing
                ? "Atualize os dados que deseja alterar."
                : isExpense
                  ? "Registre os detalhes da compra ou pagamento."
                  : "Registre o dinheiro recebido."}
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <TextField
                  autoCapitalize="sentences"
                  error={errors.title?.message}
                  label="Título"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  placeholder={
                    isExpense ? "Ex: Mercado da semana" : "Ex: Salário"
                  }
                  returnKeyType="next"
                  value={field.value}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <TextField
                  error={errors.description?.message}
                  label="Descrição"
                  multiline
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  optional
                  placeholder="Adicione uma observação"
                  value={field.value}
                />
              )}
            />

            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <CurrencyInput
                  error={errors.amount?.message}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />

            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <SelectField
                  error={errors.category?.message}
                  emptyActionLabel="Cadastrar categoria"
                  emptyMessage="É necessário cadastrar uma categoria antes de criar o lançamento."
                  label="Categoria"
                  onChange={field.onChange}
                  onEmptyAction={() =>
                    router.push({
                      pathname: "/(tabs)/settings/categories",
                      params: { returnTo: type },
                    })
                  }
                  options={categoryOptions}
                  placeholder={
                    isLoadingOptions
                      ? "Carregando categorias..."
                      : "Selecione uma categoria"
                  }
                  value={field.value}
                />
              )}
            />
            {optionsError ? (
              <Text style={[styles.optionsError, { color: colors.expense }]}>
                Não foi possível carregar os cartões e categorias.
              </Text>
            ) : null}

            <Controller
              control={control}
              name="transactionDate"
              render={({ field }) => (
                <DateField
                  error={errors.transactionDate?.message}
                  label="Data do lançamento"
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />

            {isExpense ? (
              <>
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Detalhes do pagamento
                </Text>

                <Controller
                  control={control}
                  name="merchant"
                  render={({ field }) => (
                    <TextField
                      error={errors.merchant?.message}
                      label="Loja ou estabelecimento"
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      optional
                      placeholder="Ex: Supermercado Central"
                      value={field.value}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <SelectField
                      error={errors.paymentMethod?.message}
                      label="Forma de pagamento"
                      onChange={(value) => {
                        field.onChange(value || undefined);
                        if (value !== "card") {
                          setValue("installmentCount", "1");
                        }
                      }}
                      options={paymentMethods}
                      value={field.value}
                    />
                  )}
                />

                {usesCard ? (
                  <>
                    <Controller
                      control={control}
                      name="cardId"
                      render={({ field }) => (
                        <SelectField
                          emptyActionLabel="Cadastrar cartão"
                          emptyMessage="É necessário cadastrar um cartão antes de usar esta forma de pagamento."
                          error={errors.cardId?.message}
                          label="Cartão utilizado"
                          onChange={(value) =>
                            field.onChange(value || undefined)
                          }
                          onEmptyAction={() =>
                            router.push({
                              pathname: "/(tabs)/settings/cards",
                              params: { returnTo: type },
                            })
                          }
                          options={cardOptions}
                          placeholder={
                            isLoadingOptions
                              ? "Carregando cartões..."
                              : "Selecione um cartão"
                          }
                          value={field.value}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="paymentModality"
                      render={({ field }) => (
                        <SelectField
                          error={errors.paymentModality?.message}
                          label="Modalidade"
                          onChange={(value) => {
                            field.onChange(value || undefined);
                            if (value !== "credit") {
                              setValue("installmentCount", "1");
                            }
                          }}
                          options={paymentModalities}
                          value={field.value}
                        />
                      )}
                    />
                  </>
                ) : null}

                {usesCredit ? (
                  <>
                    <Controller
                      control={control}
                      name="invoiceDueDate"
                      render={({ field }) => (
                        <DateField
                          error={errors.invoiceDueDate?.message}
                          label="Vencimento da primeira fatura"
                          onChange={field.onChange}
                          value={field.value}
                        />
                      )}
                    />

                    {!isEditing && !isRecurring ? (
                      <Controller
                        control={control}
                        name="installmentCount"
                        render={({ field }) => (
                          <>
                            <TextField
                              error={errors.installmentCount?.message}
                              keyboardType="number-pad"
                              label="Número de parcelas"
                              maxLength={2}
                              onBlur={field.onBlur}
                              onChangeText={(value) =>
                                field.onChange(value.replace(/\D/g, ""))
                              }
                              value={field.value}
                            />
                            {installments > 1 && Number(amount) > 0 ? (
                              <Text
                                style={[
                                  styles.installmentPreview,
                                  { color: colors.textMuted },
                                ]}
                              >
                                {installments} parcelas a partir de{" "}
                                {formatCurrency(installmentPreview)}
                              </Text>
                            ) : null}
                          </>
                        )}
                      />
                    ) : null}
                  </>
                ) : null}
              </>
            ) : null}

            {!isEditing ? (
              <Controller
                control={control}
                name="isRecurring"
                render={({ field }) => (
                  <View
                    style={[
                      styles.recurringRow,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.recurringText}>
                      <Text
                        style={[styles.recurringTitle, { color: colors.text }]}
                      >
                        {isExpense
                          ? "Despesa recorrente"
                          : "Receita recorrente"}
                      </Text>
                      <Text
                        style={[
                          styles.recurringDescription,
                          { color: colors.textMuted },
                        ]}
                      >
                        Repete automaticamente todos os meses
                      </Text>
                    </View>
                    <Switch
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value) {
                          setValue("installmentCount", "1");
                        }
                      }}
                      trackColor={{
                        false: colors.border,
                        true: colors.primary,
                      }}
                      thumbColor={colors.onStrong}
                      value={field.value}
                    />
                  </View>
                )}
              />
            ) : null}

            <Pressable
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: isExpense ? colors.expense : colors.income },
                (pressed || isSubmitting) && styles.buttonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.onStrong} />
              ) : (
                <Text style={[styles.submitText, { color: colors.onStrong }]}>
                  {isEditing ? "Salvar alterações" : "Salvar lançamento"}
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
  safeArea: {
    backgroundColor: "#f2f5f3",
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingBottom: 36,
  },
  intro: {
    backgroundColor: "#ffffff",
    paddingBottom: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  typeMarker: {
    fontFamily: "SpaceMono",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0,
  },
  expense: {
    color: "#c34231",
  },
  income: {
    color: "#087a4d",
  },
  title: {
    color: "#17201c",
    fontSize: 25,
    fontWeight: "700",
    marginTop: 4,
  },
  subtitle: {
    color: "#758078",
    fontSize: 13,
    marginTop: 5,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  divider: {
    backgroundColor: "#dce3df",
    height: StyleSheet.hairlineWidth,
    marginBottom: 20,
    marginTop: 2,
  },
  sectionTitle: {
    color: "#17201c",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 18,
  },
  recurringRow: {
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  recurringText: {
    flex: 1,
    marginRight: 12,
  },
  recurringTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  recurringDescription: {
    fontSize: 11,
    marginTop: 3,
  },
  installmentPreview: {
    fontSize: 11,
    marginBottom: 18,
    marginTop: -12,
  },
  optionsError: {
    fontSize: 11,
    marginBottom: 14,
    marginTop: -8,
  },
  submitButton: {
    alignItems: "center",
    borderRadius: 6,
    height: 52,
    justifyContent: "center",
    marginTop: 8,
  },
  expenseButton: {
    backgroundColor: "#c34231",
  },
  incomeButton: {
    backgroundColor: "#087a4d",
  },
  buttonPressed: {
    opacity: 0.68,
  },
  submitText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
