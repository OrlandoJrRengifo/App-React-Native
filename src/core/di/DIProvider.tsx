import { createContext, useContext, useMemo } from "react";

import { TOKENS } from "./tokens";

import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { GetCurrentUserUseCase } from "@/src/features/auth/domain/usecases/GetCurrentUserUseCase";
import { LoginUseCase } from "@/src/features/auth/domain/usecases/LoginUseCase";
import { LogoutUseCase } from "@/src/features/auth/domain/usecases/LogoutUseCase";
import { SignupUseCase } from "@/src/features/auth/domain/usecases/SignupUseCase";
import { Container } from "./container";

// Importaciones corregidas y añadidas para las preferencias locales:
import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";

// --- CLASES CONCRETAS NECESARIAS PARA CURSOS ---
import { CourseRobleDataSource } from "@/src/features/courses/data/datasources/CourseRobleDataSource";
import { CourseRepository } from "@/src/features/courses/data/repositories/CourseRepository";
import { CourseUseCases } from "@/src/features/courses/domain/usecases/CourseUseCases";
// -------------------------------------------------

// --- CLASES CONCRETAS NECESARIAS PARA FAKE_USERS ---
import { FakeUserRobleSource } from "@/src/features/fake_users/data/datasources/FakeUserRobleSource";
import { FakeUserRepositoryImpl } from "@/src/features/fake_users/data/repositories/FakeUserRepositoryImpl";
// ---------------------------------------------------

// --- CLASES CONCRETAS NECESARIAS PARA USER_COURSES ---
import { UserCourseRemoteDataSourceImpl } from "@/src/features/user_courses/data/datasources/UserCourseRemoteDataSource";
import { UserCourseRepositoryImpl } from "@/src/features/user_courses/data/repositories/UserCourseRepositoryImpl";
import { GetCourseStudentsUseCase } from "@/src/features/user_courses/domain/usecases/GetCourseStudentsUseCase";
// ---------------------------------------------------

// --- CLASES CONCRETAS NECESARIAS PARA CATEGORIES ---
import { CategoryRobleDataSource } from "@/src/features/categories/data/datasources/CategoryRobleDataSource";
import { CategoryRepositoryImpl } from "@/src/features/categories/data/repositories/CategoryRepositoryImpl";
import { CategoryUseCases } from "@/src/features/categories/domain/usecases/CategoryUseCases";
// ---------------------------------------------------

// --- CLASES CONCRETAS NECESARIAS PARA GROUPS ---
import { GroupRobleDataSource } from "@/src/features/groups/data/datasources/GroupRobleDataSource";
import { GroupRepositoryImpl } from "@/src/features/groups/data/repositories/GroupRepositoryImpl";
import { CreateCategoryWithGroupsUseCase } from "@/src/features/groups/domain/usecases/CreateCategoryWithGroupsUseCase";
import { GroupUseCases } from "@/src/features/groups/domain/usecases/GroupUseCases";
// ---------------------------------------------------

// --- CLASES CONCRETAS NECESARIAS PARA USER_GROUPS ---
import { UserGroupRobleDataSource } from "@/src/features/user_groups/data/datasources/UserGroupRobleDataSource";
import { UserGroupRepositoryImpl } from "@/src/features/user_groups/data/repositories/UserGroupRepositoryImpl";
import { UserGroupUseCases } from "@/src/features/user_groups/domain/usecases/UserGroupUseCases";
// ---------------------------------------------------


const DIContext = createContext<Container | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
    // useMemo asegura que la creación del contenedor solo se ejecute una vez
    const container = useMemo(() => {
        const c = new Container();

        // =======================================================
        // 0. REGISTRO CORE: LOCAL PREFERENCES (DEBE IR PRIMERO)
        // Esto soluciona el error "No provider for Symbol(LocalPrefs)"
        // =======================================================
        const localPrefsInstance = LocalPreferencesAsyncStorage.getInstance();
        c.register(TOKENS.LocalPrefs, localPrefsInstance);
        
        // Resolvemos la instancia para usarla en los siguientes constructores
        const prefs = c.resolve(TOKENS.LocalPrefs) as ILocalPreferences;


        // ==========================================
        // 1. REGISTROS DE AUTH
        // ==========================================
        const authDS = new AuthRemoteDataSourceImpl();
        const authRepo = new AuthRepositoryImpl(authDS);

        // ==========================================
        // 1.5 REGISTROS DE FAKE_USERS
        // ==========================================
        const fakeUserDS = new FakeUserRobleSource(prefs);
        const fakeUserRepo = new FakeUserRepositoryImpl(fakeUserDS);
        c.register(TOKENS.FakeUserRepo, fakeUserRepo);

        c.register(TOKENS.AuthRemoteDS, authDS)
            .register(TOKENS.AuthRepo, authRepo)
            .register(TOKENS.LoginUC, new LoginUseCase(authRepo))
            .register(TOKENS.SignupUC, new SignupUseCase(authRepo))
            .register(TOKENS.LogoutUC, new LogoutUseCase(authRepo))
            .register(TOKENS.GetCurrentUserUC, new GetCurrentUserUseCase(authRepo));
        // ==========================================
        // 2. REGISTROS DE CURSOS 
        // ==========================================
        
        // Crear DataSource (necesita 'prefs' ya resuelta y registrada)
        const courseDS = new CourseRobleDataSource(prefs); 
        
        // Crear Repository
        const courseRepo = new CourseRepository(courseDS);
        
        // Instancia única de la clase contenedora de Casos de Uso
        const courseUCInstance = new CourseUseCases(courseRepo);

        c.register(TOKENS.CourseRemoteDS, courseDS)
            .register(TOKENS.CourseRepo, courseRepo)
            
            // Registramos las funciones individuales usando .bind() para mantener el contexto 'this'
            .register(TOKENS.CreateCourseUC, courseUCInstance.createCourse.bind(courseUCInstance))
            .register(TOKENS.UpdateCourseUC, courseUCInstance.updateCourse.bind(courseUCInstance))
            .register(TOKENS.DeleteCourseUC, courseUCInstance.deleteCourse.bind(courseUCInstance))
            .register(TOKENS.ListCoursesByTeacherUC, courseUCInstance.listCoursesByTeacher.bind(courseUCInstance))
            .register(TOKENS.GetCourseByIdUC, courseUCInstance.getCourse.bind(courseUCInstance))
            .register(TOKENS.GetCourseByCodeUC, courseUCInstance.getCourseByCode.bind(courseUCInstance))
            .register(TOKENS.CanCreateMoreUC, courseUCInstance.canCreateMore.bind(courseUCInstance));

        // ==========================================
        // 3. REGISTROS DE USER_COURSES
        // ==========================================
        const userCourseDS = new UserCourseRemoteDataSourceImpl();
        const userCourseRepo = new UserCourseRepositoryImpl(userCourseDS);
        c.register(TOKENS.UserCourseRepo, userCourseRepo);

        const getCourseStudentsUC = new GetCourseStudentsUseCase(userCourseRepo, fakeUserRepo);
        c.register(TOKENS.GetCourseStudentsUC, getCourseStudentsUC);

        // ==========================================
        // 4. REGISTROS DE CATEGORIES
        // ==========================================
        const categoryDS = new CategoryRobleDataSource(prefs);
        const categoryRepo = new CategoryRepositoryImpl(categoryDS);
        const categoryUseCases = new CategoryUseCases(categoryRepo);
        
        c.register(TOKENS.CategoryDataSource, categoryDS)
            .register(TOKENS.CategoryRepo, categoryRepo)
            .register(TOKENS.CategoryUseCases, categoryUseCases);

        // ==========================================
        // 5. REGISTROS DE GROUPS
        // ==========================================
        const groupDS = new GroupRobleDataSource(prefs);
        const groupRepo = new GroupRepositoryImpl(groupDS);
        const groupUseCases = new GroupUseCases(groupRepo);

        c.register(TOKENS.GroupDataSource, groupDS)
            .register(TOKENS.GroupRepo, groupRepo)
            .register(TOKENS.GroupUseCases, groupUseCases);

        // Use Case especial que combina categorías y grupos
        const createCategoryWithGroupsUC = new CreateCategoryWithGroupsUseCase(
            categoryRepo,
            groupRepo,
            userCourseRepo
        );
        c.register(TOKENS.CreateCategoryWithGroupsUC, createCategoryWithGroupsUC);

        // ==========================================
        // 6. REGISTROS DE USER_GROUPS
        // ==========================================
        const userGroupDS = new UserGroupRobleDataSource();
        const userGroupRepo = new UserGroupRepositoryImpl(userGroupDS);
        const userGroupUseCases = new UserGroupUseCases(userGroupRepo, groupRepo);

        c.register(TOKENS.UserGroupDataSource, userGroupDS)
            .register(TOKENS.UserGroupRepo, userGroupRepo)
            .register(TOKENS.UserGroupUseCases, userGroupUseCases);

        return c;
    }, []);

    return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
    const c = useContext(DIContext);
    if (!c) throw new Error("DIProvider missing");
    return c;
}