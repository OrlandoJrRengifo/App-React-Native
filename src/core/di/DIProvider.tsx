import { createContext, useContext, useMemo } from "react";

import { TOKENS } from "./tokens";

import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { GetCurrentUserUseCase } from "@/src/features/auth/domain/usecases/GetCurrentUserUseCase";
import { LoginUseCase } from "@/src/features/auth/domain/usecases/LoginUseCase";
import { LogoutUseCase } from "@/src/features/auth/domain/usecases/LogoutUseCase";
import { SignupUseCase } from "@/src/features/auth/domain/usecases/SignupUseCase";
import { CourseRemoteDataSourceImp } from "@/src/features/courses/data/datasources/CourseRemoteDataSourceImp";
import { CourseRepositoryImpl } from "@/src/features/courses/data/repositories/CourseRepositoryImpl";
import CourseUseCases from "@/src/features/courses/domain/usecases/CourseUseCase";
import { ProductRemoteDataSourceImp } from "@/src/features/products/data/datasources/ProductRemoteDataSourceImp";
import { ProductRepositoryImpl } from "@/src/features/products/data/repositories/ProductRepositoryImpl";
import { AddProductUseCase } from "@/src/features/products/domain/usecases/AddProductUseCase";
import { DeleteProductUseCase } from "@/src/features/products/domain/usecases/DeleteProductUseCase";
import { GetProductByIdUseCase } from "@/src/features/products/domain/usecases/GetProductByIdUseCase";
import { GetProductsUseCase } from "@/src/features/products/domain/usecases/GetProductsUseCase";
import { UpdateProductUseCase } from "@/src/features/products/domain/usecases/UpdateProductUseCase";
import { Container } from "./container";


const DIContext = createContext<Container | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
    //useMemo is a React Hook that lets you cache the result of a calculation between re-renders.
    const container = useMemo(() => {
        const c = new Container();

        const authDS = new AuthRemoteDataSourceImpl();
        const authRepo = new AuthRepositoryImpl(authDS);

        c.register(TOKENS.AuthRemoteDS, authDS)
            .register(TOKENS.AuthRepo, authRepo)
            .register(TOKENS.LoginUC, new LoginUseCase(authRepo))
            .register(TOKENS.SignupUC, new SignupUseCase(authRepo))
            .register(TOKENS.LogoutUC, new LogoutUseCase(authRepo))
            .register(TOKENS.GetCurrentUserUC, new GetCurrentUserUseCase(authRepo));


        const remoteDS = new ProductRemoteDataSourceImp(authDS);
        const productRepo = new ProductRepositoryImpl(remoteDS);

        c.register(TOKENS.ProductRemoteDS, remoteDS)
            .register(TOKENS.ProductRepo, productRepo).register(TOKENS.AddProductUC, new AddProductUseCase(productRepo))
            .register(TOKENS.UpdateProductUC, new UpdateProductUseCase(productRepo))
            .register(TOKENS.DeleteProductUC, new DeleteProductUseCase(productRepo))
            .register(TOKENS.GetProductsUC, new GetProductsUseCase(productRepo))
            .register(TOKENS.GetProductByIdUC, new GetProductByIdUseCase(productRepo));

        const courseDS = new CourseRemoteDataSourceImp(authDS);
        const courseRepo = new CourseRepositoryImpl(courseDS);

        console.log("🔍 CourseUseCases completo:", CourseUseCases);
        console.log("🔍 CreateCourseUseCase:", CourseUseCases.CreateCourseUseCase);

        const {
            CanCreateMoreCoursesUseCase,
            CreateCourseUseCase,
            DeleteCourseUseCase,
            GetCourseByCodeUseCase,
            GetCourseByIdUseCase,
            ListCoursesByTeacherUseCase,
            LoadCoursesByIdsUseCase,
            UpdateCourseUseCase,
        } = CourseUseCases;
        
        console.log("🔍 CreateCourseUseCase desestructurado:", CreateCourseUseCase);

        c.register(TOKENS.CourseRemoteDS, courseDS)
            .register((TOKENS as any).CourseRepo, courseRepo)
            .register(TOKENS.CreateCourseUC, new CreateCourseUseCase(courseRepo))
            .register(TOKENS.UpdateCourseUC, new UpdateCourseUseCase(courseRepo))
            .register(TOKENS.DeleteCourseUC, new DeleteCourseUseCase(courseRepo))
            .register(TOKENS.GetCourseByIdUC, new GetCourseByIdUseCase(courseRepo))
            .register(TOKENS.GetCourseByCodeUC, new GetCourseByCodeUseCase(courseRepo))
            .register(TOKENS.ListCoursesByTeacherUC, new ListCoursesByTeacherUseCase(courseRepo))
            .register(TOKENS.CanCreateMoreCoursesUC, new CanCreateMoreCoursesUseCase(courseRepo))
            .register(TOKENS.LoadCoursesByIdsUC, new LoadCoursesByIdsUseCase(courseRepo));
        return c;

    }, []);

    return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
    const c = useContext(DIContext);
    if (!c) throw new Error("DIProvider missing");
    return c;
}
