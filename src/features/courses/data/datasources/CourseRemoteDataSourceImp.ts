import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { Course, NewCourse } from "../../domain/entities/Course";
import { CourseDataSource } from "./CourseRemoteDataSource";

export class CourseRemoteDataSourceImp implements CourseDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
  private readonly table = "courses";
  private prefs: ILocalPreferences;

  constructor(
    private authService: AuthRemoteDataSourceImpl,
    projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID
  ) {
    if (!projectId) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    }
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
    this.projectId = projectId;
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${this.projectId}`;
  }

  private async authorizedFetch(
    url: string,
    options: RequestInit,
    retry = true
  ): Promise<Response> {
    const token = await this.prefs.retrieveData<string>("token");
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && retry) {
      console.warn("401 detected, trying to refresh token…");
      try {
        const refreshed = await this.authService.refreshToken();
        if (refreshed) {
          const newToken = await this.prefs.retrieveData<string>("token");
          const retryHeaders = {
            ...(options.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
          return await fetch(url, { ...options, headers: retryHeaders });
        }
      } catch (e) {
        console.error("Token refresh failed, forcing logout", e);
      }
    }

    return response;
  }

  async create(course: NewCourse): Promise<Course> {
    console.log(
      `Creando curso: ${course.name}, Teacher ID: ${course.teacher_id}, Max Students: ${course.max_students}`
    );

    const url = `${this.baseUrl}/insert`;
    const body = JSON.stringify({
      tableName: this.table,
      records: [course],
    });

    const response = await this.authorizedFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (response.status === 200 || response.status === 201) {
      const data = await response.json();
      const inserted = data.inserted[0];
      return inserted as Course;
    } else if (response.status === 401) {
      throw new Error("Unauthorized (token issue)");
    } else {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `❌ Error creando curso: ${response.status} - ${
          errorBody.message ?? "Unknown error"
        }`
      );
    }
  }

  async getById(id: string): Promise<Course | undefined> {
    console.log("Obteniendo curso por ID:", id);
    const url = `${this.baseUrl}/read?tableName=${this.table}&_id=${id}`;

    const response = await this.authorizedFetch(url, { method: "GET" });

    if (response.status === 200) {
      const data: Course[] = await response.json();
      return data.length > 0 ? data[0] : undefined;
    } else if (response.status === 401) {
      throw new Error("Unauthorized (token issue)");
    } else {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `Error fetching course by id: ${response.status} - ${
          errorBody.message ?? "Unknown error"
        }`
      );
    }
  }

  async getByCode(code: string): Promise<Course | undefined> {
    const url = `${this.baseUrl}/read?tableName=${this.table}&code=${code}`;

    const response = await this.authorizedFetch(url, { method: "GET" });

    console.log(`📡 GetByCode → status: ${response.status}`);

    if (response.status === 200 || response.status === 201) {
      const data: Course[] = await response.json();
      if (data.length > 0) {
        console.log(`📌 Curso encontrado por code=${code}`);
        return data[0];
      } else {
        console.warn(`⚠️ No se encontró curso con code=${code}`);
        return undefined;
      }
    } else if (response.status === 401) {
      throw new Error("Unauthorized (token issue)");
    } else {
      const errorBody = await response.json().catch(() => ({}));
      console.error(`❌ Error en GetByCode: ${errorBody}`);
      throw new Error(
        `Error fetching course by code: ${response.status} - ${
          errorBody.message ?? "Unknown error"
        }`
      );
    }
  }

  async listByTeacher(teacherId: string): Promise<Course[]> {
    const url = `${this.baseUrl}/read?tableName=${this.table}&teacher_id=${teacherId}`;

    const response = await this.authorizedFetch(url, { method: "GET" });

    console.log(`📡 ListByTeacher → status: ${response.status}`);

    if (response.status === 200) {
      const data: Course[] = await response.json();
      return data;
    } else if (response.status === 401) {
      throw new Error("Unauthorized (token issue)");
    } else {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `Error listing courses by teacher: ${response.status} - ${
          errorBody.message ?? "Unknown error"
        }`
      );
    }
  }

  async update(course: Course): Promise<Course> {
    if (!course._id) {
      throw new Error("❌ Se requiere ID para actualizar");
    }

    const url = `${this.baseUrl}/update`;
    const { _id, ...updates } = course;

    const body = JSON.stringify({
      tableName: this.table,
      idColumn: "_id",
      idValue: _id,
      updates,
    });

    const response = await this.authorizedFetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
    });

    console.log(`📡 Update curso → status: ${response.status}`);

    if (response.status === 200) {
      const data = await response.json();
      return data as Course;
    } else if (response.status === 401) {
      throw new Error("Unauthorized (token issue)");
    } else {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `❌ Error actualizando curso: ${response.status} - ${
          errorBody.message ?? "Unknown error"
        }`
      );
    }
  }

  async delete(id: string): Promise<void> {
    const url = `${this.baseUrl}/delete`;

    const body = JSON.stringify({
      tableName: this.table,
      idColumn: "_id",
      idValue: id,
    });

    const response = await this.authorizedFetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body,
    });

    console.log(`📡 Eliminar curso → status: ${response.status}`);

    if (response.status === 200) {
      return Promise.resolve();
    } else if (response.status === 401) {
      throw new Error("Unauthorized (token issue)");
    } else {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `❌ Error eliminando curso: ${response.status} - ${
          errorBody.message ?? "Unknown error"
        }`
      );
    }
  }

  async countByTeacher(teacherId: string): Promise<number> {
    const url = `${this.baseUrl}/read?tableName=${this.table}&teacher_id=${teacherId}`;

    const response = await this.authorizedFetch(url, { method: "GET" });

    if (response.status === 200) {
      const data: Course[] = await response.json();
      console.log(`✅ Cursos encontrados: ${data.length}`);
      return data.length;
    } else if (response.status === 401) {
      throw new Error("Unauthorized (token issue)");
    } else {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `❌ Error contando cursos: ${response.status} - ${
          errorBody.message ?? "Unknown error"
        }`
      );
    }
  }
}