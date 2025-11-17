import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { CourseModel } from '../models/CourseModel';
import { ICourseRobleDataSource } from './ICourseRobleDataSource';

export class CourseRobleDataSource implements ICourseRobleDataSource {
  private readonly baseUrl: string;
  private readonly tableName = "courses";

  constructor(private prefs: ILocalPreferences, projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var for Roble DB");
    }
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/database_364931dc19`;
  }

  private async getToken(): Promise<string> {
    const token = await this.prefs.retrieveData<string>('token');
    if (!token) {
      throw new Error("No token found for Roble DB access.");
    }
    return token;
  }

  async create(course: CourseModel): Promise<CourseModel> {
    
    const body = {
      "tableName": this.tableName,
      "records": [
        course.toMap() 
      ],
    };
    
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/insert`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 200 || response.status === 201) {
      const data = await response.json();
      const inserted = (data['inserted'] as any[])[0];
      return CourseModel.fromMap(inserted);
    } else {
      throw new Error(`❌ Error creando curso: ${await response.text()}`);
    }
  }

  async getById(id: string): Promise<CourseModel | null> {
    // console.log("Obteniendo curso por ID:", id);
    const url = `${this.baseUrl}/read?tableName=${this.tableName}&_id=${id}`;
    const token = await this.getToken();

    const response = await fetch(url, {
      method: "GET",
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.status === 200) {
      const data = (await response.json()) as any[];
      if (data.length > 0) {
        return CourseModel.fromMap(data[0]);
      }
    }
    return null;
  }

  async listByTeacher(teacherId: string): Promise<CourseModel[]> {
    const url = `${this.baseUrl}/read?tableName=${this.tableName}&teacher_id=${teacherId}`;
    const token = await this.getToken();

    const response = await fetch(url, {
      method: "GET",
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.status === 200) {
      const data = (await response.json()) as any[];
      return data.map(m => CourseModel.fromMap(m));
    }
    return [];
  }

  async update(course: CourseModel): Promise<CourseModel> {
    if (!course.id) {
      throw new Error("❌ Se requiere ID para actualizar");
    }

    const body = {
      "tableName": this.tableName,
      "idColumn": "_id",
      "idValue": course.id,
      "updates": {
        "name": course.name,
        "code": course.code,
        "teacher_id": course.teacherId,
        "max_students": course.maxStudents,
      },
    };
    
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/update`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 200) {
      const data = await response.json();
      return CourseModel.fromMap(data);
    } else {
      throw new Error(`❌ Error actualizando curso: ${await response.text()}`);
    }
  }

  async countByTeacher(teacherId: string): Promise<number> {
    const url = `${this.baseUrl}/read?tableName=${this.tableName}&teacher_id=${teacherId}`;
    const token = await this.getToken();

    const response = await fetch(url, {
      method: "GET",
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.status === 200) {
      const data = (await response.json()) as any[];
      // console.log(`Cursos encontrados: ${data.length}`);
      return data.length;
    } else {
      throw new Error(`❌ Error contando cursos: ${await response.text()}`);
    }
  }

  async delete(id: string): Promise<void> {
    const body = { "tableName": this.tableName, "idColumn": "_id", "idValue": id };
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/delete`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      throw new Error(`❌ Error eliminando curso: ${await response.text()}`);
    }
  }

  async getByCode(code: string): Promise<CourseModel | null> {
    const url = `${this.baseUrl}/read?tableName=${this.tableName}&code=${code}`;
    const token = await this.getToken();

    const response = await fetch(url, {
      method: "GET",
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.status === 200 || response.status === 201) {
      const data = (await response.json()) as any[];
      if (data.length > 0) {
        return CourseModel.fromMap(data[0]);
      }
    }
    return null;
  }
}