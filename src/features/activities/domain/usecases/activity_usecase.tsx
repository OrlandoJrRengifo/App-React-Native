
import { Activity } from '../entities/activity';
import { IActivityRepository } from '../repositories/i_activity_repository';

export class ActivityUseCases {
  constructor(private repository: IActivityRepository) {
    console.log('ActivityUseCases: Initialized.');
  }


  async createActivity(categoryId: string, name: string): Promise<Activity | null> {
    console.log('-> ActivityUseCases: Creating activity.');
    return this.repository.createActivity(categoryId, name);
  }

  async getActivitiesByCategory(categoryId: string): Promise<Activity[]> {
    console.log('-> ActivityUseCases: Getting activities by category.');
    return this.repository.getActivitiesByCategory(categoryId);
  }

  async activateActivity(activityId: string): Promise<boolean> {
    console.log('-> ActivityUseCases: Activating activity.');
    return this.repository.activateActivity(activityId);
  }


  async updateActivityName(activityId: string, newName: string): Promise<boolean> {
    console.log('-> ActivityUseCases: Updating activity name.');
    return this.repository.updateActivityName(activityId, newName);
  }

  async deleteActivity(activityId: string): Promise<boolean> {
    console.log('-> ActivityUseCases: Deleting activity.');
    return this.repository.deleteActivity(activityId);
  }
}