import { Course, CourseParams } from '../entities/Course';
import { ICourseRepository } from '../repositories/ICourseRepository';

export class CourseUseCases {
  constructor(private repository: ICourseRepository) {}

  async createCourse({ name, code, teacherId, maxStudents, createdAt }: Omit<CourseParams, 'id'>): Promise<Course> {
    // Limite de 3 cursos por profesor
    const currentCount = await this.repository.countByTeacher(teacherId);
    if (currentCount >= 3) {
      throw new Error('No es posible crear más de 3 cursos');
    }

    const course = new Course({
      name,
      code,
      teacherId,
      maxStudents,
      createdAt: createdAt ?? new Date(), 
    });
    
    return this.repository.create(course);
  }

  deleteCourse(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  getCourse(id: string): Promise<Course | null> {
    return this.repository.getById(id);
  }

  getCourseByCode(code: string): Promise<Course | null> {
    return this.repository.getByCode(code);
  }

  listCoursesByTeacher(teacherId: string): Promise<Course[]> {
    return this.repository.listByTeacher(teacherId);
  }

  updateCourse(course: Course): Promise<Course> {
    return this.repository.update(course);
  }

  async canCreateMore(teacherId: string): Promise<boolean> {
    const count = await this.repository.countByTeacher(teacherId);
    return count < 3;
  }
}