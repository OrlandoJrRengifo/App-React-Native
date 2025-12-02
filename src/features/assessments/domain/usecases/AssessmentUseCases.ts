import { Assessment } from "../entities/Assessment";
import { IAssessmentRepository } from "../repositories/IAssessmentRepository";

export class AssessmentUseCases {
  private readonly repository: IAssessmentRepository;

  constructor(repository: IAssessmentRepository) {
    this.repository = repository;
  }

  getAssessmentsByActivity(activityId: string) {
    return this.repository.getAssessmentsByActivity(activityId);
  }

  getAssessmentsByActivityAndRater(activityId: string, rater: string) {
    return this.repository.getAssessmentsByActivityAndRater(activityId, rater);
  }

  getAssessmentsByActivityAndToRate(activityId: string, toRate: string) {
    return this.repository.getAssessmentsByActivityAndToRate(activityId, toRate);
  }

  createAssessment(assessment: Assessment) {
    return this.repository.createAssessment(assessment);
  }

  gradeAssessment(
    assessmentId: string,
    punctuality: number,
    contributions: number,
    commitment: number,
    attitude: number
  ) {
    return this.repository.gradeAssessment(
      assessmentId,
      punctuality,
      contributions,
      commitment,
      attitude
    );
  }

  getAssessmentsByToRate(toRate: string) {
    return this.repository.getAssessmentsByToRate(toRate);
  }
}
