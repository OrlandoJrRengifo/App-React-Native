import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import AuthFlow from "./src/AuthFlow";

import { DIProvider } from "./src/core/di/DIProvider";
import { AuthProvider } from "./src/features/auth/presentation/context/authContext";

import { CourseProvider } from "./src/features/courses/presentation/context/CourseContext";
import { UserCourseProvider } from "./src/features/user_courses/presentation/context/UserCourseContext";

import { darkTheme, lightTheme } from "./src/theme/theme";



export default function App() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;
  console.log("Current theme:", scheme);

  const navigationTheme = {
    ...(scheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outline,
      primary: theme.colors.primary,
      notification: theme.colors.error,
    },
  };

  return (

<PaperProvider theme={theme}>
  <DIProvider>
    <AuthProvider>
      <CourseProvider>
        <UserCourseProvider>
          <NavigationContainer theme={navigationTheme}>
            <AuthFlow />
          </NavigationContainer>
        </UserCourseProvider>
      </CourseProvider>
    </AuthProvider>
  </DIProvider>
</PaperProvider>


  );
}