import type { SymbolViewProps } from "expo-symbols";

export const CATEGORY_COLORS = [
  { name: "Verde", value: "#168a5b" },
  { name: "Esmeralda", value: "#0f766e" },
  { name: "Azul", value: "#2563eb" },
  { name: "Índigo", value: "#4f46e5" },
  { name: "Roxo", value: "#7c3aed" },
  { name: "Rosa", value: "#db2777" },
  { name: "Vermelho", value: "#dc2626" },
  { name: "Laranja", value: "#ea580c" },
  { name: "Amarelo", value: "#ca8a04" },
  { name: "Cinza", value: "#64748b" },
] as const;

export const CATEGORY_ICONS = [
  { name: "Alimentação", value: "fork.knife" },
  { name: "Casa", value: "house.fill" },
  { name: "Transporte", value: "car.fill" },
  { name: "Saúde", value: "heart.fill" },
  { name: "Educação", value: "book.fill" },
  { name: "Lazer", value: "star.fill" },
  { name: "Compras", value: "bag.fill" },
  { name: "Viagem", value: "airplane" },
  { name: "Salário", value: "dollarsign.circle.fill" },
  { name: "Outros", value: "tag.fill" },
] as const;

type CategorySymbolName = Exclude<SymbolViewProps["name"], string>;

const CATEGORY_SYMBOL_NAMES: Record<string, CategorySymbolName> = {
  "fork.knife": { ios: "fork.knife", android: "restaurant", web: "restaurant" },
  "house.fill": { ios: "house.fill", android: "home", web: "home" },
  "car.fill": {
    ios: "car.fill",
    android: "directions_car",
    web: "directions_car",
  },
  "heart.fill": { ios: "heart.fill", android: "favorite", web: "favorite" },
  "book.fill": { ios: "book.fill", android: "menu_book", web: "menu_book" },
  "star.fill": { ios: "star.fill", android: "star", web: "star" },
  "bag.fill": { ios: "bag.fill", android: "shopping_bag", web: "shopping_bag" },
  airplane: { ios: "airplane", android: "flight", web: "flight" },
  "dollarsign.circle.fill": {
    ios: "dollarsign.circle.fill",
    android: "payments",
    web: "payments",
  },
  "tag.fill": { ios: "tag.fill", android: "sell", web: "sell" },
};

export function getCategorySymbolName(value: string): CategorySymbolName {
  return CATEGORY_SYMBOL_NAMES[value] ?? CATEGORY_SYMBOL_NAMES["tag.fill"];
}
