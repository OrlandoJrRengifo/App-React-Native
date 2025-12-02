// src/features/assessments/data/datasources/IAssessmentDataSource.ts
import { Assessment } from "../../domain/entities/Assessment";

export interface IAssessmentDataSource {
  getAssessmentsByActivity(activityId: string): Promise<Assessment[]>;
  getAssessmentsByActivityAndRater(activityId: string, rater: string): Promise<Assessment[]>;
  getAssessmentsByActivityAndToRate(activityId: string, toRate: string): Promise<Assessment[]>;
  createAssessment(assessment: Assessment): Promise<boolean>;
  gradeAssessment(
    assessmentId: string,
    punctuality: number,
    contributions: number,
    commitment: number,
    attitude: number
  ): Promise<boolean>;
  getAssessmentsByToRate(toRate: string): Promise<Assessment[]>;
}
