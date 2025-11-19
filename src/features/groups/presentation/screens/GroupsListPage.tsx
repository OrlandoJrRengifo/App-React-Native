/**
 * @fileoverview Pantalla que muestra la lista de grupos de una categoría.
 */
import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, FAB, Portal, Text } from 'react-native-paper';
import { Group } from '../../domain/entities/Group';
import { GroupCard } from '../components/GroupCard';
import { GroupFormData, GroupFormDialog } from '../components/GroupFormDialog';
import { useGroups } from '../context/GroupContext';

interface GroupsListPageProps {
  categoryId: string;
  categoryName: string;
  maxGroupSize: number; // De la categoría
  teacherId: string; // ID del profesor dueño del curso
}

export const GroupsListPage = ({
  categoryId,
  categoryName,
  maxGroupSize,
  teacherId,
}: GroupsListPageProps) => {
  const { user } = useAuth();
  const { groups, loading, error, loadGroupsByCategory, createGroup, updateGroup, deleteGroup } =
    useGroups();

  const [formVisible, setFormVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | undefined>(undefined);
  const [groupToDelete, setGroupToDelete] = useState<Group | undefined>(undefined);

  // Verificar si el usuario actual es el profesor del curso
  const isTeacher = user?.id === teacherId;

  useEffect(() => {
    console.log('🎬 GroupsListPage useEffect ejecutándose');
    console.log('📝 categoryId:', categoryId);
    console.log('📝 categoryName:', categoryName);
    console.log('📝 maxGroupSize:', maxGroupSize);
    console.log('👤 teacherId:', teacherId);
    console.log('👨‍🏫 isTeacher:', isTeacher);
    loadGroupsByCategory(categoryId);
  }, [categoryId]);

  const openCreateForm = () => {
    setGroupToEdit(undefined);
    setFormVisible(true);
  };

  const openEditForm = (group: Group) => {
    setGroupToEdit(group);
    setFormVisible(true);
  };

  const openDeleteDialog = (group: Group) => {
    setGroupToDelete(group);
    setDeleteVisible(true);
  };

  const handleFormSubmit = async (data: GroupFormData) => {
    try {
      if (data.id) {
        // Editar grupo existente
        if (!groupToEdit) return;
        const updatedGroup = groupToEdit.copyWith({
          capacity: data.capacity,
        });
        await updateGroup(updatedGroup);
      } else {
        // Crear nuevo grupo
        await createGroup(categoryId, data.capacity);
      }
    } catch (e: any) {
      console.error('Error al guardar grupo:', e);
    }
    setFormVisible(false);
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete?.id) return;
    try {
      await deleteGroup(groupToDelete.id);
    } catch (e: any) {
      console.error('Error al eliminar grupo:', e);
    }
    setDeleteVisible(false);
  };

  console.log('🔍 Estado actual en GroupsListPage:');
  console.log('  - loading:', loading);
  console.log('  - error:', error);
  console.log('  - groups.length:', groups.length);

  if (loading && groups.length === 0) {
    console.log('🔄 Mostrando loading...');
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando grupos...</Text>
      </View>
    );
  }

  if (error) {
    console.log('❌ Mostrando error:', error);
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error}</Text>
        <Button
          mode="contained"
          onPress={() => loadGroupsByCategory(categoryId)}
          style={{ marginTop: 16 }}
        >
          Reintentar
        </Button>
      </View>
    );
  }

  if (groups.length === 0) {
    console.log('📭 Mostrando vista vacía (sin grupos)');
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium" style={styles.emptyTitle}>
          No hay grupos en esta categoría
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtitle}>
          {isTeacher
            ? 'Los grupos se crean automáticamente al crear la categoría.\nPuedes agregar más grupos manualmente.'
            : 'El profesor aún no ha creado grupos'}
        </Text>
        {isTeacher && (
          <Button mode="contained" onPress={openCreateForm} style={{ marginTop: 16 }}>
            Crear Primer Grupo
          </Button>
        )}
      </View>
    );
  }

  console.log('✅ Renderizando lista con', groups.length, 'grupos');
  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onEdit={isTeacher ? openEditForm : undefined}
            onDelete={isTeacher ? openDeleteDialog : undefined}
            isTeacher={isTeacher}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      {isTeacher && (
        <FAB icon="plus" style={styles.fab} onPress={openCreateForm} label="Nuevo Grupo" />
      )}

      <GroupFormDialog
        visible={formVisible}
        onDismiss={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
        group={groupToEdit}
        defaultCapacity={maxGroupSize}
      />

      <Portal>
        <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)}>
          <Dialog.Title>Eliminar Grupo</Dialog.Title>
          <Dialog.Content>
            <Text>¿Estás seguro de que deseas eliminar el Grupo {groupToDelete?.numeration}?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteVisible(false)}>Cancelar</Button>
            <Button onPress={handleDeleteConfirm} textColor="red">
              Eliminar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 80,
  },
  emptyTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
