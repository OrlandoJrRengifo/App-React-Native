import { Assessment } from "../entities/Assessment";

export interface IAssessmentRepository {
  createAssessment(assessment: Assessment): Promise<Assessment | null>;
  getAssessmentsByActivity(activityId: string): Promise<Assessment[]>;
  getAssessmentsByActivityAndRater(activityId: string, rater: string): Promise<Assessment[]>;
  updateAssessment(id: string, assessment: Partial<Assessment>): Promise<Assessment | null>;
  deleteAssessment(id: string): Promise<boolean>;
}
