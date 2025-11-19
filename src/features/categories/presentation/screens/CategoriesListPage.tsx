/**
 * @fileoverview Pantalla que muestra la lista de categorías de un curso.
 */
import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, FAB, Portal, Text } from 'react-native-paper';
import { Category } from '../../domain/entities/Category';
import { CategoryCard } from '../components/CategoryCard';
import { CategoryFormData, CategoryFormDialog } from '../components/CategoryFormDialog';
import { useCategories } from '../context/CategoryContext';
import { GroupsListPage } from '@/src/features/groups/presentation/screens/GroupsListPage';

interface CategoriesListPageProps {
  courseId: string;
  teacherId: string; // ID del profesor dueño del curso
}

export const CategoriesListPage = ({ courseId, teacherId }: CategoriesListPageProps) => {
  const { user } = useAuth();
  const { categories, loading, error, loadCategoriesByCourse, createCategory, updateCategory, deleteCategory } = useCategories();

  const [formVisible, setFormVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | undefined>(undefined);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);

  // Verificar si el usuario actual es el profesor del curso
  const isTeacher = user?.id === teacherId;

  useEffect(() => {
    console.log('🎬 CategoriesListPage useEffect ejecutándose');
    console.log('📝 courseId:', courseId);
    console.log('👤 teacherId:', teacherId);
    console.log('👨‍🏫 isTeacher:', isTeacher);
    console.log('📚 Llamando loadCategoriesByCourse...');
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
    console.log('📂 Categoría seleccionada:', category.name);
    setSelectedCategory(category);
  };

  const handleBackFromGroups = () => {
    setSelectedCategory(undefined);
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      if (data.id) {
        // Editar categoría existente
        if (!categoryToEdit) return;
        const updatedCategory = categoryToEdit.copyWith({
          name: data.name,
          groupingMethod: data.groupingMethod,
          maxGroupSize: data.maxGroupSize,
        });
        await updateCategory(updatedCategory);
      } else {
        // Crear nueva categoría
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

  // Logs de debugging
  console.log('🔍 Estado actual en CategoriesListPage:');
  console.log('  - loading:', loading);
  console.log('  - error:', error);
  console.log('  - categories.length:', categories.length);
  console.log('  - categories:', categories);

  if (loading && categories.length === 0) {
    console.log('🔄 Mostrando loading...');
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando categorías...</Text>
      </View>
    );
  }

  if (error) {
    console.log('❌ Mostrando error:', error);
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error}</Text>
        <Button mode="contained" onPress={() => loadCategoriesByCourse(courseId)} style={{ marginTop: 16 }}>
          Reintentar
        </Button>
      </View>
    );
  }

  if (categories.length === 0) {
    console.log('📭 Mostrando vista vacía (sin categorías)');
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium" style={styles.emptyTitle}>
          No hay categorías aún
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtitle}>
          {isTeacher
            ? 'Crea la primera categoría para este curso'
            : 'El profesor aún no ha creado categorías'}
        </Text>
        {isTeacher && (
          <Button mode="contained" onPress={openCreateForm} style={{ marginTop: 16 }}>
            Crear Primera Categoría
          </Button>
        )}
      </View>
    );
  }

  // Si hay una categoría seleccionada, mostrar la lista de grupos
  if (selectedCategory) {
    return (
      <View style={{ flex: 1 }}>
        <Button
          mode="text"
          icon="arrow-left"
          onPress={handleBackFromGroups}
          style={{ alignSelf: 'flex-start' }}
        >
          Volver a Categorías
        </Button>
        <GroupsListPage
          categoryId={selectedCategory.id!}
          categoryName={selectedCategory.name}
          maxGroupSize={selectedCategory.maxGroupSize}
          teacherId={teacherId}
        />
      </View>
    );
  }

  console.log('✅ Renderizando lista con', categories.length, 'categorías');
  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onEdit={isTeacher ? openEditForm : undefined}
            onDelete={isTeacher ? openDeleteDialog : undefined}
            onPress={handleCategoryPress} // Agregar manejador de presión
            isTeacher={isTeacher}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      {isTeacher && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={openCreateForm}
          label="Nueva Categoría"
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
