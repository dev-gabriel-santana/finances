import { Pressable, Text, View } from "react-native";

import { CATEGORY_COLORS } from "@/src/constants/category-options";
import { useAppTheme } from "@/src/theme/theme";

import { styles } from "./style";

interface CategoryColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryColorPicker({
  value,
  onChange,
}: CategoryColorPickerProps) {
  const { colors } = useAppTheme();

  return (
    <>
      <Text style={[styles.label, { color: colors.text }]}>
        Cor da categoria
      </Text>
      <View style={styles.grid}>
        {CATEGORY_COLORS.map((option) => {
          const isSelected = value === option.value;

          return (
            <Pressable
              accessibilityLabel={`Selecionar cor ${option.name}`}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                { backgroundColor: option.value },
                isSelected && [styles.selected, { borderColor: colors.text }],
                pressed && styles.pressed,
              ]}
            >
              {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.selectedValue, { color: colors.textMuted }]}>
        {value ? `Selecionada: ${value}` : "Selecione uma cor"}
      </Text>
    </>
  );
}
