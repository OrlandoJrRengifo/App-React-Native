import { Activity } from '../../domain/entities/activity';

export interface IActivityDataSource {

  createActivity(categoryId: string, name: string): Promise<Activity | null>;
  getActivitiesByCategory(categoryId: string): Promise<Activity[]>;
  activateActivity(activityId: string): Promise<boolean>;
  updateActivityName(activityId: string, newName: string): Promise<boolean>;
  deleteActivity(activityId: string): Promise<boolean>;
}