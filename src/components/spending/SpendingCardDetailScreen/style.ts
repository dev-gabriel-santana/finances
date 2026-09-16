import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20 },
  headingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: { alignSelf: "flex-start", paddingVertical: 4 },
  backText: { fontSize: 12, fontWeight: "700" },
  eyebrow: {
    fontFamily: "SpaceMono",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 10,
  },
  title: { fontSize: 26, fontWeight: "700", marginTop: 3 },
  subtitle: { fontSize: 13, marginTop: 6 },
  content: { padding: 20, paddingBottom: 32, paddingTop: 12 },
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  errorText: { fontSize: 14, textAlign: "center" },
  empty: { alignItems: "center", paddingHorizontal: 24, paddingTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  emptyText: { fontSize: 14, marginTop: 8, textAlign: "center" },
});
