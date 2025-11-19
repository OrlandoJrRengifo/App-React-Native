/**
 * @fileoverview Use Cases para categorías.
 */
import { Category, GroupingMethod } from '../entities/Category';
import { ICategoryRepository } from '../repositories/ICategoryRepository';

export class CategoryUseCases {
  constructor(private repository: ICategoryRepository) {
    console.log('CategoryUseCases: Initialized.');
  }

  async createCategory(params: {
    courseId: string;
    name: string;
    groupingMethod: GroupingMethod;
    maxGroupSize: number;
  }): Promise<Category> {
    console.log('-> CategoryUseCases: Creating category.');
    const category = new Category({
      courseId: params.courseId,
      name: params.name,
      groupingMethod: params.groupingMethod,
      maxGroupSize: params.maxGroupSize,
      createdAt: new Date(),
    });
    return this.repository.createCategory(category);
  }

  async updateCategory(category: Category): Promise<Category> {
    console.log('-> CategoryUseCases: Updating category.');
    return this.repository.updateCategory(category);
  }

  async deleteCategory(id: string): Promise<boolean> {
    console.log('-> CategoryUseCases: Deleting category.');
    return this.repository.deleteCategory(id);
  }

  async getCategoriesByCourse(courseId: string): Promise<Category[]> {
    console.log('-> CategoryUseCases: Getting categories by course.');
    return this.repository.getCategoriesByCourse(courseId);
  }

  async getCategory(id: string): Promise<Category | null> {
    console.log('-> CategoryUseCases: Getting category by id.');
    return this.repository.getCategory(id);
  }
}
