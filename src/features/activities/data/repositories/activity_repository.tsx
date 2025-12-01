
import { Activity } from '../../domain/entities/activity';
import { IActivityRepository } from '../../domain/repositories/i_activity_repository';
import { IActivityDataSource } from '../datasources/i_activity_source';

export class ActivityRepositoryImpl implements IActivityRepository {
  constructor(private dataSource: IActivityDataSource) {
    console.log('ActivityRepositoryImpl: Initialized.');
  }

  async createActivity(categoryId: string, name: string): Promise<Activity | null> {
    console.log('-> ActivityRepository: Creating activity.');
    return this.dataSource.createActivity(categoryId, name);
  }

  async getActivitiesByCategory(categoryId: string): Promise<Activity[]> {
    console.log('-> ActivityRepository: Getting activities by category.');
    return this.dataSource.getActivitiesByCategory(categoryId);
  }

  async activateActivity(activityId: string): Promise<boolean> {
    console.log('-> ActivityRepository: Activating activity.');
    return this.dataSource.activateActivity(activityId);
  }

  async updateActivityName(activityId: string, newName: string): Promise<boolean> {
    console.log('-> ActivityRepository: Updating activity name.');
    return this.dataSource.updateActivityName(activityId, newName);
  }

  async deleteActivity(activityId: string): Promise<boolean> {
    console.log('-> ActivityRepository: Deleting activity.');
    return this.dataSource.deleteActivity(activityId);
  }
}