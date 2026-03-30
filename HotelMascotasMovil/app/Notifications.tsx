import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { MobileHeader } from "../components/MobileHeader";
import NotificationCard, { NotificationItem } from "../components/NotificationCard";

export default function Notifications() {
  const notifications: NotificationItem[] = [
    {
      id: "n1",
      type: "confirmed",
      title: "Reserva confirmada",
      body: "Tu reserva para Luna en Suite Premium ha sido confirmada.",
      time: "Hace 15 horas",
    },
    {
      id: "n2",
      type: "cancelled",
      title: "Reserva cancelada",
      body: "La reserva de Max fue cancelada por el usuario.",
      time: "Hace menos de 1 hora",
    },
    {
      id: "n3",
      type: "reminder",
      title: "Recordatorio de llegada",
      body: "Recuerda llevar la cartilla sanitaria de Milo.",
      time: "Hace 2 días",
    },
    {
      id: "n4",
      type: "info",
      title: "Cambio de horario",
      body: "Hemos actualizado el horario de atención el próximo fin de semana.",
      time: "Hace 3 días",
    },
  ];

  return (
    <View style={styles.page}>
      <MobileHeader title="Notificaciones" showBack={true} backgroundColor="#6D4C41" />

      <ScrollView contentContainerStyle={styles.list}>
        {notifications.map((n) => (
          <NotificationCard key={n.id} item={n} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff" },
  list: { padding: 16, paddingTop: 12 },
});
