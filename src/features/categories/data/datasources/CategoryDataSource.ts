/**
 * @fileoverview DataSource abstracto para categorías.
 */
import { Category } from '../../domain/entities/Category';

export abstract class CategoryDataSource {
  abstract createCategory(category: Category): Promise<Category>;
  abstract updateCategory(category: Category): Promise<Category>;
  abstract deleteCategory(id: string): Promise<boolean>;
  abstract getCategoriesByCourse(courseId: string): Promise<Category[]>;
  abstract getCategory(id: string): Promise<Category | null>;
}
