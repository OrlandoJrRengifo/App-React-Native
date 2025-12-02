/**
 * @fileoverview Contrato del Repositorio de Actividades.
 */
import { Activity } from '../entities/activity';

export interface IActivityRepository {
  /**
   * Crea una nueva actividad en una categoría.
   * @param categoryId - ID de la categoría
   * @param name - Nombre de la actividad
   * @returns La actividad creada o null si falla
   */
  createActivity(categoryId: string, name: string): Promise<Activity | null>;

  /**
   * Obtiene todas las actividades de una categoría.
   * @param categoryId - ID de la categoría
   * @returns Lista de actividades
   */
  getActivitiesByCategory(categoryId: string): Promise<Activity[]>;

  /**
   * Activa una actividad (cambia el estado activated a true).
   * @param activityId - ID de la actividad
   * @returns true si se activó correctamente, false en caso contrario
   */
  activateActivity(activityId: string): Promise<boolean>;

  /**
   * Actualiza el nombre de una actividad.
   * @param activityId - ID de la actividad
   * @param newName - Nuevo nombre
   * @returns true si se actualizó correctamente, false en caso contrario
   */
  updateActivityName(activityId: string, newName: string): Promise<boolean>;

  /**
   * Elimina una actividad.
   * @param activityId - ID de la actividad
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  deleteActivity(activityId: string): Promise<boolean>;
}