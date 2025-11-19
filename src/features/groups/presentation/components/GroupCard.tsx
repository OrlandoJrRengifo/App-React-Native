/**
 * @fileoverview Card para mostrar un grupo.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Chip, IconButton, Menu, Text } from 'react-native-paper';
import { Group } from '../../domain/entities/Group';

interface GroupCardProps {
  group: Group;
  onEdit?: (group: Group) => void;
  onDelete?: (group: Group) => void;
  isTeacher?: boolean;
}

export const GroupCard = ({ group, onEdit, onDelete, isTeacher = false }: GroupCardProps) => {
  const [menuVisible, setMenuVisible] = React.useState(false);

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit?.(group);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDelete?.(group);
  };

  const showMenu = isTeacher && onEdit != null && onDelete != null;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleLarge" style={styles.title}>
              Grupo {group.numeration}
            </Text>
          </View>
          {showMenu && (
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
              <Menu.Item onPress={handleEdit} title="Editar" />
              <Menu.Item onPress={handleDelete} title="Eliminar" />
            </Menu>
          )}
        </View>

        <View style={styles.infoRow}>
          <Chip icon="account-multiple" mode="outlined" compact style={styles.chip}>
            Capacidad: {group.capacity}
          </Chip>
        </View>
      </Card.Content>
    </Card>
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
});
