import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    borderRadius: 8,
    elevation: 5,
    maxWidth: "90%",
    paddingHorizontal: 16,
    paddingVertical: 13,
    position: "absolute",
    top: 52,
    shadowColor: "#000000",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  message: { fontSize: 13, fontWeight: "600", textAlign: "center" },
});
