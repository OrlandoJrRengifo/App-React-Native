import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import React, { createContext, useContext, useState } from 'react';
import { Assessment } from '../../domain/entities/Assessment';
import { AssessmentUseCases } from '../../domain/usecases/AssessmentUseCases';

interface AssessmentContextType {
  assessments: Assessment[];
  loading: boolean;
  loadAssessmentsByActivity: (activityId: string) => Promise<void>;
  loadAssessmentsByActivityAndRater: (activityId: string, raterId: string) => Promise<void>;
  gradeAssessment: (
    assessmentId: string,
    grades: {
      punctuality: number;
      contributions: number;
      commitment: number;
      attitude: number;
    }
  ) => Promise<void>;
  getAverageRatings: (activityId: string, userId: string) => Promise<{
    punctuality: number;
    contributions: number;
    commitment: number;
    attitude: number;
    general: number;
  } | null>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const container = useDI();
  const assessmentUseCases = container.resolve(TOKENS.AssessmentUseCases) as AssessmentUseCases;
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAssessmentsByActivity = async (activityId: string) => {
    setLoading(true);
    try {
      const result = await assessmentUseCases.getAssessmentsByActivity(activityId);
      setAssessments(result);
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssessmentsByActivityAndRater = async (activityId: string, raterId: string) => {
    setLoading(true);
    try {
      const result = await assessmentUseCases.getAssessmentsByActivityAndRater(activityId, raterId);
      setAssessments(result);
    } catch (error) {
      console.error('Error loading assessments by rater:', error);
    } finally {
      setLoading(false);
    }
  };

  const gradeAssessment = async (
    assessmentId: string,
    grades: {
      punctuality: number;
      contributions: number;
      commitment: number;
      attitude: number;
    }
  ) => {
    try {
      await assessmentUseCases.gradeAssessment(
        assessmentId,
        grades.punctuality,
        grades.contributions,
        grades.commitment,
        grades.attitude
      );
      // Reload assessments to reflect changes
      const updatedAssessment = assessments.find(a => a.id === assessmentId);
      if (updatedAssessment) {
        setAssessments(prevAssessments =>
          prevAssessments.map(a =>
            a.id === assessmentId
              ? { ...a, ...grades }
              : a
          )
        );
      }
    } catch (error) {
      console.error('Error grading assessment:', error);
      throw error;
    }
  };

  const getAverageRatings = async (activityId: string, userId: string) => {
    try {
      return await assessmentUseCases.getAverageRatings(activityId, userId);
    } catch (error) {
      console.error('Error getting average ratings:', error);
      return null;
    }
  };

  return (
    <AssessmentContext.Provider
      value={{
        assessments,
        loading,
        loadAssessmentsByActivity,
        loadAssessmentsByActivityAndRater,
        gradeAssessment,
        getAverageRatings,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessments = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessments must be used within AssessmentProvider');
  }
  return context;
};
