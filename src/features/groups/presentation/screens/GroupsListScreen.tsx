/**
 * @fileoverview Screen wrapper para GroupsListPage con React Navigation.
 */
import { UserGroupProvider } from '@/src/features/user_groups/presentation/context/UserGroupContext';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { GroupProvider } from '../context/GroupContext';
import { GroupsListPage } from './GroupsListPage';

// Definición de tipos para los parámetros de ruta
type GroupsListRouteParams = {
  GroupsList: {
    categoryId: string;
    categoryName: string;
    maxGroupSize: number;
    teacherId: string;
    courseId: string;
    courseName: string;
  };
};

type GroupsListScreenRouteProp = RouteProp<GroupsListRouteParams, 'GroupsList'>;

export const GroupsListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<GroupsListScreenRouteProp>();
  const { categoryId, categoryName, maxGroupSize, teacherId, courseId, courseName } = route.params;
  const theme = useTheme();

  return (
    <UserGroupProvider>
      <GroupProvider>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
            <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
            <Appbar.Content title={categoryName} titleStyle={{ color: '#fff', fontWeight: 'bold' }} />
          </Appbar.Header>
          <GroupsListPage
            categoryId={categoryId}
            categoryName={categoryName}
            maxGroupSize={maxGroupSize}
            teacherId={teacherId}
          />
        </View>
      </GroupProvider>
    </UserGroupProvider>
  );
};
