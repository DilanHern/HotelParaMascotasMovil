import { MobileHeader } from "@/components/MobileHeader";
import { sendPasswordResetOtp, verifyOtp, changePassword } from "@/src/authService";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Step = "email" | "otp" | "password";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Paso 1 — Enviar OTP
  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Ingresá tu correo");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetOtp(email);
      Alert.alert("Código enviado", "Revisá tu correo e ingresá el código de 8 dígitos");
      setStep("otp");
    } catch (e: any) {
      Alert.alert("Error", e.message || "No se pudo enviar el código");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2 — Verificar OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 8) {
      Alert.alert("Error", "Ingresá el código de 8 dígitos");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email, otp);
      setStep("password");
    } catch (e: any) {
      Alert.alert("Error", "Código incorrecto o expirado");
    } finally {
      setLoading(false);
    }
  };

  // Paso 3 — Nueva contraseña
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Por favor completá todos los campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await changePassword(newPassword);
      Alert.alert("¡Éxito!", "Tu contraseña fue actualizada correctamente", [
        { text: "OK", onPress: () => router.replace("/auth/Login" as any) },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message || "No se pudo actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MobileHeader title="Olvidé mi contraseña" showBack={true} backPath="/auth/Login" />
      <View style={styles.content}>

        {/* Paso 1 - Email */}
        {step === "email" && (
          <>
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitle}>
              Ingresá tu correo y te enviaremos un código para resetearla
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="tu@correo.com"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Enviando..." : "Enviar código"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Paso 2 - OTP */}
        {step === "otp" && (
          <>
            <Text style={styles.title}>Ingresá el código</Text>
            <Text style={styles.subtitle}>
              Enviamos un código de 8 dígitos a {email}
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Código</Text>
              <TextInput
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={8}
                placeholder="000000"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Verificando..." : "Verificar código"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleSendOtp}
              disabled={loading}
            >
              <Text style={styles.resendText}>¿No recibiste el código? Reenviar</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Paso 3 - Nueva contraseña */}
        {step === "password" && (
          <>
            <Text style={styles.title}>Nueva contraseña</Text>
            <Text style={styles.subtitle}>Ingresá tu nueva contraseña</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nueva contraseña</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={true}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                placeholder="Repetí la contraseña"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Actualizando..." : "Actualizar contraseña"}
              </Text>
            </TouchableOpacity>
          </>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8e7",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 30,
    color: "#666",
    textAlign: "center",
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
  button: {
    width: "100%",
    backgroundColor: "#6D4C41",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#a1887f",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  resendButton: {
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: "#6D4C41",
    fontWeight: "600",
  },
});