import { CourseModel } from '../models/CourseModel';

export interface ICourseRobleDataSource {
  create(course: CourseModel): Promise<CourseModel>;
  getById(id: string): Promise<CourseModel | null>;
  listByTeacher(teacherId: string): Promise<CourseModel[]>;
  update(course: CourseModel): Promise<CourseModel>;
  countByTeacher(teacherId: string): Promise<number>;
  delete(id: string): Promise<void>;
  getByCode(code: string): Promise<CourseModel | null>;
}