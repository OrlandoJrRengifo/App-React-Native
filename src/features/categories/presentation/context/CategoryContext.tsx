/**
 * @fileoverview Context para manejar el estado de las categorías.
 */
import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Category, GroupingMethod } from '../../domain/entities/Category';
import { CategoryUseCases } from '../../domain/usecases/CategoryUseCases';

interface ICategoryContext {
  categories: Category[];
  loading: boolean;
  error: string | null;

  loadCategoriesByCourse: (courseId: string) => Promise<void>;
  createCategory: (params: {
    courseId: string;
    name: string;
    groupingMethod: GroupingMethod;
    maxGroupSize: number;
  }) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const CategoryContext = createContext<ICategoryContext | undefined>(undefined);

interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider = ({ children }: CategoryProviderProps) => {
  const container = useDI();
  const useCases = container.resolve(TOKENS.CategoryUseCases) as CategoryUseCases;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategoriesByCourse = async (courseId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📚 Cargando categorías del curso: ${courseId}`);
      const fetchedCategories = await useCases.getCategoriesByCourse(courseId);
      setCategories(fetchedCategories);
      console.log(`✅ ${fetchedCategories.length} categorías cargadas`);
    } catch (e: any) {
      const errorMsg = e.message || 'Error al cargar categorías';
      setError(errorMsg);
      console.error('❌ Error al cargar categorías:', e);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (params: {
    courseId: string;
    name: string;
    groupingMethod: GroupingMethod;
    maxGroupSize: number;
  }): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`➕ Creando categoría: ${params.name}`);
      const newCategory = await useCases.createCategory(params);
      setCategories((prev) => [...prev, newCategory]);
      console.log('✅ Categoría creada exitosamente');
    } catch (e: any) {
      const errorMsg = e.message || 'Error al crear categoría';
      setError(errorMsg);
      console.error('❌ Error al crear categoría:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (category: Category): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📝 Actualizando categoría: ${category.id}`);
      const updatedCategory = await useCases.updateCategory(category);
      setCategories((prev) =>
        prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c))
      );
      console.log('✅ Categoría actualizada exitosamente');
    } catch (e: any) {
      const errorMsg = e.message || 'Error al actualizar categoría';
      setError(errorMsg);
      console.error('❌ Error al actualizar categoría:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🗑️ Eliminando categoría: ${id}`);
      await useCases.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      console.log('✅ Categoría eliminada exitosamente');
    } catch (e: any) {
      const errorMsg = e.message || 'Error al eliminar categoría';
      setError(errorMsg);
      console.error('❌ Error al eliminar categoría:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const value: ICategoryContext = {
    categories,
    loading,
    error,
    loadCategoriesByCourse,
    createCategory,
    updateCategory,
    deleteCategory,
  };

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
};

export const useCategories = (): ICategoryContext => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
