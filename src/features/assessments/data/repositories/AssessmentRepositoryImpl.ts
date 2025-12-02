import { Assessment } from "../../domain/entities/Assessment";
import { IAssessmentRepository } from "../../domain/repositories/IAssessmentRepository";
import { AssessmentRobleDataSource } from "../datasources/AssessmentRobleDataSource";

export class AssessmentRepositoryImpl implements IAssessmentRepository {
  constructor(private dataSource: AssessmentRobleDataSource) {}

  async createAssessment(assessment: Assessment): Promise<Assessment | null> {
    return this.dataSource.createAssessment(assessment);
  }

  async getAssessmentsByActivity(activityId: string): Promise<Assessment[]> {
    return this.dataSource.getAssessmentsByActivity(activityId);
  }

  async getAssessmentsByActivityAndRater(activityId: string, rater: string): Promise<Assessment[]> {
    return this.dataSource.getAssessmentsByActivityAndRater(activityId, rater);
  }

  async updateAssessment(id: string, assessment: Partial<Assessment>): Promise<Assessment | null> {
    return this.dataSource.updateAssessment(id, assessment);
  }

  async deleteAssessment(id: string): Promise<boolean> {
    return this.dataSource.deleteAssessment(id);
  }
}
