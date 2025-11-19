/**
 * @fileoverview Screen wrapper para GroupsListPage con React Navigation.
 */
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Appbar } from 'react-native-paper';
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

  return (
    <GroupProvider>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Categoría: ${categoryName}`} />
      </Appbar.Header>
      <GroupsListPage
        categoryId={categoryId}
        categoryName={categoryName}
        maxGroupSize={maxGroupSize}
        teacherId={teacherId}
      />
    </GroupProvider>
  );
};
