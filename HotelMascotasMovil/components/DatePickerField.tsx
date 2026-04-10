import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Calendar } from "lucide-react-native";
import DatePicker from "react-native-date-picker";

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || minimumDate || new Date());

  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES");
  };

  // Para web, retornar input de HTML nativo
  if (Platform.OS === "web") {
    const dateString = value ? value.toISOString().split("T")[0] : "";
    const minDate = minimumDate ? minimumDate.toISOString().split("T")[0] : "";
    const maxDate = maximumDate ? maximumDate.toISOString().split("T")[0] : "";

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <input
          type="date"
          value={dateString}
          onChange={(e: any) => {
            if (e.target.value) {
              const [year, month, day] = e.target.value.split("-");
              onChange(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
            }
          }}
          min={minDate}
          max={maxDate}
          disabled={disabled}
          style={webInputStyle}
        />
      </View>
    );
  }

  // Para iOS y Android, usar DatePicker
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.dateField, disabled && styles.disabled]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
      >
        <Text style={styles.dateText}>
          {value ? formatDate(value) : "Selecciona una fecha"}
        </Text>
        <Calendar color="#6b4226" size={18} />
      </TouchableOpacity>

      {showPicker && (
        <View style={styles.pickerContainer}>
          <DatePicker
            date={tempDate}
            onDateChange={(date: Date) => setTempDate(date)}
            mode="date"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            locale="es"
          />
          <View style={styles.pickerButtons}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.buttonText}>Listo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.buttonTextCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const webInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  borderWidth: 1,
  borderColor: "#ddd",
  borderStyle: "solid",
  fontSize: "16px",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
    fontSize: 14,
  },
  dateField: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  disabled: {
    opacity: 0.6,
  },
  pickerContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: "center",
  },
  pickerButtons: {
    marginTop: 12,
    width: "100%",
    gap: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#6b4226",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  buttonTextCancel: {
    color: "#333",
    fontWeight: "700",
    fontSize: 14,
  },
});
