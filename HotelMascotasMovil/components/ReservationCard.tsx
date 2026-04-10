import { Calendar, Tag, Trash2, X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import Toast from "react-native-toast-message";
import { deleteReservation } from "@/src/reservationsService";

export type Reservation = {
  id: string;
  pet_name?: string;
  room_name?: string;
  check_in_date: string;
  check_out_date: string;
  lodging_type: string;
  status: 0 | 1 | 2 | 3;
};

type Props = {
  reservation: Reservation;
  onDelete?: () => void;
  onUpdate?: () => void;
};

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "Pendiente";
    case 1:
      return "Confirmada";
    case 2:
      return "En curso";
    case 3:
      return "Completada";
    default:
      return "Desconocido";
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "#FF9800";
    case 1:
      return "#6b4226";
    case 2:
      return "#4CAF50";
    case 3:
      return "#999999";
    default:
      return "#999999";
  }
};

export default function ReservationCard({ reservation, onDelete, onUpdate }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteReservation(reservation.id);
      Toast.show({ type: "success", text1: "Reserva cancelada", position: "bottom" });
      setShowConfirm(false);
      onDelete?.();
    } catch (error) {
      console.error("Error deleting reservation:", error);
      Toast.show({ type: "error", text1: "Error al cancelar la reserva", position: "bottom" });
    } finally {
      setDeleting(false);
    }
  };

  const canCancel = reservation.status === 0 || reservation.status === 1;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.petName}>{reservation.pet_name || "Mascota"}</Text>
        <View style={[styles.statusPill, { backgroundColor: getStatusColor(reservation.status) }]}>
          <Text style={styles.statusText}>{getStatusText(reservation.status)}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.value, styles.roomName]}>{reservation.room_name || "Habitación"}</Text>
      </View>

      <View style={styles.row}>
        <Calendar color="#6b4226" size={16} style={styles.icon} />
        <Text style={styles.value}>{reservation.check_in_date} - {reservation.check_out_date}</Text>
      </View>

      <View style={styles.row}>
        <Tag color="#6b4226" size={16} style={styles.icon} />
        <Text style={styles.value}>{reservation.lodging_type}</Text>
      </View>

      {canCancel && (
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
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowConfirm(false)} accessibilityLabel="close" disabled={deleting}>
              <X color="#6b4226" size={20} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Cancelar reserva</Text>
            <Text style={styles.modalSubtitle}>¿Estás seguro que deseas cancelar esta reserva?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButtonPrimary, deleting ? styles.buttonDisabled : null]}
                activeOpacity={0.8}
                onPress={handleDelete}
                disabled={deleting}
              >
                <Text style={styles.modalButtonPrimaryText}>{deleting ? "Cancelando..." : "Si, cancelar"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalButtonSecondary} activeOpacity={0.8} onPress={() => setShowConfirm(false)} disabled={deleting}>
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
  buttonDisabled: {
    opacity: 0.6,
  },
});
