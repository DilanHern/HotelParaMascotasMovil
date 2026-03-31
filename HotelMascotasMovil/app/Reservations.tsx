import { Calendar, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MobileHeader } from "../components/MobileHeader";
import NewReservationModal from "../components/NewReservationModal";
import type { Reservation } from "../components/ReservationCard";
import ReservationCard from "../components/ReservationCard";

export default function Reservations() {

  const [showNewReservation, setShowNewReservation] = useState(false);

	// mock data
	const reservations: Reservation[] = [
        
		{
			id: "1",
			petName: "Luna",
			roomName: "Suite Premium",
			startDate: "2026-04-01",
			endDate: "2026-04-05",
			lodgingType: "Pensión completa",
			status: "activa",
		},
		{
			id: "2",
			petName: "Max",
			roomName: "Habitación Estándar",
			startDate: "2026-03-10",
			endDate: "2026-03-12",
			lodgingType: "Alojamiento",
			status: "finalizada",
		},
		{
			id: "3",
			petName: "Milo",
			roomName: "Suite Junior",
			startDate: "2026-05-02",
			endDate: "2026-05-04",
			lodgingType: "Pensión completa",
			status: "cancelada",
		},
	];

	return (
		<View style={styles.page}>
			<MobileHeader title="Mis Reservas" showBack={true} backPath="/home" />

			<View style={styles.headerActions}>
        <TouchableOpacity style={styles.newReservationButton} activeOpacity={0.8} onPress={() => setShowNewReservation(true)}>
					<Plus color="#fff" size={16} style={styles.icon} />
					<Text style={styles.buttonText}>Nueva Reserva</Text>
				</TouchableOpacity>
			</View>

      <NewReservationModal visible={showNewReservation} onClose={() => setShowNewReservation(false)} />

			{reservations.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Calendar size={72} color="#6b4226" />
					<Text style={styles.emptyText}>No tienes reservas</Text>
				</View>
			) : (
				<ScrollView contentContainerStyle={styles.listContainer}>
					{reservations.map((r) => (
						<ReservationCard key={r.id} reservation={r as any} />
					))}
				</ScrollView>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
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
  page: {
    flex: 1,
    backgroundColor: "#fff8e7",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
