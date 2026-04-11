import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { MobileHeader } from "../components/MobileHeader";
import NotificationCard, { NotificationItem } from "../components/NotificationCard";
import { supabase } from "@/lib/supabase";
import { databaseNotificationService } from "@/src/Notification/databaseNotificationService";

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("Usuario no autenticado");
        setLoading(false);
        return;
      }

      const dbNotifications = await databaseNotificationService.getNotificationsByUserId(user.id);

      const mappedNotifications: NotificationItem[] = dbNotifications.map((n: any) => {
        // Determinar el tipo basado en el nombre de la notificación
        let notificationType = "info";
        const name = (n.name || "").toLowerCase();

        if (name.includes("cancelada")) notificationType = "cancelled";
        else if (name.includes("confirmada") || name.includes("creada")) notificationType = "confirmed";
        else if (name.includes("recordatorio")) notificationType = "reminder";
        else if (name.includes("actualización")) notificationType = "info";

        // Calcular tiempo relativo
        const date = new Date(n.date);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let timeAgo = "Hace poco";
        if (diffMins < 1) timeAgo = "Ahora";
        else if (diffMins < 60) timeAgo = `Hace ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;
        else if (diffHours < 24) timeAgo = `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
        else if (diffDays < 7) timeAgo = `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
        else timeAgo = date.toLocaleDateString("es-ES");

        return {
          id: n.id?.toString() || "",
          type: notificationType as "confirmed" | "cancelled" | "reminder" | "info",
          title: n.name || "Notificación",
          body: n.description || "",
          time: timeAgo,
        };
      });

      setNotifications(mappedNotifications);
      setError(null);
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
      setError("Error al cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <MobileHeader title="Notificaciones" showBack={true} />

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#ff9500" />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No hay notificaciones</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {notifications.map((n) => (
            <NotificationCard key={n.id} item={n} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff8e7" },
  list: { padding: 16, paddingTop: 20 },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 14, color: "#d32f2f", textAlign: "center", paddingHorizontal: 16 },
  emptyText: { fontSize: 14, color: "#999", textAlign: "center" },
});
