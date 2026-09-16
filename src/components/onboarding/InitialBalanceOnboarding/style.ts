import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 440,
    padding: 18,
    width: "100%",
  },
  modalHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    marginRight: 10,
  },
  closeButton: {
    minHeight: 28,
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  modalDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  balanceInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontFamily: "SpaceMono",
    fontSize: 22,
    height: 56,
    marginTop: 14,
    paddingHorizontal: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  modalButton: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
