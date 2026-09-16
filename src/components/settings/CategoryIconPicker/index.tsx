import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import {
    CATEGORY_ICONS,
    getCategorySymbolName,
} from "@/src/constants/category-options";
import { useAppTheme } from "@/src/theme/theme";

import { styles } from "./style";

interface CategoryIconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryIconPicker({
  value,
  onChange,
}: CategoryIconPickerProps) {
  const { colors } = useAppTheme();

  return (
    <>
      <Text style={[styles.label, { color: colors.text }]}>
        Ícone da categoria
      </Text>
      <View style={styles.grid}>
        {CATEGORY_ICONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <Pressable
              accessibilityLabel={`Selecionar ícone ${option.name}`}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
                isSelected && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={getCategorySymbolName(option.value)}
                size={18}
                tintColor={isSelected ? colors.onStrong : colors.text}
              />
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.selectedValue, { color: colors.textMuted }]}>
        {value ? `Selecionado: ${value}` : "Selecione um ícone"}
      </Text>
    </>
  );
}
