import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Appbar } from 'react-native-paper';
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

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'students', title: 'Estudiantes' },
    { key: 'categories', title: 'Categorías' },
  ]);

  // Pasamos el courseId y teacherId a las pestañas
  const StudentsTab = () => <StudentsListPage courseId={courseId} />;
  const CategoriesTab = () => <CategoriesListPage courseId={courseId} teacherId={teacherId} />;

  const renderScene = SceneMap({
    students: StudentsTab,
    categories: CategoriesTab,
  });

  return (
    <CategoryProvider>
      <GroupProvider>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title={courseName} />
        </Appbar.Header>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          renderTabBar={props => <TabBar {...props} />}
        />
      </GroupProvider>
    </CategoryProvider>
  );
};