import { Course } from '../entities/Course';

export interface ICourseRepository {
  create(course: Course): Promise<Course>;
  getById(id: string): Promise<Course | null>;
  getByCode(code: string): Promise<Course | null>;
  listByTeacher(teacherId: string): Promise<Course[]>;
  update(course: Course): Promise<Course>;
  delete(id: string): Promise<void>;
  countByTeacher(teacherId: string): Promise<number>;
}