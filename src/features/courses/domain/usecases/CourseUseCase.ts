// src/features/courses/domain/usecases/CourseUseCase.ts

import { Course, NewCourse } from "../entities/Course";
import { CourseRepository } from "../repositories/CourseRepository";

export class CreateCourseUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(data: NewCourse): Promise<Course> {
    // Validar límite de 3 cursos por usuario
    const currentCount = await this.repo.countByTeacher(data.teacher_id);
    if (currentCount >= 3) {
      throw new Error('No es posible crear más de 3 cursos');
    }

    return this.repo.create(data);
  }
}

export class UpdateCourseUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(course: Course): Promise<Course> {
    return this.repo.update(course);
  }
}

export class DeleteCourseUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}

export class GetCourseByIdUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(id: string): Promise<Course | undefined> {
    return this.repo.getById(id);
  }
}

export class GetCourseByCodeUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(code: string): Promise<Course | undefined> {
    return this.repo.getByCode(code);
  }
}

export class ListCoursesByTeacherUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(teacherId: string): Promise<Course[]> {
    return this.repo.listByTeacher(teacherId);
  }
}

export class CanCreateMoreCoursesUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(teacherId: string): Promise<boolean> {
    const count = await this.repo.countByTeacher(teacherId);
    return count < 3;
  }
}

export class LoadCoursesByIdsUseCase {
  constructor(private repo: CourseRepository) {}

  async execute(courseIds: string[]): Promise<Course[]> {
    const courses: Course[] = [];
    
    for (const id of courseIds) {
      const course = await this.repo.getById(id);
      if (course) {
        courses.push(course);
      }
    }
    
    return courses;
  }
}
export default {
  CreateCourseUseCase,
  UpdateCourseUseCase,
  DeleteCourseUseCase,
  GetCourseByIdUseCase,
  GetCourseByCodeUseCase,
  ListCoursesByTeacherUseCase,
  CanCreateMoreCoursesUseCase,
  LoadCoursesByIdsUseCase,
};