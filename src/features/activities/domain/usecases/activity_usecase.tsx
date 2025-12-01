/**
 * @fileoverview Use Cases para actividades.
 */
import { Activity } from '../entities/activity';
import { IActivityRepository } from '../repositories/i_activity_repository';

export class ActivityUseCases {
  constructor(private repository: IActivityRepository) {
    console.log('ActivityUseCases: Initialized.');
  }

  /**
   * Crea una nueva actividad en una categoría.
   * @param categoryId - ID de la categoría
   * @param name - Nombre de la actividad
   * @returns La actividad creada o null si falla
   */
  async createActivity(categoryId: string, name: string): Promise<Activity | null> {
    console.log('-> ActivityUseCases: Creating activity.');
    return this.repository.createActivity(categoryId, name);
  }

  /**
   * Obtiene todas las actividades de una categoría.
   * @param categoryId - ID de la categoría
   * @returns Lista de actividades
   */
  async getActivitiesByCategory(categoryId: string): Promise<Activity[]> {
    console.log('-> ActivityUseCases: Getting activities by category.');
    return this.repository.getActivitiesByCategory(categoryId);
  }

  /**
   * Activa una actividad (cambia el estado activated a true).
   * @param activityId - ID de la actividad
   * @returns true si se activó correctamente, false en caso contrario
   */
  async activateActivity(activityId: string): Promise<boolean> {
    console.log('-> ActivityUseCases: Activating activity.');
    return this.repository.activateActivity(activityId);
  }

  /**
   * Actualiza el nombre de una actividad.
   * @param activityId - ID de la actividad
   * @param newName - Nuevo nombre
   * @returns true si se actualizó correctamente, false en caso contrario
   */
  async updateActivityName(activityId: string, newName: string): Promise<boolean> {
    console.log('-> ActivityUseCases: Updating activity name.');
    return this.repository.updateActivityName(activityId, newName);
  }

  /**
   * Elimina una actividad.
   * @param activityId - ID de la actividad
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  async deleteActivity(activityId: string): Promise<boolean> {
    console.log('-> ActivityUseCases: Deleting activity.');
    return this.repository.deleteActivity(activityId);
  }
}