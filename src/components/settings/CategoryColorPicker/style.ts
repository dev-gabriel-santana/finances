import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "600", marginBottom: 10 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  option: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 18,
    borderWidth: 3,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  selected: { borderWidth: 3, transform: [{ scale: 1.12 }] },
  checkmark: { color: "#ffffff", fontSize: 17, fontWeight: "800" },
  selectedValue: { fontFamily: "SpaceMono", fontSize: 10, marginBottom: 16 },
  pressed: { opacity: 0.65 },
});
