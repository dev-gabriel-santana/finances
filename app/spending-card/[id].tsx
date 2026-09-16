import { useLocalSearchParams } from "expo-router";

import { SpendingCardDetailScreen } from "@/src/components/spending/SpendingCardDetailScreen";

export default function SpendingCardDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <SpendingCardDetailScreen cardId={Number(id)} />;
}
