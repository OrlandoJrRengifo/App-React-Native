import { UserCourse } from "../entities/UserCourse";

export abstract class UserCourseRepository {
    abstract enrollUser(userId: string, courseId: string): Promise<UserCourse | null>;
    abstract getUserCourses(userId: string): Promise<UserCourse[]>;
    abstract getCourseUsers(courseId: string): Promise<UserCourse[]>;
    abstract isUserInCourse(userId: string, courseId: string): Promise<boolean>;
    abstract unenrollUser(userId: string, courseId: string): Promise<boolean>;
}