import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, FAB, Portal, Text } from 'react-native-paper';
import { Category } from '../../domain/entities/Category';
import { CategoryCard } from '../components/CategoryCard';
import { CategoryFormData, CategoryFormDialog } from '../components/CategoryFormDialog';
import { useCategories } from '../context/CategoryContext';

interface CategoriesListPageProps {
  courseId: string;
  courseName: string;
  teacherId: string;
}

export const CategoriesListPage = ({ courseId, courseName, teacherId }: CategoriesListPageProps) => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { categories, loading, error, loadCategoriesByCourse, createCategory, updateCategory, deleteCategory } = useCategories();

  const [formVisible, setFormVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | undefined>(undefined);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | undefined>(undefined);

  const isTeacher = user?.id === teacherId;

  useEffect(() => {
    loadCategoriesByCourse(courseId);
  }, [courseId]);

  const openCreateForm = () => {
    setCategoryToEdit(undefined);
    setFormVisible(true);
  };

  const openEditForm = (category: Category) => {
    setCategoryToEdit(category);
    setFormVisible(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteVisible(true);
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('CategoryDetail', {
      categoryId: category.id,
      categoryName: category.name,
      maxGroupSize: category.maxGroupSize,
      teacherId,
      courseId,
      courseName,
    });
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      if (data.id) {
        if (!categoryToEdit) return;
        const updatedCategory = categoryToEdit.copyWith({ name: data.name });
        await updateCategory(updatedCategory);
      } else {
        await createCategory({
          courseId,
          name: data.name,
          groupingMethod: data.groupingMethod,
          maxGroupSize: data.maxGroupSize,
        });
      }
    } catch (e: any) {
      console.error('Error al guardar categoría:', e);
    }
    setFormVisible(false);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete?.id) return;
    try {
      await deleteCategory(categoryToDelete.id);
    } catch (e: any) {
      console.error('Error al eliminar categoría:', e);
    }
    setDeleteVisible(false);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16 }}>Cargando categorías...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={{ color: 'red' }}>{error}</Text>
          <Button mode="contained" onPress={() => loadCategoriesByCourse(courseId)} style={{ marginTop: 16 }}>
            Reintentar
          </Button>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="titleMedium" style={styles.emptyTitle}>
            No hay categorías aún
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            {isTeacher
              ? 'Crea la primera categoría para este curso'
              : 'El profesor aún no ha creado categorías'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              onEdit={isTeacher ? openEditForm : undefined}
              onDelete={isTeacher ? openDeleteDialog : undefined}
              onPress={handleCategoryPress}
              isTeacher={isTeacher}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {isTeacher && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={openCreateForm}
          label={categories.length === 0 ? 'Crear Primera Categoría' : 'Nueva Categoría'}
        />
      )}

      <CategoryFormDialog
        visible={formVisible}
        onDismiss={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
        category={categoryToEdit}
      />

      <Portal>
        <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)}>
          <Dialog.Title>Eliminar Categoría</Dialog.Title>
          <Dialog.Content>
            <Text>
              ¿Estás seguro de que deseas eliminar la categoría "{categoryToDelete?.name}"?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteVisible(false)}>Cancelar</Button>
            <Button onPress={handleDeleteConfirm} textColor="red">Eliminar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  listContent: { paddingVertical: 8, paddingBottom: 80 },
  emptyTitle: { marginBottom: 8, fontWeight: '600' },
  emptySubtitle: { textAlign: 'center', opacity: 0.7 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});
