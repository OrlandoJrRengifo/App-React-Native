import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { ActivityProvider } from '../../../activities/presentation/context/activityContext';
import { ActivitiesListPage } from '../../../activities/presentation/screens/activities_page';
import { AssessmentProvider } from '../../../assessments/presentation/context/AssessmentContext';
import { CategoryProvider } from '../../../categories/presentation/context/CategoryContext';
import { GroupProvider } from '../../../groups/presentation/context/GroupContext';
import { GroupsListPage } from '../../../groups/presentation/screens/GroupsListPage';
import { UserGroupProvider } from '../../../user_groups/presentation/context/UserGroupContext';

// Definición de tipos para los parámetros de ruta
type CategoryDetailRouteParams = {
  CategoryDetail: {
    categoryId: string;
    categoryName: string;
    maxGroupSize: number;
    teacherId: string; // ID del profesor dueño del curso
  };
};

type CategoryDetailScreenRouteProp = RouteProp<CategoryDetailRouteParams, 'CategoryDetail'>;

export const CategoryDetailPage = () => {
  const navigation = useNavigation();
  const route = useRoute<CategoryDetailScreenRouteProp>();
  const { categoryId, categoryName, maxGroupSize, teacherId } = route.params;
  const theme = useTheme();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'groups', title: 'Grupos' },
    { key: 'activities', title: 'Actividades' },
  ]);

  // Pasamos los parámetros necesarios a las pestañas
  const GroupsTab = () => (
    <GroupsListPage
      categoryId={categoryId}
      categoryName={categoryName}
      maxGroupSize={maxGroupSize}
      teacherId={teacherId}
    />
  );
  
  // ActivitiesListPage usa useRoute() internamente, 
  // así que necesitamos que la navegación pase los parámetros correctamente
  const ActivitiesTab = () => <ActivitiesListPage />;

  const renderScene = SceneMap({
    groups: GroupsTab,
    activities: ActivitiesTab,
  });

  return (
    <CategoryProvider>
      <ActivityProvider>
        <AssessmentProvider>
          <GroupProvider>
            <UserGroupProvider>
              <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
                  <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
                  <Appbar.Content 
                    title={categoryName} 
                    titleStyle={{ color: '#fff', fontWeight: 'bold' }} 
                  />
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
            </UserGroupProvider>
          </GroupProvider>
        </AssessmentProvider>
      </ActivityProvider>
    </CategoryProvider>
  );
};