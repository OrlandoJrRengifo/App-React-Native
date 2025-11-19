/**
 * @fileoverview Implementación del repositorio de grupos.
 */
import { Group } from '../../domain/entities/Group';
import { IGroupRepository } from '../../domain/repositories/IGroupRepository';
import { GroupDataSource } from '../datasources/GroupDataSource';

export class GroupRepositoryImpl implements IGroupRepository {
  constructor(private dataSource: GroupDataSource) {
    console.log('GroupRepositoryImpl: Initialized.');
  }

  createGroup(group: Group): Promise<Group> {
    console.log('-> GroupRepository: Creating group.');
    return this.dataSource.createGroup(group);
  }

  createMultipleGroups(groups: Group[]): Promise<Group[]> {
    console.log('-> GroupRepository: Creating multiple groups.');
    return this.dataSource.createMultipleGroups(groups);
  }

  updateGroup(group: Group): Promise<Group> {
    console.log('-> GroupRepository: Updating group.');
    return this.dataSource.updateGroup(group);
  }

  deleteGroup(id: string): Promise<boolean> {
    console.log('-> GroupRepository: Deleting group.');
    return this.dataSource.deleteGroup(id);
  }

  getGroupsByCategory(categoryId: string): Promise<Group[]> {
    console.log('-> GroupRepository: Getting groups by category.');
    return this.dataSource.getGroupsByCategory(categoryId);
  }

  getGroup(id: string): Promise<Group | null> {
    console.log('-> GroupRepository: Getting group by id.');
    return this.dataSource.getGroup(id);
  }

  getHighestNumerationByCategory(categoryId: string): Promise<number> {
    console.log('-> GroupRepository: Getting highest numeration.');
    return this.dataSource.getHighestNumerationByCategory(categoryId);
  }
}
