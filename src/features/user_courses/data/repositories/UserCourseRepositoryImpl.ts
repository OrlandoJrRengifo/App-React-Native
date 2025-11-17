import { UserCourseRepository } from "../../domain/repositories/UserCourseRepository";
import { UserCourseDataSource } from "../datasources/UserCourseDataSource";

export class UserCourseRepositoryImpl implements UserCourseRepository {
    private dataSource: UserCourseDataSource;

    constructor(dataSource: UserCourseDataSource) {
        this.dataSource = dataSource;
        console.log("UserCourseRepository: Initialized.");
    }

    enrollUser(userId: string, courseId: string): Promise<boolean> {
        console.log("-> UserCourseRepository: Calling enrollUser.");
        return this.dataSource.enrollUser(userId, courseId);
    }

    getUserCourses(userId: string): Promise<string[]> {
        console.log("-> UserCourseRepository: Calling getUserCourses.");
        return this.dataSource.getUserCourses(userId);
    }

    getCourseUsers(courseId: string): Promise<string[]> {
        console.log("-> UserCourseRepository: Calling getCourseUsers.");
        return this.dataSource.getCourseUsers(courseId);
    }

    isUserInCourse(userId: string, courseId: string): Promise<boolean> {
        console.log("-> UserCourseRepository: Calling isUserInCourse validation.");
        return this.dataSource.isUserInCourse(userId, courseId);
    }
}