import { useState } from "react";
import { Alert } from "react-native";

import { useSnackbar } from "@/src/components/ui/Snackbar";
import { useDatabase } from "@/src/db/provider";
import { addCategory } from "@/src/db/queries/cards-categories";

export function useCreateCategory() {
  const database = useDatabase();
  const { showSuccess } = useSnackbar();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [icon, setIcon] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert("Dados incompletos", "Informe o nome da categoria.");
      return;
    }

    setIsSaving(true);

    try {
      const createdCategory = await addCategory(database, {
        name: name.trim(),
        color: color.trim() || null,
        icon: icon.trim() || null,
      });
      setName("");
      setColor("");
      setIcon("");
      showSuccess("Categoria adicionada com sucesso");
      return createdCategory;
    } catch {
      Alert.alert(
        "Não foi possível salvar",
        "Já existe uma categoria com esse nome.",
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    color,
    handleAdd,
    icon,
    isSaving,
    name,
    setColor,
    setIcon,
    setName,
  };
}
