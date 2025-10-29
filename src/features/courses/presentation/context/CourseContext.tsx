// src/features/courses/presentation/context/CourseContext.tsx

import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Course, NewCourse } from "../../domain/entities/Course";
import {
    CanCreateMoreCoursesUseCase,
    CreateCourseUseCase,
    DeleteCourseUseCase,
    GetCourseByCodeUseCase,
    GetCourseByIdUseCase,
    ListCoursesByTeacherUseCase,
    LoadCoursesByIdsUseCase,
    UpdateCourseUseCase,
} from "../../domain/usecases/CourseUseCase";

type CourseContextType = {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  
  // Métodos principales
  loadTeacherCourses: () => Promise<void>;
  loadCoursesByIds: (courseIds: string[]) => Promise<Course[]>;
  addCourse: (data: Omit<NewCourse, 'teacher_id' | 'created_at'>) => Promise<void>;
  updateCourseInList: (course: Course) => Promise<void>;
  deleteCourseFromList: (id: string) => Promise<void>;
  
  // Métodos de utilidad
  canCreateMore: () => Promise<boolean>;
  getCourseIdByCode: (code: string) => Promise<string | null>;
  isOwnerOfCourse: (courseId: string) => Promise<boolean>;
  canJoinCourse: (courseId: string) => Promise<boolean>;
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const di = useDI();
  const { user: currentUser } = useAuth();

  // Resolver use cases
  const createCourseUC = di.resolve<CreateCourseUseCase>(TOKENS.CreateCourseUC);
  const updateCourseUC = di.resolve<UpdateCourseUseCase>(TOKENS.UpdateCourseUC);
  const deleteCourseUC = di.resolve<DeleteCourseUseCase>(TOKENS.DeleteCourseUC);
  const getCourseByIdUC = di.resolve<GetCourseByIdUseCase>(TOKENS.GetCourseByIdUC);
  const getCourseByCodeUC = di.resolve<GetCourseByCodeUseCase>(TOKENS.GetCourseByCodeUC);
  const listCoursesByTeacherUC = di.resolve<ListCoursesByTeacherUseCase>(TOKENS.ListCoursesByTeacherUC);
  const canCreateMoreUC = di.resolve<CanCreateMoreCoursesUseCase>(TOKENS.CanCreateMoreCoursesUC);
  const loadCoursesByIdsUC = di.resolve<LoadCoursesByIdsUseCase>(TOKENS.LoadCoursesByIdsUC);

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Equivalente a ever() en GetX - Se ejecuta cuando cambia el usuario
  useEffect(() => {
    if (currentUser) {
      loadTeacherCourses(); // Cargar cursos automáticamente
    } else {
      setCourses([]); // Limpiar lista si no hay usuario
    }
  }, [currentUser]);

  // Cargar cursos del profesor logueado
  const loadTeacherCourses = async () => {
    if (!currentUser?.id) {
      setError("Usuario no logueado");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await listCoursesByTeacherUC.execute(currentUser.id);
      setCourses(result);

      console.log(
        `✅ Cursos cargados para el usuario: ${result.map((c) => c.name).join(', ')}`
      );
    } catch (e) {
      const errorMsg = (e as Error).message;
      setError(errorMsg);
      console.error("❌ Error al cargar cursos:", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar múltiples cursos por IDs
  const loadCoursesByIds = async (courseIds: string[]): Promise<Course[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await loadCoursesByIdsUC.execute(courseIds);
      return result;
    } catch (e) {
      const errorMsg = (e as Error).message;
      setError(errorMsg);
      console.error("❌ Error al cargar cursos por IDs:", errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar nuevo curso
  const addCourse = async (data: Omit<NewCourse, 'teacher_id' | 'created_at'>) => {
    if (!currentUser?.id) {
      setError("Usuario no logueado");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const newCourse: NewCourse = {
        ...data,
        teacher_id: currentUser.id,
        created_at: new Date().toISOString(),
      };

      const created = await createCourseUC.execute(newCourse);

      console.log(`➕ Creado curso: ${created.name} | maxStudents=${created.max_students}`);

      setCourses((prev) => [...prev, created]);
      console.log(`✅ Curso agregado: ${created.name}`);
    } catch (e) {
      const errorMsg = (e as Error).message;
      setError(errorMsg);
      console.error("❌ Error al agregar curso:", errorMsg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar curso en la lista
  const updateCourseInList = async (course: Course) => {
    try {
      setIsLoading(true);
      setError(null);

      const updated = await updateCourseUC.execute(course);

      setCourses((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );

      console.log(`✅ Curso actualizado: ${updated.name}`);
    } catch (e) {
      const errorMsg = (e as Error).message;
      setError(errorMsg);
      console.error("❌ Error al actualizar curso:", errorMsg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar curso de la lista
  const deleteCourseFromList = async (id: string) => {
    console.log("Curso ID en función:", id);
    
    if (!id) {
      setError("ID de curso inválido");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await deleteCourseUC.execute(id);

      setCourses((prev) => prev.filter((c) => c._id !== id));

      console.log(`✅ Curso eliminado con id=${id}`);
    } catch (e) {
      const errorMsg = (e as Error).message;
      setError(errorMsg);
      console.error("❌ Error al eliminar curso:", errorMsg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar si puede crear más cursos
  const canCreateMore = async (): Promise<boolean> => {
    if (!currentUser?.id) {
      console.log("Usuario ID:", currentUser?.id);
      return false;
    }

    try {
      return await canCreateMoreUC.execute(currentUser.id);
    } catch (e) {
      console.error("❌ Error al verificar si puede crear más cursos:", e);
      return false;
    }
  };

  // Obtener ID de curso por código
  const getCourseIdByCode = async (code: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const course = await getCourseByCodeUC.execute(code);

      if (course?._id) {
        console.log(`✅ Curso encontrado por code=${code} → id=${course._id}`);
        return course._id;
      } else {
        console.log(`⚠️ No se encontró curso con code=${code}`);
        return null;
      }
    } catch (e) {
      const errorMsg = (e as Error).message;
      setError(errorMsg);
      console.error(`❌ Error al buscar curso por code=${code} →`, errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar si el usuario es dueño del curso
  const isOwnerOfCourse = async (courseId: string): Promise<boolean> => {
    if (!currentUser?.id) return false;

    // Primero buscar en la lista local
    const exists = courses.some(
      (c) => c._id === courseId && c.teacher_id === currentUser.id
    );
    if (exists) return true;

    // Si no está en la lista, buscar en el repositorio
    try {
      const course = await getCourseByIdUC.execute(courseId);
      return course?.teacher_id === currentUser.id;
    } catch (e) {
      console.error("❌ Error al verificar ownership:", e);
      return false;
    }
  };

  // Verificar si el usuario puede unirse al curso
  const canJoinCourse = async (courseId: string): Promise<boolean> => {
    if (!currentUser?.id) return false;

    try {
      const course = await getCourseByIdUC.execute(courseId);
      if (!course) return false;

      // ❌ Si el usuario es dueño (teacher_id === userId) → no puede inscribirse
      return course.teacher_id !== currentUser.id;
    } catch (e) {
      console.error("❌ Error al verificar si puede unirse al curso:", e);
      return false;
    }
  };

  const value = useMemo(
    () => ({
      courses,
      isLoading,
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
    }),
    [courses, isLoading, error, currentUser]
  );

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) {
    throw new Error("useCourses must be used inside CourseProvider");
  }
  return ctx;
}