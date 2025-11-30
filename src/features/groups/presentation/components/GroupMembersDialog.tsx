/**
 * @fileoverview Componente modal para mostrar los miembros de un grupo.
 */
import { useDI } from '@/src/core/di/DIProvider';
import { FakeUserRepoToken } from '@/src/core/di/tokens';
import { FakeUser } from '@/src/features/fake_users/domain/entities/FakeUser';
import { IFakeUserRepository } from '@/src/features/fake_users/domain/repositories/IFakeUserRepository';
import { useUserGroups } from '@/src/features/user_groups/presentation/context/UserGroupContext';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, List, Modal, Portal, Text, useTheme } from 'react-native-paper';
import { Group } from '../../domain/entities/Group';

interface GroupMembersDialogProps {
  visible: boolean;
  group: Group | null;
  onDismiss: () => void;
}

export const GroupMembersDialog = ({ visible, group, onDismiss }: GroupMembersDialogProps) => {
  const theme = useTheme();
  const container = useDI();
  const fakeUserRepo = container.resolve<IFakeUserRepository>(FakeUserRepoToken);
  const { userGroups, loadGroupMembers, loading } = useUserGroups();

  const [members, setMembers] = useState<FakeUser[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (visible && group?.id) {
      fetchMembers();
    }
  }, [visible, group]);

  const fetchMembers = async () => {
    if (!group?.id) return;

    try {
      setLoadingMembers(true);
      await loadGroupMembers(group.id);
    } catch (e) {
      console.error('Error loading members:', e);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (userGroups.length > 0) {
      loadUserDetails();
    } else {
      setMembers([]);
    }
  }, [userGroups]);

  const loadUserDetails = async () => {
    try {
      const userIds = userGroups.map(ug => ug.userId);
      const usersPromises = userIds.map(id => fakeUserRepo.getUserByAuthId(id));
      const users = await Promise.all(usersPromises);
      setMembers(users.filter((u: FakeUser | null): u is FakeUser => u !== null));
    } catch (e) {
      console.error('Error loading user details:', e);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
      >
        <TouchableWithoutFeedback>
          <View>
            <Text variant="headlineSmall" style={styles.title}>
              Miembros del Grupo {group?.numeration}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {members.length} / {group?.capacity} miembros
            </Text>

            {(loading || loadingMembers) ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 16 }}>Cargando miembros...</Text>
              </View>
            ) : members.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No hay miembros en este grupo
                </Text>
              </View>
            ) : (
              <FlatList
                data={members}
                keyExtractor={(item) => item.id!}
                renderItem={({ item }) => (
                  <List.Item
                    title={item.name}
                    description={item.email}
                    left={() => (
                      <Avatar.Text 
                        size={40} 
                        label={getInitials(item.name)}
                        style={{ backgroundColor: theme.colors.primaryContainer }}
                      />
                    )}
                    style={styles.listItem}
                  />
                )}
                style={styles.list}
              />
            )}

            <Button mode="contained" onPress={onDismiss} style={styles.closeButton}>
              Cerrar
            </Button>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 16,
  },
  list: {
    maxHeight: 400,
  },
  listItem: {
    paddingVertical: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  closeButton: {
    marginTop: 16,
  },
});
