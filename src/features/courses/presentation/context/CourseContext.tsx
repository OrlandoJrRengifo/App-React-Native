import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDI } from '../../../../core/di/DIProvider';
import { TOKENS } from '../../../../core/di/tokens';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { Course } from '../../domain/entities/Course';
import { CourseUseCases } from '../../domain/usecases/CourseUseCases';

interface ICourseContext {
  teacherCourses: Course[]; 
  loading: boolean;
  error: string | null;
  
  loadTeacherCourses: () => Promise<void>;
  loadCoursesByIds: (courseIds: string[]) => Promise<Course[]>;
  addCourse: (params: { name: string, code: string, maxStudents: number }) => Promise<void>;
  updateCourseInList: (course: Course) => Promise<void>;
  deleteCourseFromList: (id: string) => Promise<void>;
  canCreateMore: () => Promise<boolean>;
  
  getCourseIdByCode: (code: string) => Promise<string | null>;
  isOwnerOfCourse: (courseId: string) => Promise<boolean>;
  canJoinCourse: (courseId: string) => Promise<boolean>;
  getCourse: (id: string) => Promise<Course | null>;
}

const CourseContext = createContext<ICourseContext | undefined>(undefined);

interface CourseProviderProps {
  children: ReactNode;
}

export const CourseProvider = ({ children }: CourseProviderProps) => { 
  
  const container: any = useDI(); 
  
  const useCases: CourseUseCases = useMemo(() => ({
    createCourse: container.resolve(TOKENS.CreateCourseUC), 
    updateCourse: container.resolve(TOKENS.UpdateCourseUC), 
    deleteCourse: container.resolve(TOKENS.DeleteCourseUC), 
    listCoursesByTeacher: container.resolve(TOKENS.ListCoursesByTeacherUC), 
    getCourse: container.resolve(TOKENS.GetCourseByIdUC), 
    getCourseByCode: container.resolve(TOKENS.GetCourseByCodeUC), 
    canCreateMore: container.resolve(TOKENS.CanCreateMoreUC), 
  } as CourseUseCases), [container]);

  const { user } = useAuth(); 
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTeacherCourses = useCallback(async (): Promise<void> => {
    if (!user) {
      setError("Usuario no logueado");
      setTeacherCourses([]); 
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await useCases.listCoursesByTeacher(user.id);
      setTeacherCourses(result);
    } catch (e: any) {
      setError(e.message || 'Error al cargar cursos');
      console.error("❌ Error al cargar cursos:", e);
    } finally {
      setLoading(false);
    }
  }, [user, useCases]);

  useEffect(() => {
    if (user) {
      loadTeacherCourses();
    } else {
      setTeacherCourses([]); 
    }
  }, [user, loadTeacherCourses]); 

  const loadCoursesByIds = async (courseIds: string[]): Promise<Course[]> => {
    try {
      setLoading(true);
      setError(null);
      const result: Course[] = [];
      for (const id of courseIds) {
        const course = await useCases.getCourse(id);
        if (course) {
          result.push(course);
        }
      }
      return result;
    } catch (e: any) {
      setError(e.message || 'Error al cargar cursos por IDs');
      console.error("❌ Error al cargar cursos por IDs:", e);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Agrega un nuevo curso (como profesor).
   */
  const addCourse = async ({ name, code, maxStudents }: { name: string, code: string, maxStudents: number }): Promise<void> => {
    if (!user) {
      setError("Usuario no logueado");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const newCourse = await useCases.createCourse({
        name,
        code,
        teacherId: user.id, 
        maxStudents,
        createdAt: new Date(),
      });
      setTeacherCourses(prev => [...prev, newCourse]); 
    } catch (e: any) {
      setError(e.message || 'Error al agregar curso');
      console.error("❌ Error al agregar curso:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza un curso en la lista de profesor.
   */
  const updateCourseInList = async (course: Course): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await useCases.updateCourse(course);
      setTeacherCourses(prev => 
        prev.map(c => (c.id === updated.id ? updated : c))
      );
    } catch (e: any) {
      setError(e.message || 'Error al actualizar curso');
      console.error("❌ Error al actualizar curso:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina un curso (como profesor).
   */
  const deleteCourseFromList = async (id: string): Promise<void> => {
    if (!id) {
      setError("ID de curso inválido");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await useCases.deleteCourse(id);
      setTeacherCourses(prev => prev.filter(c => c.id !== id));
    } catch (e: any) {
      setError(e.message || 'Error al eliminar curso');
      console.error("❌ Error al eliminar curso:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifica si el profesor puede crear más cursos (lógica de negocio).
   */
  const canCreateMore = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      return await (useCases as any).canCreateMore(user.id);
    } catch (e) {
      console.error("❌ Error al verificar canCreateMore:", e);
      return false;
    }
  };

  /**
   * Busca un curso por su código (para unirse).
   */
  const getCourseIdByCode = async (code: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      const course = await useCases.getCourseByCode(code);
      if (course) {
        return course.id ?? null;
      } else {
        return null;
      }
    } catch (e: any) {
      setError(e.message || 'Error al buscar curso por código');
      console.error(`❌ Error al buscar curso por code=${code} → ${e}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifica si el usuario logueado es el dueño (profesor) del curso.
   */
  const isOwnerOfCourse = async (courseId: string): Promise<boolean> => {
    if (!user) return false;
    
    // 1. Revisar la lista local primero (optimización)
    const exists = teacherCourses.some(
      (c) => c.id === courseId && c.teacherId === user.id,
    );
    if (exists) return true;

    // 2. Si no, verificar en la API
    const course = await useCases.getCourse(courseId);
    return course?.teacherId === user.id; 
  };

  /**
   * Verifica si el usuario puede unirse (no es el dueño).
   */
  const canJoinCourse = async (courseId: string): Promise<boolean> => {
    if (!user) return false;
    const course = await useCases.getCourse(courseId);
    if (course == null) return false;
    // Si el usuario es dueño (teacher_id == user.id) → no puede inscribirse
    return course.teacherId !== user.id;
  };
  
  const getCourse = async (id: string): Promise<Course | null> => {
     return useCases.getCourse(id);
  }

  const value: ICourseContext = {
    teacherCourses,
    loading,
    error,
    loadTeacherCourses,
    loadCoursesByIds,
    addCourse,
    updateCourseInList,
    deleteCourseFromList,
    canCreateMore,
    getCourseIdByCode,
    isOwnerOfCourse,
    canJoinCourse,
    getCourse,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};

/**
 * Hook personalizado para consumir el CourseContext.
 */
export const useCourses = (): ICourseContext => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses debe ser usado dentro de un CourseProvider');
  }
  return context;
};