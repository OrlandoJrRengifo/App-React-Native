/**
 * @fileoverview Context para manejar el estado de los grupos.
 */
import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Group } from '../../domain/entities/Group';
import { GroupUseCases } from '../../domain/usecases/GroupUseCases';

interface IGroupContext {
  groups: Group[];
  loading: boolean;
  error: string | null;

  loadGroupsByCategory: (categoryId: string) => Promise<void>;
  createGroup: (categoryId: string, capacity: number) => Promise<void>;
  updateGroup: (group: Group) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
}

const GroupContext = createContext<IGroupContext | undefined>(undefined);

interface GroupProviderProps {
  children: ReactNode;
}

export const GroupProvider = ({ children }: GroupProviderProps) => {
  const container = useDI();
  const useCases = container.resolve(TOKENS.GroupUseCases) as GroupUseCases;

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroupsByCategory = async (categoryId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📚 Cargando grupos de la categoría: ${categoryId}`);
      const fetchedGroups = await useCases.getGroupsByCategory(categoryId);
      // Ordenar por numeración
      fetchedGroups.sort((a, b) => a.numeration - b.numeration);
      setGroups(fetchedGroups);
      console.log(`✅ ${fetchedGroups.length} grupos cargados`);
    } catch (e: any) {
      const errorMsg = e.message || 'Error al cargar grupos';
      setError(errorMsg);
      console.error('❌ Error al cargar grupos:', e);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (categoryId: string, capacity: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`➕ Creando grupo con capacidad: ${capacity}`);
      const newGroup = await useCases.createGroup(categoryId, capacity);
      setGroups((prev) => [...prev, newGroup].sort((a, b) => a.numeration - b.numeration));
      console.log('✅ Grupo creado exitosamente');
    } catch (e: any) {
      const errorMsg = e.message || 'Error al crear grupo';
      setError(errorMsg);
      console.error('❌ Error al crear grupo:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (group: Group): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📝 Actualizando grupo: ${group.id}`);
      const updatedGroup = await useCases.updateGroup(group);
      setGroups((prev) =>
        prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
      );
      console.log('✅ Grupo actualizado exitosamente');
    } catch (e: any) {
      const errorMsg = e.message || 'Error al actualizar grupo';
      setError(errorMsg);
      console.error('❌ Error al actualizar grupo:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🗑️ Eliminando grupo: ${id}`);
      await useCases.deleteGroup(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      console.log('✅ Grupo eliminado exitosamente');
    } catch (e: any) {
      const errorMsg = e.message || 'Error al eliminar grupo';
      setError(errorMsg);
      console.error('❌ Error al eliminar grupo:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const value: IGroupContext = {
    groups,
    loading,
    error,
    loadGroupsByCategory,
    createGroup,
    updateGroup,
    deleteGroup,
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};

export const useGroups = (): IGroupContext => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
};
