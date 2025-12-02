import React, { createContext, useCallback, useContext, useState } from "react";
import { Assessment } from "../../domain/entities/Assessment";
import { AssessmentUseCases } from "../../domain/usecases/AssessmentUseCases";

type CreateAssessmentPayload = {
  activityId: string;
  rater: string;
  toRate: string;
  timeWin?: string | null; // "HH:mm:ss" o null
  visibility: string;
};

type AverageRatings = {
  punctuality: number;
  contributions: number;
  commitment: number;
  attitude: number;
  general: number;
};

export type AssessmentContextType = {
  assessments: Assessment[];
  loadAssessmentsByActivityAndRater: (activityId: string, rater: string) => Promise<void>;
  getAssessmentsByActivity: (activityId: string) => Promise<Assessment[]>;
  createAssessment: (payload: CreateAssessmentPayload) => Promise<boolean>;
  gradeAssessment: (
    assessmentId: string,
    punctuality: number,
    contributions: number,
    commitment: number,
    attitude: number
  ) => Promise<boolean>;
  getAverageRatings: (activityId: string, userId: string) => Promise<AverageRatings>;
};

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const useAssessment = (): AssessmentContextType => {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessment must be used within AssessmentProvider");
  return ctx;
};

export const AssessmentProvider: React.FC<{ useCases: AssessmentUseCases; children: React.ReactNode }> = ({
  useCases,
  children,
}) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const loadAssessmentsByActivityAndRater = useCallback(
    async (activityId: string, rater: string) => {
      const list = await useCases.getAssessmentsByActivityAndRater(activityId, rater);
      // Si la useCase retorna objetos planos, convertir a Assessment si hace falta:
      const mapped = list.map((x: any) => (x instanceof Assessment ? x : Assessment.fromMap(x)));
      setAssessments(mapped);
    },
    [useCases]
  );

  const getAssessmentsByActivity = useCallback(
    async (activityId: string) => {
      const list = await useCases.getAssessmentsByActivity(activityId);
      const mapped = list.map((x: any) => (x instanceof Assessment ? x : Assessment.fromMap(x)));
      return mapped;
    },
    [useCases]
  );

  const createAssessment = useCallback(
    async (payload: CreateAssessmentPayload) => {
      const a = new Assessment({
        id: payload.activityId === "" ? undefined : undefined, // no id on create
        activityId: payload.activityId,
        rater: payload.rater,
        toRate: payload.toRate,
        timeWin: payload.timeWin ?? null,
        visibility: payload.visibility,
        punctuality: null,
        contributions: null,
        commitment: null,
        attitude: null,
      });

      const res = await useCases.createAssessment(a);
      // no hacemos setAssessments acá porque la fuente de la verdad debería venir de la lista reloaded
      return res;
    },
    [useCases]
  );

  const gradeAssessment = useCallback(
    async (
      assessmentId: string,
      punctuality: number,
      contributions: number,
      commitment: number,
      attitude: number
    ) => {
      return await useCases.gradeAssessment(assessmentId, punctuality, contributions, commitment, attitude);
    },
    [useCases]
  );

  const getAverageRatings = useCallback(
    async (activityId: string, userId: string): Promise<AverageRatings> => {
      const list = await useCases.getAssessmentsByActivityAndToRate(activityId, userId);
      const mapped = list.map((x: any) => (x instanceof Assessment ? x : Assessment.fromMap(x)));

      if (!mapped || mapped.length === 0) {
        return { punctuality: 0, contributions: 0, commitment: 0, attitude: 0, general: 0 };
      }

      const rated = mapped.filter((a) => a.punctuality != null);

      if (rated.length === 0) {
        return { punctuality: 0, contributions: 0, commitment: 0, attitude: 0, general: 0 };
      }

      const sum = (fn: (a: Assessment) => number | null) =>
        rated.reduce((acc, cur) => acc + (fn(cur) ?? 0), 0);

      const avgPunctuality = sum((a) => a.punctuality ?? null) / rated.length;
      const avgContributions = sum((a) => a.contributions ?? null) / rated.length;
      const avgCommitment = sum((a) => a.commitment ?? null) / rated.length;
      const avgAttitude = sum((a) => a.attitude ?? null) / rated.length;
      const general = (avgPunctuality + avgContributions + avgCommitment + avgAttitude) / 4;

      return {
        punctuality: Number.isNaN(avgPunctuality) ? 0 : avgPunctuality,
        contributions: Number.isNaN(avgContributions) ? 0 : avgContributions,
        commitment: Number.isNaN(avgCommitment) ? 0 : avgCommitment,
        attitude: Number.isNaN(avgAttitude) ? 0 : avgAttitude,
        general: Number.isNaN(general) ? 0 : general,
      };
    },
    [useCases]
  );

  const value: AssessmentContextType = {
    assessments,
    loadAssessmentsByActivityAndRater,
    getAssessmentsByActivity,
    createAssessment,
    gradeAssessment,
    getAverageRatings,
  };

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
};
