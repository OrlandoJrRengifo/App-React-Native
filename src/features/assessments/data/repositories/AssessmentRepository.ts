// src/features/assessments/data/repositories/AssessmentRepository.ts
import { Assessment } from "../../domain/entities/Assessment";
import { IAssessmentRepository } from "../../domain/repositories/IAssessmentRepository";
import { IAssessmentDataSource } from "../datasources/IAssessmentDataSource";

export class AssessmentRepository implements IAssessmentRepository {
  constructor(private dataSource: IAssessmentDataSource) {}

  getAssessmentsByActivity(activityId: string): Promise<Assessment[]> {
    return this.dataSource.getAssessmentsByActivity(activityId);
  }

  getAssessmentsByActivityAndRater(activityId: string, rater: string): Promise<Assessment[]> {
    return this.dataSource.getAssessmentsByActivityAndRater(activityId, rater);
  }

  getAssessmentsByActivityAndToRate(activityId: string, toRate: string): Promise<Assessment[]> {
    return this.dataSource.getAssessmentsByActivityAndToRate(activityId, toRate);
  }

  createAssessment(assessment: Assessment): Promise<boolean> {
    return this.dataSource.createAssessment(assessment);
  }

  gradeAssessment(
    assessmentId: string,
    punctuality: number,
    contributions: number,
    commitment: number,
    attitude: number
  ): Promise<boolean> {
    return this.dataSource.gradeAssessment(
      assessmentId,
      punctuality,
      contributions,
      commitment,
      attitude
    );
  }

  getAssessmentsByToRate(toRate: string): Promise<Assessment[]> {
    return this.dataSource.getAssessmentsByToRate(toRate);
  }
}
