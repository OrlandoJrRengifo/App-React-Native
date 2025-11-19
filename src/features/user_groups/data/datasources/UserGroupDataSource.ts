/**
 * @fileoverview Interfaz del datasource de UserGroup.
 */
import { UserGroup } from '../../domain/entities/UserGroup';

export abstract class UserGroupDataSource {
  abstract getUserGroupsByGroupId(groupId: string): Promise<UserGroup[]>;
  abstract getUserGroupByCategoryId(userId: string, categoryId: string): Promise<UserGroup | null>;
  abstract getUserGroupByUserIdAndGroupId(userId: string, groupId: string): Promise<UserGroup | null>;
  abstract createUserGroup(userGroup: UserGroup): Promise<UserGroup>;
  abstract deleteUserGroup(id: string): Promise<void>;
  abstract countUsersByGroupId(groupId: string): Promise<number>;
}
