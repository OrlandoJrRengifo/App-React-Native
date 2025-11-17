import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useAuth } from "./features/auth/presentation/context/authContext";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
// Importamos el CourseDashboard, asumiendo esta ruta
import { CourseDashboardScreen } from "./features/courses/presentation/screens/CourseDashboard";


const Stack = createStackNavigator();

export default function AuthFlow() {
  const { isLoggedIn, logout } = useAuth();

  // Componente que maneja la vista después del login
  function MainAppStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          // Puedes configurar un Appbar aquí si no lo haces en el Dashboard
        }}
      >
        {/* La pantalla principal después del login es el Dashboard de Cursos */}
        <Stack.Screen 
          name="CourseDashboard" 
          component={CourseDashboardScreen} 
        />
        {/* Aquí irían otras pantallas relacionadas con cursos, si las hubiera (ej: detalle de curso) */}
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        // Si está logueado, ve al flujo principal de la aplicación (Dashboard)
        <Stack.Screen name="App" component={MainAppStack} />
      ) : (
        // Si no está logueado, ve a Login/Signup
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}