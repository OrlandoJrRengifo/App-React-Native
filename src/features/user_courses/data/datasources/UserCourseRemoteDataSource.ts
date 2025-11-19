import { getAuthSessionData } from "@/src/core/utils/getAuthSession";
import { UserCourse } from "../../domain/entities/UserCourse";
import { UserCourseDataSource } from "./UserCourseDataSource";
// Importar dependencias para la verificación de cupos si es necesario,
// aquí simulamos el llamado a otra DS, como en Flutter.
// (Asumimos que CourseRemoteDataSource existe para getAvailableSlots)
// En este ejemplo, esa dependencia se pasa al constructor o se simula. 

// URL base de la base de datos (ajustada para el formato TS/JS)
const PROJECT_ID = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID; 
const BASE_URL = `https://roble-api.openlab.uninorte.edu.co/database/${PROJECT_ID}`;


export class UserCourseRemoteDataSourceImpl implements UserCourseDataSource {
    private readonly baseUrl: string;

    // Nota: El llamado a getAvailableSlots se simula o se externaliza. 
    // Por simplicidad, aquí lo haremos de forma directa.
    // En una arquitectura limpia, CourseRemoteDataSource se inyectaría aquí.
    
    constructor(projectId = PROJECT_ID) {
        if (!projectId) {
            throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
        }
        this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${projectId}`;
    }

    // --- Simulación de verificación de cupos (necesitas la implementación real) ---
    private async getAvailableSlots(courseId: string): Promise<number> {
        // **⚠️ Advertencia: Reemplazar con la lógica real de CourseRemoteDataSource**
        console.warn(`[UserCourseDS] Simulating course slot check for ${courseId}. Returning 5.`);
        return 5; // Simulación: siempre hay 5 cupos
    }
    // ----------------------------------------------------------------------------


    async enrollUser(userId: string, courseId: string): Promise<UserCourse | null> {
        console.log(`[UserCourseDS] Enroll user ${userId} in course ${courseId}`);
        
        // 1. Verificar cupos (simulado/externo)
        const availableSlots = await this.getAvailableSlots(courseId);
        if (availableSlots <= 0) {
            console.warn(`[UserCourseDS] No slots available in course ${courseId}`);
            return null;
        }

        const { token } = await getAuthSessionData();
        if (!token) throw new Error("Authentication token not available.");

        const body = {
            "tableName": "user_courses",
            "records": [
                {"user_id": userId, "course_id": courseId},
            ],
        };

        const response = await fetch(`${this.baseUrl}/insert`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (response.status !== 200 && response.status !== 201) {
             const errorBody = await response.json();
             console.error("[UserCourseDS] Enrollment failed:", errorBody);
             return null;
        }
        
        const data = await response.json();
        console.log(`[UserCourseDS] User ${userId} successfully enrolled in ${courseId}`);
        
        // Retornar la entidad creada
        return new UserCourse({
            id: data[0]?.id,
            userId,
            courseId,
        });
    }

    async getUserCourses(userId: string): Promise<UserCourse[]> {
        console.log(`[UserCourseDS] Getting courses for user ${userId}`);
        const { token } = await getAuthSessionData();
        if (!token) return [];

        const uri = `${this.baseUrl}/read?tableName=user_courses&user_id=${userId}`;

        const response = await fetch(uri, {
            method: "GET",
            headers: {'Authorization': `Bearer ${token}`},
        });

        if (response.status === 200) {
            const data = await response.json() as { id: string; user_id: string; course_id: string }[];
            return data.map((record) => new UserCourse({
                id: record.id,
                userId: record.user_id,
                courseId: record.course_id,
            }));
        }
        console.error(`[UserCourseDS] Failed to get user courses (Status: ${response.status})`);
        return [];
    }

    async getCourseUsers(courseId: string): Promise<UserCourse[]> {
        console.log(`[UserCourseDS] Getting users for course ${courseId}`);
        const { token } = await getAuthSessionData();
        if (!token) return [];

        const uri = `${this.baseUrl}/read?tableName=user_courses&course_id=${courseId}`;

        const response = await fetch(uri, {
            method: "GET",
            headers: {'Authorization': `Bearer ${token}`},
        });

        if (response.status === 200) {
            const data = await response.json() as { id: string; user_id: string; course_id: string }[];
            return data.map((record) => new UserCourse({
                id: record.id,
                userId: record.user_id,
                courseId: record.course_id,
            }));
        }
        console.error(`[UserCourseDS] Failed to get course users (Status: ${response.status})`);
        return [];
    }

    async isUserInCourse(userId: string, courseId: string): Promise<boolean> {
        console.log(`[UserCourseDS] Checking if user ${userId} is in course ${courseId}`);
        const { token } = await getAuthSessionData();
        if (!token) throw new Error("Authentication token not available.");

        const uri = `${this.baseUrl}/read?tableName=user_courses&user_id=${userId}&course_id=${courseId}`;

        const response = await fetch(uri, {
            method: "GET",
            headers: {'Authorization': `Bearer ${token}`},
        });
        
        if (response.status !== 200 && response.status !== 201) {
            const errorBody = await response.json();
            throw new Error(`Error al verificar inscripción: ${errorBody.message || JSON.stringify(errorBody)}`);
        }

        const data = await response.json() as any[];
        const isInCourse = data.length > 0;
        console.log(`[UserCourseDS] User ${userId} is in course ${courseId}: ${isInCourse}`);
        return isInCourse; 
    }

    async unenrollUser(userId: string, courseId: string): Promise<boolean> {
        console.log(`[UserCourseDS] Unenrolling user ${userId} from course ${courseId}`);
        const { token } = await getAuthSessionData();
        if (!token) throw new Error("Authentication token not available.");

        const body = {
            "tableName": "user_courses",
            "where": {
                "user_id": userId,
                "course_id": courseId
            }
        };

        const response = await fetch(`${this.baseUrl}/delete`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (response.status !== 200 && response.status !== 201) {
            const errorBody = await response.json();
            console.error("[UserCourseDS] Unenrollment failed:", errorBody);
            return false;
        }
        
        console.log(`[UserCourseDS] User ${userId} successfully unenrolled from ${courseId}`);
        return true;
    }
}