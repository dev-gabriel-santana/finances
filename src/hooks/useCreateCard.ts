import { useState } from "react";
import { Alert } from "react-native";

import { useSnackbar } from "@/src/components/ui/Snackbar";
import { useDatabase } from "@/src/db/provider";
import { addCard } from "@/src/db/queries/cards-categories";

export function useCreateCard() {
  const database = useDatabase();
  const { showSuccess } = useSnackbar();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [closingDay, setClosingDay] = useState("");

  const handleAdd = async () => {
    const parsedClosingDay = Number(closingDay);

    if (!name.trim() || !brand.trim()) {
      Alert.alert(
        "Dados incompletos",
        "Informe o nome e a bandeira do cartão.",
      );
      return;
    }

    if (
      !Number.isInteger(parsedClosingDay) ||
      parsedClosingDay < 1 ||
      parsedClosingDay > 31
    ) {
      Alert.alert("Dia inválido", "Informe um dia de fechamento entre 1 e 31.");
      return;
    }

    setIsSaving(true);

    try {
      const createdCard = await addCard(database, {
        name: name.trim(),
        brand: brand.trim(),
        closingDay: parsedClosingDay,
      });
      setName("");
      setBrand("");
      setClosingDay("");
      showSuccess("Cartão adicionado com sucesso");
      return createdCard;
    } catch {
      Alert.alert(
        "Não foi possível salvar",
        "Já existe um cartão com esse nome.",
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    brand,
    closingDay,
    handleAdd,
    isSaving,
    name,
    setBrand,
    setClosingDay,
    setName,
  };
}
