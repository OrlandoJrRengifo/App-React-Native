/**
 * @fileoverview Use Case para crear una categoría y sus grupos automáticamente.
 */
import { Category, GroupingMethod } from '../../../categories/domain/entities/Category';
import { ICategoryRepository } from '../../../categories/domain/repositories/ICategoryRepository';
import { UserCourseRepository } from '../../../user_courses/domain/repositories/UserCourseRepository';
import { Group } from '../entities/Group';
import { IGroupRepository } from '../repositories/IGroupRepository';

export class CreateCategoryWithGroupsUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private groupRepository: IGroupRepository,
    private userCourseRepository: UserCourseRepository
  ) {
    console.log('CreateCategoryWithGroupsUseCase: Initialized.');
  }

  async execute(params: {
    courseId: string;
    name: string;
    groupingMethod: GroupingMethod;
    maxGroupSize: number;
  }): Promise<{ category: Category; groups: Group[] }> {
    console.log('-> CreateCategoryWithGroupsUseCase: Ejecutando...');

    // 1. Crear la categoría
    const category = new Category({
      courseId: params.courseId,
      name: params.name,
      groupingMethod: params.groupingMethod,
      maxGroupSize: params.maxGroupSize,
      createdAt: new Date(),
    });

    const createdCategory = await this.categoryRepository.createCategory(category);
    console.log(`✅ Categoría creada: ${createdCategory.id}`);

    // 2. Obtener el número de estudiantes inscritos en el curso
    const enrolledUsers = await this.userCourseRepository.getCourseUsers(params.courseId);
    const studentCount = enrolledUsers.length;
    console.log(`📊 Estudiantes inscritos en el curso: ${studentCount}`);

    // 3. Calcular y crear grupos automáticamente
    if (studentCount === 0) {
      console.log('⚠️ No hay estudiantes, no se crearán grupos');
      return { category: createdCategory, groups: [] };
    }

    const groupCount = Math.ceil(studentCount / params.maxGroupSize);
    console.log(`📊 Se crearán ${groupCount} grupos`);

    const groups: Group[] = [];
    for (let i = 1; i <= groupCount; i++) {
      groups.push(
        new Group({
          categoryId: createdCategory.id!,
          numeration: i,
          capacity: params.maxGroupSize,
        })
      );
    }

    const createdGroups = await this.groupRepository.createMultipleGroups(groups);
    console.log(`✅ ${createdGroups.length} grupos creados automáticamente`);

    return { category: createdCategory, groups: createdGroups };
  }
}
