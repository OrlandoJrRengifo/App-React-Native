/**
 * @fileoverview DataSource abstracto para grupos.
 */
import { Group } from '../../domain/entities/Group';

export abstract class GroupDataSource {
  abstract createGroup(group: Group): Promise<Group>;
  abstract createMultipleGroups(groups: Group[]): Promise<Group[]>;
  abstract updateGroup(group: Group): Promise<Group>;
  abstract deleteGroup(id: string): Promise<boolean>;
  abstract getGroupsByCategory(categoryId: string): Promise<Group[]>;
  abstract getGroup(id: string): Promise<Group | null>;
  abstract getHighestNumerationByCategory(categoryId: string): Promise<number>;
}
