import { Course, NewCourse } from "../../domain/entities/Course";

export interface CourseDataSource {
  create(course: NewCourse): Promise<Course>;
  getById(id: string): Promise<Course | undefined>;
  getByCode(code: string): Promise<Course | undefined>;
  listByTeacher(teacherId: string): Promise<Course[]>;
  update(course: Course): Promise<Course>;
  delete(id: string): Promise<void>;
  countByTeacher(teacherId: string): Promise<number>;
}