import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { useAuth } from "./features/auth/presentation/context/authContext";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
// Importamos el CourseDashboard, asumiendo esta ruta
import { CourseDashboardScreen } from "./features/courses/presentation/screens/CourseDashboard";
import { CourseDetailPage } from "./features/courses/presentation/screens/CourseDetailPage";
import { GroupsListScreen } from "./features/groups/presentation/screens/GroupsListScreen";


const Stack = createStackNavigator();

export default function AuthFlow() {
  const { isLoggedIn, logout } = useAuth();

  // Componente que maneja la vista después del login
  function MainAppStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="CourseDashboard" 
          component={CourseDashboardScreen} 
        />
        <Stack.Screen 
          name="CourseDetail" 
          component={CourseDetailPage} 
        />
        <Stack.Screen 
          name="GroupsList" 
          component={GroupsListScreen} 
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="App" component={MainAppStack} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}