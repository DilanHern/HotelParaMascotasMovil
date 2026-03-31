import { Calendar, Check, ChevronDown, ChevronUp, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Toast from "react-native-toast-message";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const mockPets = ["Luna", "Max", "Milo"];

const allRooms = [
  { id: "r1", name: "Suite Premium" },
  { id: "r2", name: "Habitación Estándar" },
  { id: "r3", name: "Suite Junior" },
  { id: "r4", name: "Habitación Deluxe" },
];

export default function NewReservationModal({ visible, onClose }: Props) {
  const [pet, setPet] = useState<string | null>(null);
  const [showPetList, setShowPetList] = useState(false);
  const [showRoomList, setShowRoomList] = useState(false);

  const [lodgingType, setLodgingType] = useState<"Estándar" | "Especial" | null>(null);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // normalize date to local year/month/day (midnight) to avoid timezone/DST issues
  const dateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const today = dateOnly(new Date());

  const [roomsAvailable, setRoomsAvailable] = useState<typeof allRooms>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const [services, setServices] = useState<string[]>([]);

  const toggleService = (s: string) => {
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const verifyAvailability = () => {
    if (!startDate || !endDate) return;
    // mock availability: filter by lodgingType for variety
    const available = allRooms.filter((r, i) => (lodgingType === "Especial" ? i % 2 === 0 : true));
    setRoomsAvailable(available);
  };

  const onSelectStart = (date: Date) => {
    const sel = dateOnly(date);
    if (sel < today) {
      setShowStartPicker(false);
      return;
    }
    setStartDate(sel);
    setShowStartPicker(false);
    // reset end date when start changes
    setEndDate(null);
    setRoomsAvailable([]);
    setSelectedRoom(null);
    setShowRoomList(false);
  };

  const onSelectEnd = (date: Date) => {
    const sel = dateOnly(date);
    setEndDate(sel);
    setShowEndPicker(false);
    setRoomsAvailable([]);
    setSelectedRoom(null);
    setShowRoomList(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalClose} onPress={onClose} accessibilityLabel="close">
            <X color="#6b4226" size={20} />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Nueva Reserva</Text>
          <Text style={styles.modalSubtitle}>Completa los detalles de la reserva</Text>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <Text style={styles.fieldLabel}>Mascota *</Text>
            <TouchableOpacity style={[styles.dropdown, styles.fieldRow]} onPress={() => setShowPetList((s) => !s)}>
              <Text>{pet ?? "Selecciona una mascota"}</Text>
              {showPetList ? <ChevronUp color="#6b4226" size={18} /> : <ChevronDown color="#6b4226" size={18} />}
            </TouchableOpacity>
            {showPetList && (
              <View style={styles.optionsList}>
                {mockPets.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={styles.optionItem}
                    onPress={() => {
                      setPet(p);
                      setShowPetList(false);
                    }}
                  >
                    <Text>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.fieldLabel}>Tipo de hospedaje *</Text>
            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={[styles.typeButton, lodgingType === "Estándar" ? styles.typeButtonActive : null]}
                onPress={() => setLodgingType("Estándar")}
              >
                <Text style={lodgingType === "Estándar" ? styles.typeButtonTextActive : undefined}>Estándar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, lodgingType === "Especial" ? styles.typeButtonActive : null]}
                onPress={() => setLodgingType("Especial")}
              >
                <Text style={lodgingType === "Especial" ? styles.typeButtonTextActive : undefined}>Especial</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Fecha de entrada *</Text>
            <TouchableOpacity
              style={[styles.dateField, styles.fieldRow]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text>{startDate ? startDate.toLocaleDateString() : "Selecciona fecha de entrada"}</Text>
              <Calendar color="#6b4226" size={18} />
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={showStartPicker}
              mode="date"
              date={startDate ?? today}
              minimumDate={today}
              onConfirm={onSelectStart}
              onCancel={() => setShowStartPicker(false)}
            />

            <Text style={styles.fieldLabel}>Fecha de salida *</Text>
            <TouchableOpacity
              style={[styles.dateField, !startDate ? styles.fieldDisabled : null, styles.fieldRow]}
              onPress={() => startDate && setShowEndPicker(true)}
            >
              <Text>{endDate ? endDate.toLocaleDateString() : "Selecciona fecha de salida"}</Text>
              <Calendar color="#6b4226" size={18} />
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={showEndPicker}
              mode="date"
              date={endDate ?? (startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1) : today)}
              minimumDate={startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1) : undefined}
              onConfirm={(d: Date) => {
                const sel = dateOnly(d);
                if (startDate && sel <= startDate) {
                  setShowEndPicker(false);
                  return;
                }
                onSelectEnd(sel);
              }}
              onCancel={() => setShowEndPicker(false)}
            />

            <TouchableOpacity
              style={[styles.verifyButton, !(startDate && endDate) ? styles.buttonDisabled : null]}
              activeOpacity={0.8}
              onPress={() => {
                verifyAvailability();
              }}
            >
              <Text style={styles.verifyButtonText}>Verificar disponibilidad</Text>
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Habitación *</Text>
            <TouchableOpacity
              style={[styles.dropdown, roomsAvailable.length === 0 ? styles.fieldDisabled : null, styles.fieldRow]}
              onPress={() => roomsAvailable.length > 0 && setShowRoomList((s) => !s)}
            >
              <Text>{selectedRoom ?? (roomsAvailable.length === 0 ? "Verifica primero la disponibilidad" : "Selecciona habitación")}</Text>
              {showRoomList ? <ChevronUp color="#6b4226" size={18} /> : <ChevronDown color="#6b4226" size={18} />}
            </TouchableOpacity>
            {roomsAvailable.length > 0 && showRoomList && (
              <View style={styles.optionsList}>
                {roomsAvailable.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={styles.optionItem}
                    onPress={() => {
                      setSelectedRoom(r.name);
                      setShowRoomList(false);
                    }}
                  >
                    <Text>{r.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {lodgingType === "Especial" && (
              <>
                <Text style={styles.fieldLabel}>Servicios adicionales * (requerido para el hospedaje especial)</Text>
                <View style={styles.servicesList}>
                  {[
                    "Baño",
                    "Paseo",
                    "Comida especial",
                    "Juegos",
                    "Cuidado veterinario",
                  ].map((s) => (
                    <TouchableOpacity key={s} style={styles.serviceItem} onPress={() => toggleService(s)}>
                      <View style={[styles.checkbox, services.includes(s) ? styles.checkboxChecked : null]}>
                        {services.includes(s) && <Check color="#fff" size={14} />}
                      </View>
                      <Text style={styles.serviceLabel}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={styles.createButton}
                activeOpacity={0.8}
                onPress={() => {
                  Toast.show({ type: "success", text1: "Reserva creada exitosamente", position: 'bottom' });
                  onClose();
                }}
              >
                <Text style={styles.createButtonText}>Crear reserva</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} activeOpacity={0.8} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalContent: {
    width: "100%",
    maxHeight: "90%",
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
  form: {
    paddingVertical: 12,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "600",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
  },
  optionsList: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginTop: 8,
    overflow: "hidden",
  },
  optionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  rowButtons: {
    flexDirection: "row",
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  typeButtonActive: {
    backgroundColor: "#6D4C41",
  },
  typeButtonTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  dateField: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
  },
  fieldDisabled: {
    opacity: 0.6,
  },
  verifyButton: {
    marginTop: 12,
    backgroundColor: "#6D4C41",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  servicesList: {
    marginTop: 8,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#6b4226",
    borderColor: "#6b4226",
  },
  serviceLabel: {},
  footerButtons: {
    marginTop: 16,
  },
  createButton: {
    backgroundColor: "#6b4226",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
