import { Course, NewCourse } from "../../domain/entities/Course";
import { CourseRepository } from "../../domain/repositories/CourseRepository";
import { CourseDataSource } from "../datasources/CourseRemoteDataSource";

export class CourseRepositoryImpl implements CourseRepository {
  constructor(private remote: CourseDataSource) {}

  async create(course: NewCourse): Promise<Course> {
    return this.remote.create(course);
  }

  async getById(id: string): Promise<Course | undefined> {
    return this.remote.getById(id);
  }

  async getByCode(code: string): Promise<Course | undefined> {
    return this.remote.getByCode(code);
  }

  async listByTeacher(teacherId: string): Promise<Course[]> {
    return this.remote.listByTeacher(teacherId);
  }

  async update(course: Course): Promise<Course> {
    return this.remote.update(course);
  }

  async delete(id: string): Promise<void> {
    return this.remote.delete(id);
  }

  async countByTeacher(teacherId: string): Promise<number> {
    return this.remote.countByTeacher(teacherId);
  }
}
export default CourseRepositoryImpl;


