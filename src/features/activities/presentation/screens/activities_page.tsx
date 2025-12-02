import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import { useGroups } from '@/src/features/groups/presentation/context/GroupContext';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  FAB,
  IconButton,
  Portal,
  RadioButton,
  Snackbar,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { Activity } from '../../domain/entities/activity';
import { useActivities } from '../context/activityContext';

type ActivitiesListRouteParams = {
  ActivitiesList: {
    categoryId: string;
    categoryName?: string;
    teacherId?: string;
  };
};

type ActivitiesListScreenRouteProp = RouteProp<ActivitiesListRouteParams, 'ActivitiesList'>;

export const ActivitiesListPage = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ActivitiesListScreenRouteProp>();
  const { categoryId, teacherId } = route.params;
  const theme = useTheme();

  const { user } = useAuth();
  const { activities, loading, loadActivities, createActivity, activateActivity, updateActivityName, deleteActivity } = useActivities();
  const { groups, loadGroupsByCategory } = useGroups();

  const [isOwner, setIsOwner] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [activateDialogVisible, setActivateDialogVisible] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | undefined>(undefined);
  const [activityToDelete, setActivityToDelete] = useState<Activity | undefined>(undefined);
  const [activityToActivate, setActivityToActivate] = useState<Activity | undefined>(undefined);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [activityName, setActivityName] = useState('');

  useEffect(() => {
    loadActivities(categoryId);
    setIsOwner(user?.id === teacherId);
  }, [categoryId]);

  const openCreateForm = () => {
    setActivityName('');
    setFormVisible(true);
  };

  const openEditForm = (activity: Activity) => {
    setActivityToEdit(activity);
    setActivityName(activity.name);
    setEditFormVisible(true);
  };

  const openDeleteDialog = (activity: Activity) => {
    setActivityToDelete(activity);
    setDeleteVisible(true);
  };

  const openActivateDialog = (activity: Activity) => {
    if (activity.activated) {
      setSnackbarMessage('La actividad ya está activada');
      return;
    }
    if (!isOwner) {
      setSnackbarMessage('Solo el dueño puede activar');
      return;
    }
    setActivityToActivate(activity);
    setSelectedTime(null);
    setVisibility('public');
    setActivateDialogVisible(true);
  };

  const handleCreateSubmit = async () => {
    if (!activityName.trim()) {
      setSnackbarMessage('Por favor ingresa un nombre para la actividad');
      return;
    }
    try {
      await createActivity(categoryId, activityName.trim());
      setSnackbarMessage(`Actividad '${activityName}' creada`);
      setFormVisible(false);
    } catch (e: any) {
      setSnackbarMessage(e.message || 'Error al crear actividad');
    }
  };

  const handleEditSubmit = async () => {
    if (!activityToEdit?.id || !activityName.trim()) return;
    if (activityName.trim() === activityToEdit.name) {
      setEditFormVisible(false);
      return;
    }
    try {
      const success = await updateActivityName(activityToEdit.id, activityName.trim());
      if (success) {
        setSnackbarMessage(`Nombre actualizado a '${activityName}'`);
        setEditFormVisible(false);
      } else {
        setSnackbarMessage('Error al actualizar nombre');
      }
    } catch (e: any) {
      setSnackbarMessage(e.message || 'Error al actualizar nombre');
    }
  };

  const handleActivateConfirm = async () => {
    if (!activityToActivate?.id) return;
    try {
      const activated = await activateActivity(activityToActivate.id, categoryId);
      if (!activated) {
        setSnackbarMessage('No se pudo activar la actividad');
        return;
      }
      setSnackbarMessage('Actividad activada exitosamente');
      setActivateDialogVisible(false);
    } catch (e: any) {
      setSnackbarMessage(e.message || 'Error al activar actividad');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activityToDelete?.id) return;
    try {
      const success = await deleteActivity(activityToDelete.id);
      if (success) {
        setSnackbarMessage(`Actividad '${activityToDelete.name}' eliminada`);
      } else {
        setSnackbarMessage('Error al eliminar actividad');
      }
    } catch (e: any) {
      setSnackbarMessage(e.message || 'Error al eliminar actividad');
    }
    setDeleteVisible(false);
  };

  const renderActionButtons = (activity: Activity) => {
    if (isOwner) {
      return (
        <View style={styles.actionButtons}>
          <IconButton icon="pencil" iconColor={theme.colors.primary} size={20} onPress={() => openEditForm(activity)} />
          <IconButton icon="check-circle" iconColor={activity.activated ? theme.colors.primary : theme.colors.outline} size={20} onPress={() => openActivateDialog(activity)} />
          <IconButton icon="delete" iconColor={theme.colors.error} size={20} onPress={() => openDeleteDialog(activity)} />
        </View>
      );
    } else {
      return <IconButton icon="check-circle" iconColor={activity.activated ? theme.colors.primary : theme.colors.outline} size={24} />;
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16 }}>Cargando actividades...</Text>
        </View>
      ) : activities.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="titleMedium" style={styles.emptyTitle}>No hay actividades creadas</Text>
        </View>
      ) : (
        <FlatList
          data={activities.filter(a=> isOwner || a.activated)}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <Card style={styles.card} onPress={() => setSnackbarMessage('Funcionalidad de assessments en desarrollo')}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text variant="titleMedium" style={styles.cardTitle}>{item.name}</Text>
                    <Text variant="bodySmall" style={styles.cardSubtitle}>{item.activated ? 'Activada' : 'Inactiva'}</Text>
                  </View>
                  {renderActionButtons(item)}
                </View>
              </Card.Content>
            </Card>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Botón único para crear actividad */}
      {isOwner && (
        <FAB icon="plus" style={styles.fab} onPress={openCreateForm} label="Nueva Actividad" />
      )}

      {/* Diálogos */}
      <Portal>
        {/* Crear */}
        <Dialog visible={formVisible} onDismiss={() => setFormVisible(false)}>
          <Dialog.Title>Crear actividad</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={activityName} onChangeText={setActivityName} mode="outlined" style={styles.input} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setFormVisible(false)}>Cancelar</Button>
            <Button onPress={handleCreateSubmit} mode="contained">Crear</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Editar */}
        <Dialog visible={editFormVisible} onDismiss={() => setEditFormVisible(false)}>
          <Dialog.Title>Editar actividad</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={activityName} onChangeText={setActivityName} mode="outlined" style={styles.input} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditFormVisible(false)}>Cancelar</Button>
            <Button onPress={handleEditSubmit} mode="contained">Actualizar</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Activar */}
        <Dialog visible={activateDialogVisible} onDismiss={() => setActivateDialogVisible(false)}>
          <Dialog.Title>Configurar actividad</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Button icon="clock-outline" mode="outlined" onPress={() => setSnackbarMessage('Selector de hora en desarrollo')} style={styles.input}>
                {selectedTime ? `Hora: ${selectedTime}` : 'Seleccionar hora límite'}
              </Button>
              <Text style={styles.sectionTitle}>Visibilidad</Text>
              <RadioButton.Group onValueChange={(v) => setVisibility(v as 'public' | 'private')} value={visibility}>
                <View style={styles.radioItem}><RadioButton value="public" /><Text style={styles.radioLabel}>Public</Text></View>
                <View style={styles.radioItem}><RadioButton value="private" /><Text style={styles.radioLabel}>Private</Text></View>
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setActivateDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleActivateConfirm} mode="contained">Activar</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Eliminar */}
        <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)}>
          <Dialog.Title>Eliminar actividad</Dialog.Title>
          <Dialog.Content>
            <Text>¿Deseas eliminar '{activityToDelete?.name}'?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteVisible(false)}>Cancelar</Button>
            <Button onPress={handleDeleteConfirm} textColor={theme.colors.error}>Eliminar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar */}
      <Snackbar visible={!!snackbarMessage} onDismiss={() => setSnackbarMessage(null)} duration={3000} style={{ backgroundColor: theme.colors.primary }}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  listContent: { paddingVertical: 8, paddingBottom: 80 },
  emptyTitle: { marginBottom: 8, fontWeight: '600' },
  card: { marginHorizontal: 16, marginVertical: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontWeight: '600' },
  cardSubtitle: { marginTop: 4, opacity: 0.7 },
  actionButtons: { flexDirection: 'row', marginLeft: 8 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  input: { marginBottom: 16 },
  scrollContent: { paddingHorizontal: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  radioItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  radioLabel: { fontSize: 16 },
});
