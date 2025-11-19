/**
 * @fileoverview Implementación del repositorio de UserGroup.
 */
import { UserGroup } from '../../domain/entities/UserGroup';
import { UserGroupRepository } from '../../domain/repositories/UserGroupRepository';
import { UserGroupDataSource } from '../datasources/UserGroupDataSource';

export class UserGroupRepositoryImpl extends UserGroupRepository {
  constructor(private dataSource: UserGroupDataSource) {
    super();
  }

  async getUserGroupsByGroupId(groupId: string): Promise<UserGroup[]> {
    return this.dataSource.getUserGroupsByGroupId(groupId);
  }

  async getUserGroupByCategoryId(userId: string, categoryId: string): Promise<UserGroup | null> {
    return this.dataSource.getUserGroupByCategoryId(userId, categoryId);
  }

  async getUserGroupByUserIdAndGroupId(userId: string, groupId: string): Promise<UserGroup | null> {
    return this.dataSource.getUserGroupByUserIdAndGroupId(userId, groupId);
  }

  async createUserGroup(userGroup: UserGroup): Promise<UserGroup> {
    return this.dataSource.createUserGroup(userGroup);
  }

  async deleteUserGroup(id: string): Promise<void> {
    return this.dataSource.deleteUserGroup(id);
  }

  async countUsersByGroupId(groupId: string): Promise<number> {
    return this.dataSource.countUsersByGroupId(groupId);
  }
}
