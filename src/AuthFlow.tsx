import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { AssessmentProvider } from "./features/assessments/presentation/context/AssessmentContext";
import { AssessmentListScreen } from "./features/assessments/presentation/screens/AssessmentListScreen";
import { AssessmentsStatsScreen } from "./features/assessments/presentation/screens/AssessmentsStatsScreen";
import { useAuth } from "./features/auth/presentation/context/authContext";
import LoginScreen from "./features/auth/presentation/screens/LoginScreen";
import SignupScreen from "./features/auth/presentation/screens/SignupScreen";
import { CategoryDetailPage } from "./features/categories/presentation/screens/CategoryTabsPage";
import { CourseDashboardScreen } from "./features/courses/presentation/screens/CourseDashboard";
import { CourseDetailPage } from "./features/courses/presentation/screens/CourseDetailPage";
import { GroupsListScreen } from "./features/groups/presentation/screens/GroupsListScreen";

const Stack = createStackNavigator();

export default function AuthFlow() {
  const { isLoggedIn, logout } = useAuth();

  // Componente que maneja la vista después del login
  function MainAppStack() {
    return (
      <AssessmentProvider>
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
            name="CategoryDetail" 
            component={CategoryDetailPage} 
          />
          <Stack.Screen 
            name="GroupsList" 
            component={GroupsListScreen} 
          />
          <Stack.Screen 
            name="AssessmentList" 
            component={AssessmentListScreen}
            options={{ headerShown: true, title: 'Evaluar Compañeros' }}
          />
          <Stack.Screen 
            name="AssessmentStats" 
            component={AssessmentsStatsScreen}
            options={{ headerShown: true, title: 'Estadísticas' }}
          />
        </Stack.Navigator>
      </AssessmentProvider>
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