import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
// Rutas ajustadas para la capa de arquitectura
import { UserCourseRemoteDataSourceImpl } from '../../data/datasources/UserCourseRemoteDataSource';
import { UserCourseRepositoryImpl } from '../../data/repositories/UserCourseRepositoryImpl';
import { UserCourseUseCase } from '../../domain/usecases/UserCourseUseCase';

// --------------------------------------------------------------------------------
// 1. INICIALIZACIÓN DE DEPENDENCIAS
// --------------------------------------------------------------------------------

const userCourseDataSource = new UserCourseRemoteDataSourceImpl();
const userCourseRepository = new UserCourseRepositoryImpl(userCourseDataSource);
const userCourseUseCase = new UserCourseUseCase(userCourseRepository);

// --------------------------------------------------------------------------------
// 2. TIPOS DE CONTEXTO
// --------------------------------------------------------------------------------

interface UserCourseState {
    enrolledCourseIds: string[]; 
    isLoading: boolean;
    error: string | null;
}

interface UserCourseContextType {
    state: UserCourseState;
    enrollUser: (userId: string, courseId: string) => Promise<boolean>;
    isUserInCourse: (userId: string, courseId: string) => Promise<boolean>;
    fetchUserCourses: (userId: string) => Promise<void>;
}

const initialUserCourseState: UserCourseState = {
    enrolledCourseIds: [],
    isLoading: false,
    error: null,
};

const UserCourseContext = createContext<UserCourseContextType | undefined>(undefined);

// --------------------------------------------------------------------------------
// 3. PROVIDER
// --------------------------------------------------------------------------------

interface UserCourseProviderProps {
    children: ReactNode;
}

export const UserCourseProvider: React.FC<UserCourseProviderProps> = ({ children }) => {
    const [state, setState] = useState<UserCourseState>(initialUserCourseState);
    
    const fetchUserCourses = useCallback(async (userId: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        console.log(`[UserCourseContext] Obteniendo cursos inscritos para user: ${userId}`);
        try {
            const courseIds = await userCourseUseCase.getUserCourses(userId);
            setState(prev => ({ 
                ...prev, 
                enrolledCourseIds: courseIds, 
                isLoading: false 
            }));
        } catch (e: any) {
            setState(prev => ({ 
                ...prev, 
                error: e.message || "Error al cargar los IDs de los cursos.", 
                isLoading: false 
            }));
            console.error("[UserCourseContext] Error en fetchUserCourses:", e);
        }
    }, []);

    const isUserInCourse = useCallback(async (userId: string, courseId: string): Promise<boolean> => {
        setState(prev => ({ ...prev, error: null }));
        try {
            const isIn = await userCourseUseCase.isUserInCourse(userId, courseId);
            return isIn;
        } catch (e: any) {
            // No cambiamos el estado de error global si solo falla la verificación
            console.error("[UserCourseContext] Error en isUserInCourse:", e);
            throw e; 
        }
    }, []);

    const enrollUser = useCallback(async (userId: string, courseId: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        console.log(`[UserCourseContext] Intentando inscribir a ${userId} en curso ${courseId}`);

        try {
            // 1. Verificación de inscripción
            const alreadyIn = await userCourseUseCase.isUserInCourse(userId, courseId);
            if (alreadyIn) {
                const message = "El usuario ya está inscrito en este curso.";
                setState(prev => ({ ...prev, error: message, isLoading: false }));
                console.warn(`[UserCourseContext] ${message}`);
                return false;
            }

            // 2. Ejecutar la inscripción
            const success = await userCourseUseCase.enrollUser(userId, courseId);
            
            if (success) {
                console.log("[UserCourseContext] Inscripción exitosa. Actualizando lista.");
                setState(prev => ({
                    ...prev,
                    enrolledCourseIds: [...prev.enrolledCourseIds, courseId],
                    isLoading: false,
                    error: null,
                }));
                return true;
            } else {
                // Si la inscripción falla por cupos (manejado en la DS)
                const message = state.error || "Fallo al inscribirse (posiblemente sin cupos).";
                setState(prev => ({ ...prev, error: message, isLoading: false }));
                return false;
            }

        } catch (e: any) {
            setState(prev => ({ 
                ...prev, 
                error: e.message || "Error desconocido durante la inscripción.", 
                isLoading: false 
            }));
            console.error("[UserCourseContext] Excepción en enrollUser:", e);
            return false;
        }
    }, [state.error]);


    const value = {
        state,
        enrollUser,
        isUserInCourse,
        fetchUserCourses,
    };

    return (
        <UserCourseContext.Provider value={value}>
            {children}
        </UserCourseContext.Provider>
    );
};

// --------------------------------------------------------------------------------
// 4. HOOK PERSONALIZADO
// --------------------------------------------------------------------------------

export const useUserCourse = () => {
    const context = useContext(UserCourseContext);
    if (context === undefined) {
        throw new Error('useUserCourse debe usarse dentro de un UserCourseProvider');
    }
    return context;
};