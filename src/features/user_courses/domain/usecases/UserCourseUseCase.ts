import { UserCourse } from "../entities/UserCourse";
import { UserCourseRepository } from "../repositories/UserCourseRepository";

export class UserCourseUseCase {
    private repository: UserCourseRepository;

    constructor(repository: UserCourseRepository) {
        this.repository = repository;
        console.log("UserCourseUseCase: Initialized.");
    }

    enrollUser(userId: string, courseId: string): Promise<UserCourse | null> {
        console.log("-> UserCourseUseCase: Executing enrollUser.");
        return this.repository.enrollUser(userId, courseId);
    }

    getUserCourses(userId: string): Promise<UserCourse[]> {
        console.log("-> UserCourseUseCase: Executing getUserCourses.");
        return this.repository.getUserCourses(userId);
    }

    getCourseUsers(courseId: string): Promise<UserCourse[]> {
        console.log("-> UserCourseUseCase: Executing getCourseUsers.");
        return this.repository.getCourseUsers(courseId);
    }

    isUserInCourse(userId: string, courseId: string): Promise<boolean> {
        console.log("-> UserCourseUseCase: Executing isUserInCourse validation.");
        return this.repository.isUserInCourse(userId, courseId);
    }

    unenrollUser(userId: string, courseId: string): Promise<boolean> {
        console.log("-> UserCourseUseCase: Executing unenrollUser.");
        return this.repository.unenrollUser(userId, courseId);
    }
}