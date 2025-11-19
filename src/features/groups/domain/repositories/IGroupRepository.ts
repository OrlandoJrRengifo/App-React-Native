/**
 * @fileoverview Contrato del Repositorio de Grupos.
 */
import { Group } from '../entities/Group';

export interface IGroupRepository {
  createGroup(group: Group): Promise<Group>;
  createMultipleGroups(groups: Group[]): Promise<Group[]>;
  updateGroup(group: Group): Promise<Group>;
  deleteGroup(id: string): Promise<boolean>;
  getGroupsByCategory(categoryId: string): Promise<Group[]>;
  getGroup(id: string): Promise<Group | null>;
  getHighestNumerationByCategory(categoryId: string): Promise<number>;
}
