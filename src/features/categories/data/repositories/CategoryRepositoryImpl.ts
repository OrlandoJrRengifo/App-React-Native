/**
 * @fileoverview Implementación del repositorio de categorías.
 */
import { Category } from '../../domain/entities/Category';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { CategoryDataSource } from '../datasources/CategoryDataSource';

export class CategoryRepositoryImpl implements ICategoryRepository {
  constructor(private dataSource: CategoryDataSource) {
    console.log('CategoryRepositoryImpl: Initialized.');
  }

  createCategory(category: Category): Promise<Category> {
    console.log('-> CategoryRepository: Creating category.');
    return this.dataSource.createCategory(category);
  }

  updateCategory(category: Category): Promise<Category> {
    console.log('-> CategoryRepository: Updating category.');
    return this.dataSource.updateCategory(category);
  }

  deleteCategory(id: string): Promise<boolean> {
    console.log('-> CategoryRepository: Deleting category.');
    return this.dataSource.deleteCategory(id);
  }

  getCategoriesByCourse(courseId: string): Promise<Category[]> {
    console.log('-> CategoryRepository: Getting categories by course.');
    return this.dataSource.getCategoriesByCourse(courseId);
  }

  getCategory(id: string): Promise<Category | null> {
    console.log('-> CategoryRepository: Getting category by id.');
    return this.dataSource.getCategory(id);
  }
}
