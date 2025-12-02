/**
 * @fileoverview Implementación del DataSource de assessments usando Roble API.
 */

import { ILocalPreferences } from '@/src/core/iLocalPreferences';
import { Assessment } from '../../domain/entities/Assessment';
import { IAssessmentDataSource } from './IAssessmentDataSource';

const PROJECT_ID = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID;
const BASE_URL = `https://roble-api.openlab.uninorte.edu.co/database/${PROJECT_ID}`;

export class AssessmentRobleDataSource implements IAssessmentDataSource {
  private readonly tableName = 'assessments';
  private readonly baseUrl: string;

  constructor(private prefs: ILocalPreferences) {
    if (!PROJECT_ID) {
      throw new Error('Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var for Roble DB');
    }
    this.baseUrl = BASE_URL;
  }

  private async getToken(): Promise<string> {
    const token = await this.prefs.retrieveData<string>('token');
    if (!token) throw new Error('No token found for Roble DB access.');
    return token;
  }

  // -----------------------------------------------------------
  // GET ASSESSMENTS BY ACTIVITY
  // -----------------------------------------------------------
  async getAssessmentsByActivity(activityId: string): Promise<Assessment[]> {
    try {
      const token = await this.getToken();
      const url = `${this.baseUrl}/read?tableName=${this.tableName}&activity_id=${activityId}`;

      console.log('📄 Fetching assessments by activity:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await response.text();
      console.log("📦 response:", text);

      if (response.status === 200) {
        const list = JSON.parse(text);
        return list.map((e: any) => Assessment.fromJson(e));
      }

      return [];
    } catch (e) {
      console.error('❌ getAssessmentsByActivity error:', e);
      return [];
    }
  }

  // -----------------------------------------------------------
  // GET ASSESSMENTS BY ACTIVITY + RATER
  // -----------------------------------------------------------
  async getAssessmentsByActivityAndRater(activityId: string, rater: string): Promise<Assessment[]> {
    try {
      const token = await this.getToken();
      const url = `${this.baseUrl}/read?tableName=${this.tableName}&activity_id=${activityId}&rater=${rater}`;

      console.log('📄 Fetch:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await response.text();
      if (response.status === 200) {
        const list = JSON.parse(text);
        return list.map((e: any) => Assessment.fromJson(e));
      }

      return [];
    } catch (e) {
      console.error('❌ getAssessmentsByActivityAndRater error:', e);
      return [];
    }
  }

  // -----------------------------------------------------------
  // GET ASSESSMENTS BY ACTIVITY + TO RATE
  // -----------------------------------------------------------
  async getAssessmentsByActivityAndToRate(activityId: string, toRate: string): Promise<Assessment[]> {
    try {
      const token = await this.getToken();
      const url = `${this.baseUrl}/read?tableName=${this.tableName}&activity_id=${activityId}&to_rate=${toRate}`;

      console.log('📄 Fetch:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await response.text();
      if (response.status === 200) {
        const list = JSON.parse(text);
        return list.map((e: any) => Assessment.fromJson(e));
      }

      return [];
    } catch (e) {
      console.error('❌ getAssessmentsByActivityAndToRate error:', e);
      return [];
    }
  }

  // -----------------------------------------------------------
  // GET ASSESSMENTS BY TO_RATE
  // -----------------------------------------------------------
  async getAssessmentsByToRate(toRate: string): Promise<Assessment[]> {
    try {
      const token = await this.getToken();
      const url = `${this.baseUrl}/read?tableName=${this.tableName}&to_rate=${toRate}`;

      console.log('📄 Fetch:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await response.text();
      if (response.status === 200) {
        const list = JSON.parse(text);
        return list.map((e: any) => Assessment.fromJson(e));
      }

      return [];
    } catch (e) {
      console.error('❌ getAssessmentsByToRate error:', e);
      return [];
    }
  }

  // -----------------------------------------------------------
  // CREATE ASSESSMENT
  // -----------------------------------------------------------
  async createAssessment(assessment: Assessment): Promise<boolean> {
    try {
      const token = await this.getToken();

      const bodyPayload = {
        tableName: this.tableName,
        records: [assessment.toJson()],
      };

      console.log("📝 Creating assessment:", bodyPayload);

      const response = await fetch(`${this.baseUrl}/insert`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      const text = await response.text();
      console.log("📡 response:", text);

      if (response.status === 200 || response.status === 201) {
        const data = JSON.parse(text);
        return data.inserted && data.inserted.length > 0;
      }

      return false;
    } catch (e) {
      console.error("❌ createAssessment error:", e);
      return false;
    }
  }

  // -----------------------------------------------------------
  // GRADE ASSESSMENT
  // -----------------------------------------------------------
  async gradeAssessment(
    assessmentId: string,
    punctuality: number,
    contributions: number,
    commitment: number,
    attitude: number
  ): Promise<boolean> {
    try {
      const token = await this.getToken();

      const bodyPayload = {
        tableName: this.tableName,
        idColumn: "_id",
        idValue: assessmentId,
        updates: {
          punctuality,
          contributions,
          commitment,
          attitude,
        },
      };

      console.log("📝 Updating assessment:", assessmentId);

      const response = await fetch(`${this.baseUrl}/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyPayload),
      });

      if (response.status === 200) return true;

      console.error("❌ gradeAssessment failed:", response.status);
      return false;
    } catch (e) {
      console.error("❌ gradeAssessment error:", e);
      return false;
    }
  }
}
