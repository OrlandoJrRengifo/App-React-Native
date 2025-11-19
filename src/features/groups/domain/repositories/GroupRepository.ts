/**
 * @fileoverview Interfaz del repositorio de Group.
 */
import { Group } from '../entities/Group';

export abstract class GroupRepository {
  abstract getGroupById(id: string): Promise<Group | null>;
  abstract getGroupsByCategory(categoryId: string): Promise<Group[]>;
  abstract createGroup(group: Group): Promise<Group>;
  abstract createMultipleGroups(groups: Group[]): Promise<Group[]>;
  abstract updateGroup(group: Group): Promise<Group>;
  abstract deleteGroup(id: string): Promise<boolean>;
  abstract getHighestNumerationByCategory(categoryId: string): Promise<number>;
}
