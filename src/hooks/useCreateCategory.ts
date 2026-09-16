import { useState } from "react";
import { Alert } from "react-native";

import { useDatabase } from "@/src/db/provider";
import { addCategory } from "@/src/db/queries/cards-categories";

export function useCreateCategory() {
  const database = useDatabase();
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
      await addCategory(database, {
        name: name.trim(),
        color: color.trim() || null,
        icon: icon.trim() || null,
      });
      setName("");
      setColor("");
      setIcon("");
    } catch {
      Alert.alert(
        "Não foi possível salvar",
        "Já existe uma categoria com esse nome.",
      );
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
