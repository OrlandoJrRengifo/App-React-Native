/**
 * @fileoverview Card para mostrar un grupo con opciones de inscripción.
 */
import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import { useUserGroups } from '@/src/features/user_groups/presentation/context/UserGroupContext';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Dialog, IconButton, Menu, Portal, Text, useTheme } from 'react-native-paper';
import { Group } from '../../domain/entities/Group';

interface GroupCardProps {
  group: Group;
  categoryId: string;
  onEdit?: (group: Group) => void;
  onDelete?: (group: Group) => void;
  onViewMembers?: (group: Group) => void;
  isTeacher?: boolean;
  onEnrollmentChange?: () => void;
}

export const GroupCard = ({ 
  group, 
  categoryId,
  onEdit, 
  onDelete, 
  onViewMembers,
  isTeacher = false,
  onEnrollmentChange,
}: GroupCardProps) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { joinGroup, leaveGroup, getUserCurrentGroup, countGroupMembers, isGroupFull } = useUserGroups();

  const [menuVisible, setMenuVisible] = useState(false);
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    loadGroupStatus();
  }, [group.id]);

  const loadGroupStatus = async () => {
    if (!group.id || !user?.id) {
      setLoadingStatus(false);
      return;
    }

    try {
      setLoadingStatus(true);
      // Verificar si el usuario está inscrito
      const userGroup = await getUserCurrentGroup(user.id, categoryId);
      setIsEnrolled(userGroup?.groupId === group.id);

      // Obtener count actual
      const count = await countGroupMembers(group.id);
      setCurrentCount(count);

      // Verificar si está lleno
      const full = await isGroupFull(group.id);
      setIsFull(full);
    } catch (e) {
      console.error('Error loading group status:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user?.id || !group.id) return;

    try {
      setLoading(true);
      await joinGroup(user.id, group.id, categoryId);
      await loadGroupStatus();
      onEnrollmentChange?.();
    } catch (e: any) {
      alert(e.message || 'Error al inscribirse');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      await leaveGroup(user.id, categoryId);
      await loadGroupStatus();
      setLeaveDialogVisible(false);
      onEnrollmentChange?.();
    } catch (e: any) {
      alert(e.message || 'Error al salir del grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit?.(group);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDelete?.(group);
  };

  const handleViewMembers = () => {
    setMenuVisible(false);
    onViewMembers?.(group);
  };

  const showMenu = isTeacher && (onEdit != null || onDelete != null);
  const canJoin = !isTeacher && !isEnrolled && !isFull;
  const canLeave = !isTeacher && isEnrolled;

  // Mostrar placeholder mientras carga
  if (loadingStatus) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text variant="titleLarge" style={styles.title}>
                Grupo {group.numeration}
              </Text>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
              Cargando información...
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text variant="titleLarge" style={styles.title}>
                Grupo {group.numeration}
              </Text>
            </View>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              {showMenu && (
                <>
                  <Menu.Item onPress={handleEdit} title="Editar" leadingIcon="pencil" />
                  <Menu.Item onPress={handleDelete} title="Eliminar" leadingIcon="delete" />
                </>
              )}
              <Menu.Item onPress={handleViewMembers} title="Ver miembros" leadingIcon="account-group" />
            </Menu>
          </View>

          <View style={styles.infoRow}>
            <Chip 
              icon="account-multiple" 
              mode="outlined" 
              compact 
              style={[
                styles.chip,
                isFull && { backgroundColor: theme.colors.errorContainer }
              ]}
            >
              {currentCount} / {group.capacity}
            </Chip>
            {isFull && (
              <Chip 
                icon="alert-circle" 
                mode="flat" 
                compact 
                style={[styles.chip, { backgroundColor: theme.colors.errorContainer }]}
                textStyle={{ color: theme.colors.error }}
              >
                Lleno
              </Chip>
            )}
            {isEnrolled && (
              <Chip 
                icon="check-circle" 
                mode="flat" 
                compact 
                style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}
                textStyle={{ color: theme.colors.primary }}
              >
                Inscrito
              </Chip>
            )}
          </View>

          {/* Botones de acción para estudiantes */}
          {!isTeacher && (
            <View style={styles.actionRow}>
              {canJoin && (
                <Button 
                  mode="contained" 
                  onPress={handleJoinGroup}
                  loading={loading}
                  disabled={loading}
                  icon="account-plus"
                  style={styles.actionButton}
                >
                  Inscribirse
                </Button>
              )}
              {canLeave && (
                <Button 
                  mode="outlined" 
                  onPress={() => setLeaveDialogVisible(true)}
                  loading={loading}
                  disabled={loading}
                  icon="exit-to-app"
                  textColor={theme.colors.error}
                  style={styles.actionButton}
                >
                  Salir del grupo
                </Button>
              )}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Diálogo de confirmación para salir */}
      <Portal>
        <Dialog visible={leaveDialogVisible} onDismiss={() => setLeaveDialogVisible(false)}>
          <Dialog.Title>Salir del Grupo</Dialog.Title>
          <Dialog.Content>
            <Text>
              ¿Estás seguro de que deseas salir del Grupo {group.numeration}? 
              Podrás inscribirte a otro grupo después.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLeaveDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleLeaveGroup} textColor={theme.colors.error} loading={loading}>
              Salir
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  chip: {
    marginRight: 4,
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionRow: {
    marginTop: 12,
  },
  actionButton: {
    marginTop: 8,
  },
});
