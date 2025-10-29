import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  View
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  HelperText,
  Snackbar,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../context/authContext";

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSnack, setShowSnack] = useState(false);

  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    const remember = await AsyncStorage.getItem("remember_me");
    if (remember === "true") {
      const savedEmail = await AsyncStorage.getItem("email");
      const savedPassword = await AsyncStorage.getItem("password");
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
        const success = await login(savedEmail.trim(), savedPassword);
        if (success) navigation.replace("CourseDashboard");
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor ingrese su correo y contraseña");
      return;
    }
    setLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        if (rememberMe) {
          await AsyncStorage.setItem("email", email.trim());
          await AsyncStorage.setItem("password", password);
          await AsyncStorage.setItem("remember_me", "true");
        } else {
          await AsyncStorage.removeItem("email");
          await AsyncStorage.removeItem("password");
          await AsyncStorage.setItem("remember_me", "false");
        }
        setShowSnack(true);
        setTimeout(() => navigation.replace("CourseDashboard"), 800);
      } else {
        setError("Usuario o contraseña incorrectos");
      }
    } catch {
      setError("Ocurrió un error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
  <Surface style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#ffffffff" }}>
    <View style={{ alignItems: "center", marginBottom: 40 }}>
      <MaterialCommunityIcons name="school" size={70} color="#673AB7" />
      <Text variant="headlineLarge" style={{ fontWeight: "bold", color: "#333", marginTop: 8 }}>
        Bienvenido
      </Text>
      <Text variant="bodyMedium" style={{ color: "#666", textAlign: "center" }}>
        Inicia sesión en tu cuenta
      </Text>
    </View>

    <TextInput
      label="Correo electrónico"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"
      left={<TextInput.Icon icon="email-outline" />}
      mode="outlined"
      style={{ marginBottom: 16 }}
    />

    <TextInput
      label="Contraseña"
      value={password}
      onChangeText={setPassword}
      secureTextEntry
      left={<TextInput.Icon icon="lock-outline" />}
      mode="outlined"
      style={{ marginBottom: 16 }}
    />

    {error && (
      <HelperText type="error" visible={true} style={{ marginBottom: 16, color: "#B00020" }}>
        {error}
      </HelperText>
    )}

    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
      <Checkbox
        status={rememberMe ? "checked" : "unchecked"}
        onPress={() => setRememberMe(!rememberMe)}
        color="#673AB7"
      />
      <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
        <Text style={{ color: "#333" }}>Recordar credenciales</Text>
      </TouchableOpacity>
    </View>

    <Button
      mode="contained"
      onPress={handleLogin}
      disabled={loading}
      style={{ borderRadius: 12, paddingVertical: 6, backgroundColor: "#673AB7" }}
    >
      {loading ? <ActivityIndicator animating={true} color="white" /> : "Iniciar sesión"}
    </Button>

    <Button
      mode="text"
      onPress={() => navigation.navigate("Signup")}
      textColor="#673AB7"
      style={{ marginTop: 16 }}
    >
      ¿No tienes cuenta? Regístrate
    </Button>

    <Snackbar
      visible={showSnack}
      onDismiss={() => setShowSnack(false)}
      duration={2000}
      style={{ backgroundColor: "#512DA8" }}
    >
      ¡Inicio de sesión exitoso!
    </Snackbar>
  </Surface>
);

}
