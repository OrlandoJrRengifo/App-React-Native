
export abstract class UserCourseDataSource {
    abstract enrollUser(userId: string, courseId: string): Promise<boolean>;
    abstract getUserCourses(userId: string): Promise<string[]>;
    abstract getCourseUsers(courseId: string): Promise<string[]>;
    abstract isUserInCourse(userId: string, courseId: string): Promise<boolean>;
}