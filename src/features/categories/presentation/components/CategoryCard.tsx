/**
 * @fileoverview Card para mostrar una categoría.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Chip, IconButton, Menu, Text } from 'react-native-paper';
import { Category } from '../../domain/entities/Category';

interface CategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  isTeacher?: boolean;
}

export const CategoryCard = ({ category, onEdit, onDelete, isTeacher = false }: CategoryCardProps) => {
  const [menuVisible, setMenuVisible] = React.useState(false);

  const formattedDate = category.createdAt
    ? new Date(category.createdAt).toLocaleDateString()
    : 'Sin fecha';

  const groupingMethodLabel =
    category.groupingMethod === 'random' ? 'Aleatorio' : 'Auto-inscripción';

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit?.(category);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDelete?.(category);
  };

  const showMenu = isTeacher && onEdit != null && onDelete != null;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.title}>
              {category.name}
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
          <Chip icon="account-group" mode="outlined" compact style={styles.chip}>
            Max: {category.maxGroupSize} miembros
          </Chip>
          <Chip
            icon={category.groupingMethod === 'random' ? 'shuffle' : 'account-check'}
            mode="outlined"
            compact
            style={styles.chip}
          >
            {groupingMethodLabel}
          </Chip>
        </View>

        <Text variant="bodySmall" style={styles.date}>
          Creada: {formattedDate}
        </Text>
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
    fontWeight: '600',
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
  date: {
    marginTop: 4,
    opacity: 0.7,
  },
});
