import { Assessment } from "../entities/Assessment";
import { IAssessmentRepository } from "../repositories/IAssessmentRepository";

export class AssessmentUseCases {
  constructor(private repository: IAssessmentRepository) {}

  async createAssessment(assessment: Assessment): Promise<Assessment | null> {
    return this.repository.createAssessment(assessment);
  }

  async getAssessmentsByActivity(activityId: string): Promise<Assessment[]> {
    return this.repository.getAssessmentsByActivity(activityId);
  }

  async getAssessmentsByActivityAndRater(activityId: string, rater: string): Promise<Assessment[]> {
    return this.repository.getAssessmentsByActivityAndRater(activityId, rater);
  }

  async gradeAssessment(
    id: string,
    punctuality: number,
    contributions: number,
    commitment: number,
    attitude: number
  ): Promise<Assessment | null> {
    return this.repository.updateAssessment(id, {
      punctuality,
      contributions,
      commitment,
      attitude,
    });
  }

  async getAverageRatings(activityId: string, toRate: string): Promise<{
    punctuality: number;
    contributions: number;
    commitment: number;
    attitude: number;
    general: number;
  }> {
    const assessments = await this.repository.getAssessmentsByActivity(activityId);
    const relevantAssessments = assessments.filter(a => a.toRate === toRate && a.punctuality !== null);

    if (relevantAssessments.length === 0) {
      return { punctuality: 0, contributions: 0, commitment: 0, attitude: 0, general: 0 };
    }

    const sum = relevantAssessments.reduce(
      (acc, a) => ({
        punctuality: acc.punctuality + (a.punctuality || 0),
        contributions: acc.contributions + (a.contributions || 0),
        commitment: acc.commitment + (a.commitment || 0),
        attitude: acc.attitude + (a.attitude || 0),
      }),
      { punctuality: 0, contributions: 0, commitment: 0, attitude: 0 }
    );

    const count = relevantAssessments.length;
    const avgPunctuality = sum.punctuality / count;
    const avgContributions = sum.contributions / count;
    const avgCommitment = sum.commitment / count;
    const avgAttitude = sum.attitude / count;

    return {
      punctuality: avgPunctuality,
      contributions: avgContributions,
      commitment: avgCommitment,
      attitude: avgAttitude,
      general: (avgPunctuality + avgContributions + avgCommitment + avgAttitude) / 4,
    };
  }

  async deleteAssessment(id: string): Promise<boolean> {
    return this.repository.deleteAssessment(id);
  }
}
