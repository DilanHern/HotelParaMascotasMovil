import { DropdownSelect } from "@/components/DropdownSelect";
import { createReservation, getAvailableRooms, getSpecialServices, getUserPets } from "@/src/reservationsService";
import { Calendar, Check, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

export default function NewReservationModal({ visible, onClose }: Props) {
  const [pets, setPets] = useState<any[]>([]);
  const [petId, setPetId] = useState<string | null>(null);
  const [petName, setPetName] = useState<string | null>(null);
  const [showPetList, setShowPetList] = useState(false);
  const [showRoomList, setShowRoomList] = useState(false);

  const [lodgingType, setLodgingType] = useState<"Estándar" | "Especial" | null>(null);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const dateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = dateOnly(new Date());

  const [roomsAvailable, setRoomsAvailable] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string | null>(null);

  const [services, setServices] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingReservation, setSavingReservation] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<"start" | "end" | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  useEffect(() => {
    if (visible) {
      loadPets();
      loadServices();
    }
  }, [visible]);

  const loadPets = async () => {
    try {
      setLoading(true);
      const userPets = await getUserPets();
      setPets(userPets);
    } catch (error) {
      console.error("Error loading pets:", error);
      Toast.show({ type: "error", text1: "Error al cargar mascotas", position: "bottom" });
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (s: string) => {
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const loadServices = async () => {
    try {
      const data = await getSpecialServices();
      setAvailableServices(data);
    } catch (error) {
      console.error("Error loading services:", error);
      setAvailableServices([]);
    }
  };

  const verifyAvailability = async () => {
    if (!lodgingType) {
      Toast.show({ type: "error", text1: "Selecciona tipo de hospedaje", position: "bottom" });
      return;
    }
    if (!startDate || !endDate) return;
    try {
      setLoading(true);
      const available = await getAvailableRooms(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        lodgingType!
      );
      setRoomsAvailable(available);
      if (!available || available.length === 0) {
        Toast.show({ type: "info", text1: "No hay habitaciones disponibles en esas fechas", position: "bottom" });
        setShowRoomList(false);
      } else {
        // abre el dropdown para que el usuario vea opciones de inmediato
        setShowRoomList(true);
      }
    } catch (error) {
      console.error("Error verifying availability:", error);
      const msg = String((error as any)?.message ?? error ?? "");
      if (msg.toLowerCase().includes("get_available_rooms")) {
        Toast.show({
          type: "error",
          text1: "Falta configurar la función de disponibilidad en Supabase",
          text2: "Ejecuta DataBase/permisosnecesarios.sql y vuelve a intentar.",
          position: "bottom",
        });
      }
      Toast.show({ type: "error", text1: "Error al verificar disponibilidad", position: "bottom" });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => date.toLocaleDateString("es-ES");

  const handleCreateReservation = async () => {
    if (!petId) {
      Toast.show({ type: "error", text1: "Selecciona una mascota", position: "bottom" });
      return;
    }
    if (!lodgingType) {
      Toast.show({ type: "error", text1: "Selecciona tipo de hospedaje", position: "bottom" });
      return;
    }
    if (!startDate || !endDate) {
      Toast.show({ type: "error", text1: "Selecciona fechas", position: "bottom" });
      return;
    }
    if (!selectedRoomId) {
      Toast.show({ type: "error", text1: "Selecciona habitación", position: "bottom" });
      return;
    }
    if (lodgingType === "Especial" && services.length === 0) {
      Toast.show({ type: "error", text1: "Selecciona servicios adicionales", position: "bottom" });
      return;
    }

    try {
      setSavingReservation(true);
      await createReservation({
        pet_id: petId,
        room_id: selectedRoomId,
        check_in_date: startDate.toISOString().split("T")[0],
        check_out_date: endDate.toISOString().split("T")[0],
        lodging_type: lodgingType,
        special_services: lodgingType === "Especial" ? services : [],
      });
      Toast.show({ type: "success", text1: "Reserva creada exitosamente", position: "bottom" });
      onClose();
    } catch (error) {
      console.error("Error creating reservation:", error);
      Toast.show({ type: "error", text1: "Error al crear reserva", position: "bottom" });
    } finally {
      setSavingReservation(false);
    }
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

          <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            <DropdownSelect
              label="Mascota *"
              options={pets.map((p) => ({ id: p.id, name: p.name }))}
              selectedId={petId}
              onSelect={(option) => {
                setPetId(String(option.id));
                setPetName(option.name);
              }}
              placeholder={pets.length === 0 ? "Cargando mascotas..." : "Selecciona"}
            />

            <Text style={styles.fieldLabel}>Tipo de hospedaje *</Text>
            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={[styles.typeButton, lodgingType === "Estándar" ? styles.typeButtonActive : null]}
                onPress={() => {
                  setLodgingType("Estándar");
                  setServices([]);
                }}
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
              onPress={() => {
                const initial = startDate || today;
                setTempDate(initial);
                setDatePickerTarget("start");
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.dateText}>{startDate ? formatDate(startDate) : "Selecciona una fecha"}</Text>
              <Calendar color="#6b4226" size={18} />
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Fecha de salida *</Text>
            <TouchableOpacity
              style={[styles.dateField, !startDate ? styles.fieldDisabled : null, styles.fieldRow]}
              onPress={() => {
                if (!startDate) return;
                const initial = endDate || new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1);
                setTempDate(initial);
                setDatePickerTarget("end");
                setShowDatePicker(true);
              }}
              disabled={!startDate}
            >
              <Text style={styles.dateText}>{endDate ? formatDate(endDate) : "Selecciona una fecha"}</Text>
              <Calendar color="#6b4226" size={18} />
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              date={tempDate}
              onConfirm={(date: Date) => {
                if (datePickerTarget === "start") {
                  if (date < today) {
                    Toast.show({ type: "error", text1: "La fecha no puede ser anterior a hoy", position: "bottom" });
                    setShowDatePicker(false);
                    return;
                  }
                  setStartDate(date);
                  setEndDate(null);
                  setRoomsAvailable([]);
                  setSelectedRoomId(null);
                  setSelectedRoomName(null);
                } else if (datePickerTarget === "end") {
                  if (startDate && date <= startDate) {
                    Toast.show({ type: "error", text1: "La fecha de salida debe ser posterior a la de entrada", position: "bottom" });
                    setShowDatePicker(false);
                    return;
                  }
                  setEndDate(date);
                  setRoomsAvailable([]);
                  setSelectedRoomId(null);
                  setSelectedRoomName(null);
                }
                setShowDatePicker(false);
                setDatePickerTarget(null);
              }}
              onCancel={() => {
                setShowDatePicker(false);
                setDatePickerTarget(null);
              }}
              minimumDate={
                datePickerTarget === "start"
                  ? today
                  : startDate
                  ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1)
                  : today
              }
              maximumDate={new Date(2099, 11, 31)}
              locale="es-ES"
            />

            <TouchableOpacity
              style={[styles.verifyButton, !(startDate && endDate && lodgingType) ? styles.buttonDisabled : null]}
              activeOpacity={0.8}
              onPress={() => {
                verifyAvailability();
              }}
              disabled={!(startDate && endDate && lodgingType)}
            >
              <Text style={styles.verifyButtonText}>Verificar disponibilidad</Text>
            </TouchableOpacity>

            <DropdownSelect
              label="Habitación *"
              options={roomsAvailable.map((r) => ({ id: r.id, name: r.name }))}
              selectedId={selectedRoomId}
              onSelect={(option) => {
                setSelectedRoomId(String(option.id));
                setSelectedRoomName(option.name);
              }}
              placeholder={roomsAvailable.length === 0 ? "Verifica primero la disponibilidad" : "Selecciona habitación"}
            />

            {lodgingType === "Especial" && (
              <>
                <Text style={styles.fieldLabel}>Servicios adicionales * (requerido para el hospedaje especial)</Text>
                <View style={styles.servicesList}>
                  {(availableServices.length ? availableServices : [
                    "Baño",
                    "Paseo",
                    "Comida especial",
                    "Juegos",
                    "Cuidado veterinario",
                  ]).map((s) => (
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
                style={[styles.createButton, savingReservation ? styles.buttonDisabled : null]}
                activeOpacity={0.8}
                onPress={handleCreateReservation}
                disabled={savingReservation}
              >
                {savingReservation ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Crear reserva</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} activeOpacity={0.8} onPress={onClose} disabled={savingReservation}>
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
    marginBottom: 12,
  },
  form: {
    paddingVertical: 12,
    paddingBottom: 20,
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
    maxHeight: 150,
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
  dateText: {
    flex: 1,
  },
  fieldDisabled: {
    opacity: 0.6,
  },
  verifyButton: {
    marginTop: 12,
    marginBottom: 12,
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
