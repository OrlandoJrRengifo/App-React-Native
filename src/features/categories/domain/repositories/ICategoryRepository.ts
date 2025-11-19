/**
 * @fileoverview Contrato del Repositorio de Categorías.
 */
import { Category } from '../entities/Category';

export interface ICategoryRepository {
  createCategory(category: Category): Promise<Category>;
  updateCategory(category: Category): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;
  getCategoriesByCourse(courseId: string): Promise<Category[]>;
  getCategory(id: string): Promise<Category | null>;
}
