import { Bell, Calendar, Info, XCircle } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type NotificationItem = {
  id: string;
  type: "confirmed" | "cancelled" | "info" | "reminder";
  title: string;
  body: string;
  time: string;
};

export default function NotificationCard({ item }: { item: NotificationItem }) {
  const renderIcon = () => {
    switch (item.type) {
      case "confirmed":
        return <Calendar color="#6b4226" size={24} />;
      case "cancelled":
        return <XCircle color="#e53935" size={24} />;
      case "reminder":
        return <Bell color="#6b4226" size={24} />;
      default:
        return <Info color="#6b4226" size={24} />;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>{renderIcon()}</View>

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
      </View>

      <Text style={styles.time}>{item.time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
    borderWidth: 1,
    borderColor: "#808080",
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  content: {
    marginBottom: 5,
    marginTop: 5,
    flex: 1,
  },
  title: {
    fontWeight: "700",
    fontSize: 17,
    marginBottom: 4,
    color: "#6b4226",
  },
  body: {
    color: "#555",
    fontSize: 14,
  },
  time: {
    marginLeft: 8,
    color: "#999",
    fontSize: 12,
  },
});
