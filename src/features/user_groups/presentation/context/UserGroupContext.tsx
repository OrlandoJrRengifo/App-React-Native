/**
 * @fileoverview Context para manejar el estado de UserGroups.
 */
import { useDI } from '@/src/core/di/DIProvider';
import { UserGroupUseCasesToken } from '@/src/core/di/tokens';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { UserGroup } from '../../domain/entities/UserGroup';
import { UserGroupUseCases } from '../../domain/usecases/UserGroupUseCases';

interface UserGroupContextValue {
  userGroups: UserGroup[];
  loading: boolean;
  error: string | null;
  loadGroupMembers: (groupId: string) => Promise<void>;
  joinGroup: (userId: string, groupId: string, categoryId: string) => Promise<void>;
  leaveGroup: (userId: string, categoryId: string) => Promise<void>;
  getUserCurrentGroup: (userId: string, categoryId: string) => Promise<UserGroup | null>;
  countGroupMembers: (groupId: string) => Promise<number>;
  isGroupFull: (groupId: string) => Promise<boolean>;
}

const UserGroupContext = createContext<UserGroupContextValue | undefined>(undefined);

export const UserGroupProvider = ({ children }: { children: ReactNode }) => {
  const container = useDI();
  const userGroupUseCases = container.resolve<UserGroupUseCases>(UserGroupUseCasesToken);

  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroupMembers = async (groupId: string) => {
    try {
      setLoading(true);
      setError(null);
      const members = await userGroupUseCases.getGroupMembers(groupId);
      setUserGroups(members);
    } catch (e: any) {
      setError(e.message || 'Error al cargar miembros');
      console.error('Error loadGroupMembers:', e);
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (userId: string, groupId: string, categoryId: string) => {
    try {
      setLoading(true);
      setError(null);
      await userGroupUseCases.joinGroup(userId, groupId, categoryId);
    } catch (e: any) {
      setError(e.message || 'Error al inscribirse');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const leaveGroup = async (userId: string, categoryId: string) => {
    try {
      setLoading(true);
      setError(null);
      await userGroupUseCases.leaveGroup(userId, categoryId);
    } catch (e: any) {
      setError(e.message || 'Error al salir del grupo');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const getUserCurrentGroup = async (userId: string, categoryId: string): Promise<UserGroup | null> => {
    try {
      return await userGroupUseCases.getUserCurrentGroup(userId, categoryId);
    } catch (e: any) {
      console.error('Error getUserCurrentGroup:', e);
      return null;
    }
  };

  const countGroupMembers = async (groupId: string): Promise<number> => {
    try {
      return await userGroupUseCases.countGroupMembers(groupId);
    } catch (e: any) {
      console.error('Error countGroupMembers:', e);
      return 0;
    }
  };

  const isGroupFull = async (groupId: string): Promise<boolean> => {
    try {
      return await userGroupUseCases.isGroupFull(groupId);
    } catch (e: any) {
      console.error('Error isGroupFull:', e);
      return false; // En caso de error, asumir que NO está lleno
    }
  };

  return (
    <UserGroupContext.Provider
      value={{
        userGroups,
        loading,
        error,
        loadGroupMembers,
        joinGroup,
        leaveGroup,
        getUserCurrentGroup,
        countGroupMembers,
        isGroupFull,
      }}
    >
      {children}
    </UserGroupContext.Provider>
  );
};

export const useUserGroups = (): UserGroupContextValue => {
  const context = useContext(UserGroupContext);
  if (!context) {
    throw new Error('useUserGroups debe usarse dentro de un UserGroupProvider');
  }
  return context;
};
