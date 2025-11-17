import { Course } from '../../domain/entities/Course';
import { ICourseRepository } from '../../domain/repositories/ICourseRepository';
import { ICourseRobleDataSource } from '../datasources/ICourseRobleDataSource';
import { CourseModel } from '../models/CourseModel';

export class CourseRepository implements ICourseRepository {
  constructor(private robleDataSource: ICourseRobleDataSource) {}

  async create(course: Course): Promise<Course> {
    const model = CourseModel.fromEntity(course);
    
    const savedModel = await this.robleDataSource.create(model);
    
    return savedModel;
  }

  async delete(id: string): Promise<void> {
    return this.robleDataSource.delete(id);
  }

  async getById(id: string): Promise<Course | null> {
    return this.robleDataSource.getById(id);
  }

  async getByCode(code: string): Promise<Course | null> {
    return this.robleDataSource.getByCode(code);
  }

  async listByTeacher(teacherId: string): Promise<Course[]> {
    return this.robleDataSource.listByTeacher(teacherId);
  }

  async update(course: Course): Promise<Course> {
    const model = CourseModel.fromEntity(course);
    
    const updatedModel = await this.robleDataSource.update(model);
    
    return updatedModel;
  }

  async countByTeacher(teacherId: string): Promise<number> {
    return this.robleDataSource.countByTeacher(teacherId);
  }
}