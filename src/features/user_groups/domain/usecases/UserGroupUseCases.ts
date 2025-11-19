/**
 * @fileoverview Casos de uso para UserGroup.
 */
import { GroupRepository } from '@/src/features/groups/domain/repositories/GroupRepository';
import { UserGroup } from '../entities/UserGroup';
import { UserGroupRepository } from '../repositories/UserGroupRepository';

export class UserGroupUseCases {
  constructor(
    private userGroupRepository: UserGroupRepository,
    private groupRepository: GroupRepository
  ) {}

  /**
   * Inscribe un usuario a un grupo.
   * Valida que:
   * - El usuario no esté ya inscrito en otro grupo de la misma categoría
   * - El grupo no esté lleno
   */
  async joinGroup(userId: string, groupId: string, categoryId: string): Promise<UserGroup> {
    // Verificar si ya está inscrito en otro grupo de la categoría
    const existingEnrollment = await this.userGroupRepository.getUserGroupByCategoryId(
      userId,
      categoryId
    );

    if (existingEnrollment) {
      throw new Error('Ya estás inscrito en un grupo de esta categoría');
    }

    // Verificar que el grupo no esté lleno
    const group = await this.groupRepository.getGroupById(groupId);
    if (!group) {
      throw new Error('Grupo no encontrado');
    }

    const currentCount = await this.userGroupRepository.countUsersByGroupId(groupId);
    if (currentCount >= group.capacity) {
      throw new Error('El grupo está lleno');
    }

    // Crear la inscripción
    const userGroup = new UserGroup({
      userId,
      groupId,
    });

    return this.userGroupRepository.createUserGroup(userGroup);
  }

  /**
   * Desins cribe un usuario de un grupo.
   */
  async leaveGroup(userId: string, categoryId: string): Promise<void> {
    const userGroup = await this.userGroupRepository.getUserGroupByCategoryId(userId, categoryId);
    if (!userGroup || !userGroup.id) {
      throw new Error('No estás inscrito en ningún grupo de esta categoría');
    }

    await this.userGroupRepository.deleteUserGroup(userGroup.id);
  }

  /**
   * Obtiene todos los miembros de un grupo.
   */
  async getGroupMembers(groupId: string): Promise<UserGroup[]> {
    return this.userGroupRepository.getUserGroupsByGroupId(groupId);
  }

  /**
   * Obtiene el grupo actual del usuario en una categoría.
   */
  async getUserCurrentGroup(userId: string, categoryId: string): Promise<UserGroup | null> {
    return this.userGroupRepository.getUserGroupByCategoryId(userId, categoryId);
  }

  /**
   * Cuenta cuántos miembros tiene un grupo.
   */
  async countGroupMembers(groupId: string): Promise<number> {
    return this.userGroupRepository.countUsersByGroupId(groupId);
  }

  /**
   * Verifica si un grupo está lleno.
   */
  async isGroupFull(groupId: string): Promise<boolean> {
    const group = await this.groupRepository.getGroupById(groupId);
    if (!group) return true;

    const currentCount = await this.userGroupRepository.countUsersByGroupId(groupId);
    return currentCount >= group.capacity;
  }
}
