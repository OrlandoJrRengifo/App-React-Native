import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { StudentsListPage } from './StudentsListPage';
// import { CategoriesPage } from '../../../categories/ui/pages/CategoriesPage'; // (Aún no migrada)

// Placeholder para la pestaña de Categorías
const CategoriesPlaceholder = () => <View style={{ flex: 1, backgroundColor: '#f0f0f0' }} />;

// Definición de tipos para los parámetros de ruta
type CourseDetailRouteParams = {
  CourseDetail: {
    courseId: string;
    courseName: string;
  };
};

type CourseDetailScreenRouteProp = RouteProp<CourseDetailRouteParams, 'CourseDetail'>;

export const CourseDetailPage = () => {
  const navigation = useNavigation();
  const route = useRoute<CourseDetailScreenRouteProp>();
  const { courseId, courseName } = route.params;

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'students', title: 'Estudiantes' },
    { key: 'categories', title: 'Categorías' },
  ]);

  // Pasamos el courseId a la pestaña de Estudiantes
  const StudentsTab = () => <StudentsListPage courseId={courseId} />;

  const renderScene = SceneMap({
    students: StudentsTab,
    categories: CategoriesPlaceholder, // Reemplazar con <CategoriesPage courseId={courseId} /> cuando se migre
  });

  return (
    <>
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
    </>
  );
};