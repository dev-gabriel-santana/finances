import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "600", marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  option: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  selectedValue: { fontFamily: "SpaceMono", fontSize: 10, marginBottom: 12 },
  pressed: { opacity: 0.65 },
});
