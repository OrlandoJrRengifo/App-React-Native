import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { Assessment } from "../../domain/entities/Assessment";

const ROBLE_API_URL = "https://roble-api.openlab.uninorte.edu.co/database";
const TABLE_NAME = "assessments";

export class AssessmentRobleDataSource {
  private projectId: string | null = null;

  constructor(private prefs: ILocalPreferences) {}

  private async getProjectId(): Promise<string> {
    if (!this.projectId) {
      this.projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID || "";
    }
    return this.projectId;
  }

  private async getToken(): Promise<string> {
    const token = await this.prefs.retrieveData<string>('token');
    if (!token) {
      throw new Error('No token found for Roble DB access.');
    }
    return token;
  }

  async createAssessment(assessment: Assessment): Promise<Assessment | null> {
    try {
      const projectId = await this.getProjectId();
      const token = await this.getToken();
      const url = `${ROBLE_API_URL}/${projectId}/insert`;

      const record = {
        activity_id: assessment.activityId,
        rater: assessment.rater,
        to_rate: assessment.toRate,
        time_win: assessment.timeWin,
        visibility: assessment.visibility,
        punctuality: assessment.punctuality,
        contributions: assessment.contributions,
        commitment: assessment.commitment,
        attitude: assessment.attitude,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          tableName: TABLE_NAME,
          records: [record],
        }),
      });

      if (!response.ok) {
        console.error("Error creating assessment:", response.status);
        return null;
      }

      const data = await response.json();
      if (data.insertedRecords && data.insertedRecords.length > 0) {
        const inserted = data.insertedRecords[0];
        return new Assessment({
          id: inserted._id,
          activityId: inserted.activity_id,
          rater: inserted.rater,
          toRate: inserted.to_rate,
          timeWin: inserted.time_win,
          visibility: inserted.visibility,
          punctuality: inserted.punctuality,
          contributions: inserted.contributions,
          commitment: inserted.commitment,
          attitude: inserted.attitude,
        });
      }

      return null;
    } catch (error) {
      console.error("Error in createAssessment:", error);
      return null;
    }
  }

  async getAssessmentsByActivity(activityId: string): Promise<Assessment[]> {
    try {
      const projectId = await this.getProjectId();
      const token = await this.getToken();
      const url = `${ROBLE_API_URL}/${projectId}/read?tableName=${TABLE_NAME}&activity_id=${activityId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      });
      if (!response.ok) {
        console.error("Error fetching assessments:", response.status);
        return [];
      }

      const data = await response.json();
      return (data || []).map(
        (item: any) =>
          new Assessment({
            id: item._id,
            activityId: item.activity_id,
            rater: item.rater,
            toRate: item.to_rate,
            timeWin: item.time_win,
            visibility: item.visibility,
            punctuality: item.punctuality,
            contributions: item.contributions,
            commitment: item.commitment,
            attitude: item.attitude,
          })
      );
    } catch (error) {
      console.error("Error in getAssessmentsByActivity:", error);
      return [];
    }
  }

  async getAssessmentsByActivityAndRater(activityId: string, rater: string): Promise<Assessment[]> {
    try {
      const projectId = await this.getProjectId();
      const token = await this.getToken();
      const url = `${ROBLE_API_URL}/${projectId}/read?tableName=${TABLE_NAME}&activity_id=${activityId}&rater=${rater}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      });
      if (!response.ok) {
        console.error("Error fetching assessments by rater:", response.status);
        return [];
      }

      const data = await response.json();
      return (data || []).map(
        (item: any) =>
          new Assessment({
            id: item._id,
            activityId: item.activity_id,
            rater: item.rater,
            toRate: item.to_rate,
            timeWin: item.time_win,
            visibility: item.visibility,
            punctuality: item.punctuality,
            contributions: item.contributions,
            commitment: item.commitment,
            attitude: item.attitude,
          })
      );
    } catch (error) {
      console.error("Error in getAssessmentsByActivityAndRater:", error);
      return [];
    }
  }

  async updateAssessment(id: string, updates: Partial<Assessment>): Promise<Assessment | null> {
    try {
      const projectId = await this.getProjectId();
      const token = await this.getToken();
      const url = `${ROBLE_API_URL}/${projectId}/update`;

      const updateFields: any = {};
      if (updates.punctuality !== undefined) updateFields.punctuality = updates.punctuality;
      if (updates.contributions !== undefined) updateFields.contributions = updates.contributions;
      if (updates.commitment !== undefined) updateFields.commitment = updates.commitment;
      if (updates.attitude !== undefined) updateFields.attitude = updates.attitude;
      if (updates.timeWin !== undefined) updateFields.time_win = updates.timeWin;
      if (updates.visibility !== undefined) updateFields.visibility = updates.visibility;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          tableName: TABLE_NAME,
          idColumn: "_id",
          idValue: id,
          updates: updateFields,
        }),
      });

      if (!response.ok) {
        console.error("Error updating assessment:", response.status);
        return null;
      }

      const data = await response.json();
      if (data.updatedRecord) {
        const updated = data.updatedRecord;
        return new Assessment({
          id: updated._id,
          activityId: updated.activity_id,
          rater: updated.rater,
          toRate: updated.to_rate,
          timeWin: updated.time_win,
          visibility: updated.visibility,
          punctuality: updated.punctuality,
          contributions: updated.contributions,
          commitment: updated.commitment,
          attitude: updated.attitude,
        });
      }

      return null;
    } catch (error) {
      console.error("Error in updateAssessment:", error);
      return null;
    }
  }

  async deleteAssessment(id: string): Promise<boolean> {
    try {
      const projectId = await this.getProjectId();
      const token = await this.getToken();
      const url = `${ROBLE_API_URL}/${projectId}/delete`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          tableName: TABLE_NAME,
          idColumn: "_id",
          idValue: id,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error in deleteAssessment:", error);
      return false;
    }
  }
}
