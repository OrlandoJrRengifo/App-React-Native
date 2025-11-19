import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { CategoryProvider } from '../../../categories/presentation/context/CategoryContext';
import { CategoriesListPage } from '../../../categories/presentation/screens/CategoriesListPage';
import { GroupProvider } from '../../../groups/presentation/context/GroupContext';
import { StudentsListPage } from './StudentsListPage';

// Definición de tipos para los parámetros de ruta
type CourseDetailRouteParams = {
  CourseDetail: {
    courseId: string;
    courseName: string;
    teacherId: string; // ID del profesor dueño del curso
  };
};

type CourseDetailScreenRouteProp = RouteProp<CourseDetailRouteParams, 'CourseDetail'>;

export const CourseDetailPage = () => {
  const navigation = useNavigation();
  const route = useRoute<CourseDetailScreenRouteProp>();
  const { courseId, courseName, teacherId } = route.params;
  const theme = useTheme();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'students', title: 'Estudiantes' },
    { key: 'categories', title: 'Categorías' },
  ]);

  // Pasamos el courseId y teacherId a las pestañas
  const StudentsTab = () => <StudentsListPage courseId={courseId} />;
  const CategoriesTab = () => <CategoriesListPage courseId={courseId} courseName={courseName} teacherId={teacherId} />;

  const renderScene = SceneMap({
    students: StudentsTab,
    categories: CategoriesTab,
  });

  return (
    <CategoryProvider>
      <GroupProvider>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
            <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
            <Appbar.Content title={courseName} titleStyle={{ color: '#fff', fontWeight: 'bold' }} />
          </Appbar.Header>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            renderTabBar={props => (
              <TabBar 
                {...props} 
                indicatorStyle={{ backgroundColor: theme.colors.primary }}
                style={{ backgroundColor: theme.colors.surface }}
                activeColor={theme.colors.primary}
                inactiveColor={theme.colors.onSurfaceVariant}
              />
            )}
          />
        </View>
      </GroupProvider>
    </CategoryProvider>
  );
};