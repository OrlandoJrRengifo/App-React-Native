import React from "react";
import { AuthRemoteDataSourceImpl } from "../../data/datasources/AuthRemoteDataSourceImp";

import {
  ScrollView,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  HelperText,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [loading, setLoading] = React.useState(false);

const handleSignup = async () => {
  try {
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const authDataSource = new AuthRemoteDataSourceImpl();
    const user = await authDataSource.signUp(email, password);

    if (user) {
      setSuccess("Cuenta creada correctamente. Redirigiendo...");
      setTimeout(() => navigation.replace("Login"), 2000);
    }
  } catch (err: any) {
    console.error("Signup failed:", err);
    setError(err.message || "Error al crear la cuenta.");
  } finally {
    setLoading(false);
  }
};


  return (
  <Surface style={{ flex: 1, backgroundColor: "#ffffffff" }}>
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <MaterialCommunityIcons name="account-plus" size={70} color="#673AB7" />
        <Text
          variant="headlineMedium"
          style={{
            fontWeight: "bold",
            color: "#333",
            marginBottom: 8,
            marginTop: 8,
          }}
        >
          Crear Cuenta
        </Text>
        <Text style={{ color: "#666", textAlign: "center" }}>
          Completa los datos para registrarte
        </Text>
      </View>

      <TextInput
        label="Nombre completo"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={{ marginBottom: 12 }}
        left={<TextInput.Icon icon="account" />}
      />

      <TextInput
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ marginBottom: 12 }}
        left={<TextInput.Icon icon="email-outline" />}
      />

      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={{ marginBottom: 12 }}
        left={<TextInput.Icon icon="lock-outline" />}
      />

      <TextInput
        label="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        mode="outlined"
        secureTextEntry
        style={{ marginBottom: 12 }}
        left={<TextInput.Icon icon="lock-check-outline" />}
      />

      {error && (
        <HelperText type="error" style={{ color: "#B00020", marginBottom: 10 }}>
          {error}
        </HelperText>
      )}

      {success && (
        <HelperText type="info" style={{ color: "#2E7D32", marginBottom: 10 }}>
          {success}
        </HelperText>
      )}

      <Button
        mode="contained"
        onPress={handleSignup}
        loading={loading}
        disabled={loading}
        style={{
          marginTop: 10,
          backgroundColor: "#673AB7",
          borderRadius: 8,
          paddingVertical: 6,
        }}
      >
        {loading ? "Registrando..." : "Crear Cuenta"}
      </Button>

      <Button
        mode="text"
        onPress={() => navigation.goBack()}
        textColor="#673AB7"
        style={{ marginTop: 10 }}
      >
        ¿Ya tienes cuenta? Inicia sesión
      </Button>

      {loading && (
        <ActivityIndicator
          animating={true}
          size="small"
          color="#512DA8"
          style={{ marginTop: 16 }}
        />
      )}
    </ScrollView>
  </Surface>
);

}
