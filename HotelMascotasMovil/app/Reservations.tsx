import { Calendar, Plus } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { MobileHeader } from "../components/MobileHeader";
import NewReservationModal from "../components/NewReservationModal";
import type { Reservation } from "../components/ReservationCard";
import ReservationCard from "../components/ReservationCard";
import { getUserReservations } from "@/src/reservationsService";

export default function Reservations() {
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadReservations();
    }, [])
  );

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await getUserReservations();
      setReservations(data || []);
    } catch (error) {
      console.error("Error loading reservations:", error);
      Alert.alert("Error", "No se pudieron cargar las reservas");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadReservations();
  };

  return (
    <View style={styles.page}>
      <MobileHeader title="Mis Reservas" showBack={true} backPath="/home" />

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.newReservationButton} activeOpacity={0.8} onPress={() => setShowNewReservation(true)}>
          <Plus color="#fff" size={16} style={styles.icon} />
          <Text style={styles.buttonText}>Nueva Reserva</Text>
        </TouchableOpacity>
      </View>

      <NewReservationModal visible={showNewReservation} onClose={() => {
        setShowNewReservation(false);
        handleRefresh();
      }} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6b4226" />
          <Text style={styles.loadingText}>Cargando reservas...</Text>
        </View>
      ) : reservations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar size={72} color="#6b4226" />
          <Text style={styles.emptyText}>No tienes reservas</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {reservations.map((r) => (
            <ReservationCard key={r.id} reservation={r as any} onDelete={handleRefresh} onUpdate={handleRefresh} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff8e7",
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  newReservationButton: {
    backgroundColor: "#6b4226",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6b4226",
    fontSize: 16,
  },
  emptyContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
    borderWidth: 1,
    borderColor: "#6D4C41",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
    paddingTop: 12,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
