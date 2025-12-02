
import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import { Assessment } from '@/src/features/assessments/domain/entities/Assessment';
import { AssessmentUseCases } from '@/src/features/assessments/domain/usecases/AssessmentUseCases';
import { IGroupRepository } from '@/src/features/groups/domain/repositories/IGroupRepository';
import { UserGroupRepository } from '@/src/features/user_groups/domain/repositories/UserGroupRepository';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Activity } from '../../domain/entities/activity';
import { ActivityUseCases } from '../../domain/usecases/activity_usecase';

interface IActivityContext {
  activities: Activity[];
  loading: boolean;

  loadActivities: (categoryId: string) => Promise<void>;
  createActivity: (categoryId: string, name: string) => Promise<void>;
  activateActivity: (activityId: string, categoryId: string) => Promise<boolean>;
  updateActivityName: (activityId: string, newName: string) => Promise<boolean>;
  deleteActivity: (activityId: string) => Promise<boolean>;
}

const ActivityContext = createContext<IActivityContext | undefined>(undefined);

interface ActivityProviderProps {
  children: ReactNode;
}

export const ActivityProvider = ({ children }: ActivityProviderProps) => {
  const container = useDI();
  const useCase = container.resolve(TOKENS.ActivityUseCases) as ActivityUseCases;
  const assessmentUseCases = container.resolve(TOKENS.AssessmentUseCases) as AssessmentUseCases;
  const groupRepo = container.resolve(TOKENS.GroupRepo) as IGroupRepository;
  const userGroupRepo = container.resolve(TOKENS.UserGroupRepo) as UserGroupRepository;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const loadActivities = async (categoryId: string): Promise<void> => {
    setLoading(true);
    try {
      const result = await useCase.getActivitiesByCategory(categoryId);
      setActivities(result);
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (categoryId: string, name: string): Promise<void> => {
    const activity = await useCase.createActivity(categoryId, name);
    if (activity !== null) {
      setActivities((prev) => [...prev, activity]);
    } else {
      // El componente debe mostrar el snackbar usando este error
      throw new Error('No se pudo crear la actividad. Revisa la consola.');
    }
  };


  const activateActivity = async (activityId: string, categoryId: string): Promise<boolean> => {
    const success = await useCase.activateActivity(activityId);
    if (!success) return false;

    // Crear los assessments automáticamente
    try {
      // 1. Obtener todos los grupos de la categoría
      const groups = await groupRepo.getGroupsByCategory(categoryId);
      
      if (groups.length > 0) {
        // 2. Para cada grupo, obtener sus miembros y crear assessments
        for (const group of groups) {
          if (!group.id) continue;

          const userGroups = await userGroupRepo.getUserGroupsByGroupId(group.id);
          const memberIds = userGroups.map(ug => ug.userId);

          // 3. Crear assessments: cada miembro califica a los demás
          for (const raterId of memberIds) {
            for (const toRateId of memberIds) {
              // No crear assessment para que se califique a sí mismo
              if (raterId === toRateId) continue;

              const assessment = new Assessment({
                activityId: activityId,
                rater: raterId,
                toRate: toRateId,
                visibility: "private",
                punctuality: null,
                contributions: null,
                commitment: null,
                attitude: null,
              });

              await assessmentUseCases.createAssessment(assessment);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error creating assessments:", error);
      // No falla la activación si falla la creación de assessments
    }

    setActivities(prev =>
      prev.map(a => (a.id === activityId ? a.copyWith({ activated: true }) : a))
    );

    return true;
  };

  const updateActivityName = async (activityId: string, newName: string): Promise<boolean> => {
    const success = await useCase.updateActivityName(activityId, newName);
    if (!success) return false;

    setActivities(prev =>
      prev.map(a => (a.id === activityId ? a.copyWith({ name: newName }) : a))
    );

    return true;
  };


  const deleteActivity = async (activityId: string): Promise<boolean> => {
    const success = await useCase.deleteActivity(activityId);
    if (success) {
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
    }
    return success;
  };

  const value: IActivityContext = {
    activities,
    loading,
    loadActivities,
    createActivity,
    activateActivity,
    updateActivityName,
    deleteActivity,
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
};

export const useActivities = (): IActivityContext => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivityProvider');
  }
  return context;
};