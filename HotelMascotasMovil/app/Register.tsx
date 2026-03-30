import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { MobileHeader } from "@/components/MobileHeader";
import { DropdownSelect } from "@/components/DropdownSelect";
import { supabase } from "@/lib/supabase";
import {
  provinces,
  getCantonsByProvince,
  getDistrictsByCanton,
} from "@/utils/geographicData";

export default function Register() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [genero, setGenero] = useState("Otro");
  const [pais] = useState("Costa Rica");
  const [provinciaId, setProvinciaId] = useState<number | null>(null);
  const [cantonId, setCantonId] = useState<number | null>(null);
  const [distritoId, setDistritoId] = useState<number | null>(null);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCedulaChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    if (numericText.length <= 9) {
      setCedula(numericText);
    }
  };

  const handleTelefonoChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    if (numericText.length <= 8) {
      setTelefono(numericText);
    }
  };

  const handleRegister = async () => {
    console.log("=== INICIO REGISTRO ===");
    console.log("nombre:", nombre);
    console.log("email:", email);
    console.log("password:", password);
    console.log("cedula:", cedula);
    console.log("telefono:", telefono);
    console.log("distritoId:", distritoId);

    // Validaciones
    if (!nombre || !email || !password || !cedula || !telefono || !distritoId) {
      console.log("FALLO: campos incompletos");
      Alert.alert("Error", "Por favor completá todos los campos obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      console.log("FALLO: contraseñas no coinciden");
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (cedula.length < 9) {
      console.log("FALLO: cédula corta");
      Alert.alert("Error", "La cédula debe tener 9 dígitos");
      return;
    }

    if (telefono.length < 8) {
      console.log("FALLO: teléfono corto");
      Alert.alert("Error", "El teléfono debe tener 8 dígitos");
      return;
    }

    const nombreParts = nombre.trim().split(" ");
    const firstname = nombreParts[0];
    const lastname = nombreParts.slice(1).join(" ") || ".";
    const genderBool = genero === "Masculino" ? true : false;

    console.log("Datos a enviar:", { firstname, lastname, cedula, telefono, genderBool, distritoId });

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstname,
            lastname,
            cedula,
            cellphone: telefono,
            gender: genderBool,
            line1,
            line2,
            district_id: distritoId,
          },
        },
      });

      console.log("Respuesta de Supabase:", JSON.stringify(data));
      console.log("Error de Supabase:", JSON.stringify(error));

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

  Alert.alert("¡Registro exitoso!", "Tu cuenta ha sido creada correctamente", [
    { text: "OK", onPress: () => router.push("/Reservations" as any) },
  ]);

    } catch (e) {
      console.log("EXCEPCIÓN:", e);
      Alert.alert("Error inesperado", String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/Login" as any);
  };

  return (
    <View style={styles.container}>
      <MobileHeader title="Registrarse" showBack={true} backPath="/Login" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>PetLodge</Text>
        <Text style={styles.subtitle}>Crear Cuenta</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Juan Pérez"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar Contraseña</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cédula Costarricense</Text>
          <TextInput
            style={styles.input}
            value={cedula}
            onChangeText={handleCedulaChange}
            placeholder="000000000"
            keyboardType="numeric"
            maxLength={9}
            placeholderTextColor="#999"
          />
          {cedula.length > 0 && cedula.length < 9 && (
            <Text style={styles.errorText}>La cédula debe tener 9 dígitos</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono Celular</Text>
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={handleTelefonoChange}
            placeholder="00000000"
            keyboardType="numeric"
            maxLength={8}
            placeholderTextColor="#999"
          />
          {telefono.length > 0 && telefono.length < 8 && (
            <Text style={styles.errorText}>El teléfono debe tener 8 dígitos</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Género</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.optionButton, genero === "Masculino" && styles.optionButtonActive]}
              onPress={() => setGenero("Masculino")}
            >
              <Text style={[styles.optionButtonText, genero === "Masculino" && styles.optionButtonTextActive]}>
                Masculino
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, genero === "Femenino" && styles.optionButtonActive]}
              onPress={() => setGenero("Femenino")}
            >
              <Text style={[styles.optionButtonText, genero === "Femenino" && styles.optionButtonTextActive]}>
                Femenino
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, genero === "Otro" && styles.optionButtonActive]}
              onPress={() => setGenero("Otro")}
            >
              <Text style={[styles.optionButtonText, genero === "Otro" && styles.optionButtonTextActive]}>
                Otro
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.directionTitle}>Dirección</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>País</Text>
          <View style={styles.countryContainer}>
            <Text style={styles.countryText}>{pais}</Text>
          </View>
        </View>

        <DropdownSelect
          label="Provincia"
          options={provinces}
          selectedId={provinciaId}
          onSelect={(option) => {
            setProvinciaId(option.id);
            setCantonId(null);
            setDistritoId(null);
          }}
          placeholder="Seleccionar provincia..."
        />

        {provinciaId !== null && (
          <DropdownSelect
            label="Cantón"
            options={getCantonsByProvince(provinciaId)}
            selectedId={cantonId}
            onSelect={(option) => {
              setCantonId(option.id);
              setDistritoId(null);
            }}
            placeholder="Seleccionar cantón..."
          />
        )}

        {cantonId !== null && (
          <DropdownSelect
            label="Distrito"
            options={getDistrictsByCanton(cantonId)}
            selectedId={distritoId}
            onSelect={(option) => setDistritoId(option.id)}
            placeholder="Seleccionar distrito..."
          />
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dirección Línea 1 (Opcional)</Text>
          <TextInput
            style={styles.input}
            value={line1}
            onChangeText={setLine1}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dirección Línea 2 (Opcional)</Text>
          <TextInput
            style={styles.input}
            value={line2}
            onChangeText={setLine2}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginLink}>Inicia Sesión</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Registrando..." : "Registrarse"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8e7",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 30,
    color: "#666",
    textAlign: "center",
  },
  directionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 15,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: "#333",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  optionButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  optionButtonActive: {
    backgroundColor: "#6D4C41",
    borderColor: "#6D4C41",
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  optionButtonTextActive: {
    color: "#fff",
  },
  countryContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  countryText: {
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 12,
    marginTop: 4,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    marginTop: 20,
    width: "100%",
  },
  loginText: {
    fontSize: 14,
    color: "#666",
    marginRight: 5,
  },
  loginLink: {
    fontSize: 14,
    color: "#6D4C41",
    fontWeight: "600",
  },
  button: {
    width: "100%",
    backgroundColor: "#6D4C41",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: "#a1887f",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});