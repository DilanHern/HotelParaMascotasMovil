import { Calendar, Tag, Trash2, X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export type Reservation = {
  id: string;
  petName: string;
  roomName: string;
  startDate: string;
  endDate: string;
  lodgingType: string;
  status: "activa" | "cancelada" | "finalizada";
};

export default function ReservationCard({ reservation }: { reservation: Reservation }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.petName}>{reservation.petName}</Text>
        <View style={[styles.statusPill, reservation.status === "activa" ? styles.statusActive : reservation.status === "cancelada" ? styles.statusCancelled : styles.statusFinished]}>
          <Text style={styles.statusText}>{reservation.status}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.value, styles.roomName]}>{reservation.roomName}</Text>
      </View>

      <View style={styles.row}>
        <Calendar color="#6b4226" size={16} style={styles.icon} />
        <Text style={styles.value}>{reservation.startDate} - {reservation.endDate}</Text>
      </View>

      <View style={styles.row}>
        <Tag color="#6b4226" size={16} style={styles.icon} />
        <Text style={styles.value}>{reservation.lodgingType}</Text>
      </View>

      {reservation.status === "activa" && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.cancelButton} activeOpacity={0.8} onPress={() => setShowConfirm(true)}>
            <Trash2 color="#fff" size={16} style={styles.trashIcon} />
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowConfirm(false)} accessibilityLabel="close">
              <X color="#6b4226" size={20} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Cancelar reserva</Text>
            <Text style={styles.modalSubtitle}>¿Estás seguro que deseas cancelar esta reserva?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                activeOpacity={0.8}
                onPress={() => {
                  setShowConfirm(false);
                  Toast.show({ type: "success", text1: "Reserva cancelada", position: 'bottom' });
                }}
              >
                <Text style={styles.modalButtonPrimaryText}>Si, cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalButtonSecondary} activeOpacity={0.8} onPress={() => setShowConfirm(false)}>
                <Text style={styles.modalButtonSecondaryText}>No, mantener</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
    borderWidth: 1,
    borderColor: "#808080",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  petName: {
		fontSize: 18,
		fontWeight: "700",
		color: "#6b4226",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 87,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 13,
    textTransform: "capitalize",
  },
  statusActive: { backgroundColor: "#6b4226" },
  statusCancelled: { backgroundColor: "#6b4226" },
  statusFinished: { backgroundColor: "#6b4226" },
  row: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "center",
  },
  label: {
    fontWeight: "600",
    marginRight: 6,
  },
  value: {
    flex: 1,
    flexWrap: "wrap",
    color: "#999999",
  },
  roomName: {
    color: "#8b6f47",
    marginBottom: 8,
  },
  icon: {
    marginRight: 6,
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#e53935",
    paddingVertical: 10,
    paddingHorizontal: 120,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
  },
  trashIcon: {
    marginRight: 8,
  },
  cancelText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    position: "relative",
    borderWidth: 1,
    borderColor: "#6D4C41",
  },
  modalClose: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6b4226",
    textAlign: "center",
    marginTop: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#a07c66",
    textAlign: "center",
    marginTop: 8,
  },
  modalButtons: {
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  modalButtonPrimary: {
    backgroundColor: "#e53935",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  modalButtonPrimaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  modalButtonSecondary: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 8,
    borderWidth: 1,
    color: "#a07c66",
  },
  modalButtonSecondaryText: {
    color: "#333",
    fontWeight: "700",
  },
});
