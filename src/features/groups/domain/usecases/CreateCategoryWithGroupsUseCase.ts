/**
 * @fileoverview Use Case para crear una categoría y sus grupos automáticamente.
 */
import { Category, GroupingMethod } from '../../../categories/domain/entities/Category';
import { ICategoryRepository } from '../../../categories/domain/repositories/ICategoryRepository';
import { UserCourseRepository } from '../../../user_courses/domain/repositories/UserCourseRepository';
import { UserGroup } from '../../../user_groups/domain/entities/UserGroup';
import { UserGroupRepository } from '../../../user_groups/domain/repositories/UserGroupRepository';
import { Group } from '../entities/Group';
import { IGroupRepository } from '../repositories/IGroupRepository';

export class CreateCategoryWithGroupsUseCase {
  constructor(
    private categoryRepository: ICategoryRepository,
    private groupRepository: IGroupRepository,
    private userCourseRepository: UserCourseRepository,
    private userGroupRepository: UserGroupRepository
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

    // 4. Si el método es 'random', asignar estudiantes automáticamente
    if (params.groupingMethod === 'random') {
      await this.assignStudentsRandomly(enrolledUsers, createdGroups, params.maxGroupSize);
    }

    return { category: createdCategory, groups: createdGroups };
  }

  /**
   * Asigna estudiantes de manera aleatoria a los grupos, llenando uno por uno hasta completarlos.
   */
  private async assignStudentsRandomly(
    students: any[],
    groups: Group[],
    maxGroupSize: number
  ): Promise<void> {
    console.log('🎲 Iniciando asignación aleatoria de estudiantes...');

    // Copiar y mezclar aleatoriamente el array de estudiantes
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    console.log(`📋 ${shuffledStudents.length} estudiantes para asignar`);

    let currentGroupIndex = 0;
    let studentsInCurrentGroup = 0;

    for (const student of shuffledStudents) {
      const currentGroup = groups[currentGroupIndex];
      
      // Crear la asignación del estudiante al grupo
      const userGroup = new UserGroup({
        userId: student.userId,
        groupId: currentGroup.id!,
      });

      try {
        await this.userGroupRepository.createUserGroup(userGroup);
        studentsInCurrentGroup++;
        console.log(`✅ Estudiante ${student.userId} asignado a Grupo ${currentGroup.numeration}`);

        // Si el grupo actual se llenó, pasar al siguiente
        if (studentsInCurrentGroup >= maxGroupSize && currentGroupIndex < groups.length - 1) {
          console.log(`🔄 Grupo ${currentGroup.numeration} lleno, pasando al siguiente...`);
          currentGroupIndex++;
          studentsInCurrentGroup = 0;
        }
      } catch (e) {
        console.error(`❌ Error asignando estudiante ${student.userId}:`, e);
      }
    }

    console.log('✅ Asignación aleatoria completada');
  }
}
