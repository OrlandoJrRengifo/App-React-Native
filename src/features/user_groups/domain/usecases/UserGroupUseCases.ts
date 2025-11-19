import { GroupRepository } from '@/src/features/groups/domain/repositories/GroupRepository';
import { UserGroup } from '../entities/UserGroup';
import { UserGroupRepository } from '../repositories/UserGroupRepository';

export class UserGroupUseCases {
  constructor(
    private userGroupRepository: UserGroupRepository,
    private groupRepository: GroupRepository
  ) {}

  async joinGroup(userId: string, groupId: string, categoryId: string): Promise<UserGroup> {
    const existingEnrollment = await this.userGroupRepository.getUserGroupByCategoryId(
      userId,
      categoryId
    );

    if (existingEnrollment) {
      throw new Error('Ya estás inscrito en un grupo de esta categoría');
    }

    const group = await this.groupRepository.getGroupById(groupId);
    if (!group) {
      throw new Error('Grupo no encontrado');
    }

    const currentCount = await this.userGroupRepository.countUsersByGroupId(groupId);
    if (currentCount >= group.capacity) {
      throw new Error('El grupo está lleno');
    }

    const userGroup = new UserGroup({
      userId,
      groupId,
    });

    return this.userGroupRepository.createUserGroup(userGroup);
  }

  async leaveGroup(userId: string, categoryId: string): Promise<void> {
    const userGroup = await this.userGroupRepository.getUserGroupByCategoryId(userId, categoryId);
    if (!userGroup || !userGroup.id) {
      throw new Error('No estás inscrito en ningún grupo de esta categoría');
    }

    await this.userGroupRepository.deleteUserGroup(userGroup.id);
  }

  async getGroupMembers(groupId: string): Promise<UserGroup[]> {
    return this.userGroupRepository.getUserGroupsByGroupId(groupId);
  }

  async getUserCurrentGroup(userId: string, categoryId: string): Promise<UserGroup | null> {
    return this.userGroupRepository.getUserGroupByCategoryId(userId, categoryId);
  }

  async countGroupMembers(groupId: string): Promise<number> {
    return this.userGroupRepository.countUsersByGroupId(groupId);
  }

  async isGroupFull(groupId: string): Promise<boolean> {
    const group = await this.groupRepository.getGroupById(groupId);
    if (!group) return true;

    const currentCount = await this.userGroupRepository.countUsersByGroupId(groupId);
    return currentCount >= group.capacity;
  }
}
