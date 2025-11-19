/**
 * @fileoverview Interfaz del repositorio de UserGroup.
 */
import { UserGroup } from '../entities/UserGroup';

export abstract class UserGroupRepository {
  /**
   * Obtiene todas las inscripciones de un grupo específico.
   */
  abstract getUserGroupsByGroupId(groupId: string): Promise<UserGroup[]>;

  /**
   * Obtiene la inscripción de un usuario en una categoría específica.
   * Retorna null si el usuario no está inscrito en ningún grupo de esa categoría.
   */
  abstract getUserGroupByCategoryId(userId: string, categoryId: string): Promise<UserGroup | null>;

  /**
   * Obtiene el grupo al que está inscrito un usuario en una categoría.
   */
  abstract getUserGroupByUserIdAndGroupId(userId: string, groupId: string): Promise<UserGroup | null>;

  /**
   * Crea una nueva inscripción de usuario a un grupo.
   */
  abstract createUserGroup(userGroup: UserGroup): Promise<UserGroup>;

  /**
   * Elimina la inscripción de un usuario de un grupo.
   */
  abstract deleteUserGroup(id: string): Promise<void>;

  /**
   * Cuenta cuántos usuarios hay en un grupo.
   */
  abstract countUsersByGroupId(groupId: string): Promise<number>;
}
