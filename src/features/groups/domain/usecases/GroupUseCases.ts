/**
 * @fileoverview Use Cases para grupos.
 */
import { Group } from '../entities/Group';
import { IGroupRepository } from '../repositories/IGroupRepository';

export class GroupUseCases {
  constructor(private repository: IGroupRepository) {
    console.log('GroupUseCases: Initialized.');
  }

  /**
   * Crea grupos automáticamente para una categoría.
   * Calcula la cantidad de grupos necesarios basándose en el número de estudiantes y el tamaño máximo del grupo.
   * @param categoryId - ID de la categoría
   * @param studentCount - Número de estudiantes en el curso
   * @param maxGroupSize - Tamaño máximo del grupo (capacity)
   * @returns Array de grupos creados
   */
  async createGroupsForCategory(
    categoryId: string,
    studentCount: number,
    maxGroupSize: number
  ): Promise<Group[]> {
    console.log(`-> GroupUseCases: Creando grupos automáticos para categoría ${categoryId}`);
    console.log(`   Estudiantes: ${studentCount}, Max size: ${maxGroupSize}`);

    // Calcular cantidad de grupos necesarios (redondeo hacia arriba)
    const groupCount = Math.ceil(studentCount / maxGroupSize);
    console.log(`   📊 Se crearán ${groupCount} grupos`);

    // Crear array de grupos
    const groups: Group[] = [];
    for (let i = 1; i <= groupCount; i++) {
      groups.push(
        new Group({
          categoryId,
          numeration: i,
          capacity: maxGroupSize,
        })
      );
    }

    // Insertar todos los grupos en una sola operación
    return this.repository.createMultipleGroups(groups);
  }

  /**
   * Crea un nuevo grupo manual con la siguiente numeración disponible.
   * @param categoryId - ID de la categoría
   * @param capacity - Capacidad del grupo
   * @returns Grupo creado
   */
  async createGroup(categoryId: string, capacity: number): Promise<Group> {
    console.log('-> GroupUseCases: Creating single group.');

    // Obtener la numeración más alta actual
    const highestNumeration = await this.repository.getHighestNumerationByCategory(categoryId);
    const newNumeration = highestNumeration + 1;

    console.log(`   📊 Nueva numeración: ${newNumeration}`);

    const group = new Group({
      categoryId,
      numeration: newNumeration,
      capacity,
    });

    return this.repository.createGroup(group);
  }

  async updateGroup(group: Group): Promise<Group> {
    console.log('-> GroupUseCases: Updating group.');
    return this.repository.updateGroup(group);
  }

  async deleteGroup(id: string): Promise<boolean> {
    console.log('-> GroupUseCases: Deleting group.');
    return this.repository.deleteGroup(id);
  }

  async getGroupsByCategory(categoryId: string): Promise<Group[]> {
    console.log('-> GroupUseCases: Getting groups by category.');
    return this.repository.getGroupsByCategory(categoryId);
  }

  async getGroup(id: string): Promise<Group | null> {
    console.log('-> GroupUseCases: Getting group by id.');
    return this.repository.getGroup(id);
  }
}
