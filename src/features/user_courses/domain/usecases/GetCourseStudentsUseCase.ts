import { FakeUser } from "../../../fake_users/domain/entities/FakeUser";
import { IFakeUserRepository } from "../../../fake_users/domain/repositories/IFakeUserRepository";
import { UserCourseRepository } from "../repositories/UserCourseRepository";

export interface CourseStudent {
    id: string;
    authId: string;
    name: string;
    email: string;
}

export class GetCourseStudentsUseCase {
    constructor(
        private userCourseRepository: UserCourseRepository,
        private fakeUserRepository: IFakeUserRepository
    ) {
        console.log("GetCourseStudentsUseCase: Initialized.");
    }

    async execute(courseId: string): Promise<CourseStudent[]> {
        console.log("-> GetCourseStudentsUseCase: Getting students for course:", courseId);
        
        try {
            // 1. Obtener todos los user_courses para este curso
            const userCourses = await this.userCourseRepository.getCourseUsers(courseId);
            console.log(`Found ${userCourses.length} enrollments for course ${courseId}`);
            
            if (userCourses.length === 0) {
                return [];
            }

            // 2. Extraer los auth_ids (userId en UserCourse es el auth_id)
            const authIds = userCourses.map(uc => uc.userId);
            console.log("Auth IDs to lookup:", authIds);

            // 3. Obtener los FakeUsers correspondientes
            const fakeUsers = await this.fakeUserRepository.getUsersByIds(authIds);
            console.log(`Found ${fakeUsers.length} fake users`);

            // 4. Mapear a CourseStudent
            const students: CourseStudent[] = fakeUsers.map((user: FakeUser) => ({
                id: user.id || '',
                authId: user.authId,
                name: user.name,
                email: user.email
            }));

            return students;
        } catch (error) {
            console.error("❌ Error in GetCourseStudentsUseCase:", error);
            throw error;
        }
    }
}
