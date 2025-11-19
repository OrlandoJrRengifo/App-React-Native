/**
 * @fileoverview Implementación del DataSource de categorías usando Roble API.
 */
import { ILocalPreferences } from '@/src/core/iLocalPreferences';
import { Category } from '../../domain/entities/Category';
import { CategoryDataSource } from './CategoryDataSource';

const PROJECT_ID = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID;
const BASE_URL = `https://roble-api.openlab.uninorte.edu.co/database/${PROJECT_ID}`;

export class CategoryRobleDataSource implements CategoryDataSource {
  private readonly baseUrl: string;
  private readonly tableName = 'categories';

  constructor(private prefs: ILocalPreferences) {
    if (!PROJECT_ID) {
      throw new Error('Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var for Roble DB');
    }
    this.baseUrl = BASE_URL;
  }

  private async getToken(): Promise<string> {
    const token = await this.prefs.retrieveData<string>('token');
    if (!token) {
      throw new Error('No token found for Roble DB access.');
    }
    return token;
  }

  async createCategory(category: Category): Promise<Category> {
    try {
      const token = await this.getToken();
      const bodyPayload = {
        tableName: this.tableName,
        records: [category.toJson()],
      };

      console.log('📝 Creando categoría:', category.name);

      const response = await fetch(`${this.baseUrl}/insert`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (response.status === 201 || response.status === 200) {
        const data = await response.json();
        if (data['inserted'] && data['inserted'].length > 0) {
          console.log('✅ Categoría creada exitosamente');
          return Category.fromJson(data['inserted'][0]);
        }
      }

      const errorText = await response.text();
      throw new Error(`Error al crear categoría: ${response.status} - ${errorText}`);
    } catch (e: any) {
      console.error('❌ Exception en createCategory:', e);
      throw e;
    }
  }

  async updateCategory(category: Category): Promise<Category> {
    try {
      const token = await this.getToken();
      const bodyPayload = {
        tableName: this.tableName,
        _id: category.id,
        updatedRecord: category.toJson(),
      };

      console.log('📝 Actualizando categoría:', category.id);

      const response = await fetch(`${this.baseUrl}/update`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (response.status === 200) {
        const data = await response.json();
        if (data['updated']) {
          console.log('✅ Categoría actualizada exitosamente');
          return Category.fromJson(data['updated']);
        }
      }

      const errorText = await response.text();
      throw new Error(`Error al actualizar categoría: ${response.status} - ${errorText}`);
    } catch (e: any) {
      console.error('❌ Exception en updateCategory:', e);
      throw e;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      const bodyPayload = {
        tableName: this.tableName,
        idColumn: '_id',
        idValue: id,
      };

      console.log('🗑️ Eliminando categoría:', id);
      console.log('📦 Body payload:', JSON.stringify(bodyPayload));

      const response = await fetch(`${this.baseUrl}/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      console.log('📡 Delete response status:', response.status);
      
      if (response.status === 200) {
        console.log('✅ Categoría eliminada exitosamente');
        return true;
      }

      const errorText = await response.text();
      console.error('❌ Error al eliminar categoría:', response.status, errorText);
      return false;
    } catch (e: any) {
      console.error('❌ Exception en deleteCategory:', e);
      return false;
    }
  }

  async getCategoriesByCourse(courseId: string): Promise<Category[]> {
    try {
      const token = await this.getToken();
      const url = `${this.baseUrl}/read?tableName=${this.tableName}&course_id=${courseId}`;

      console.log('📚 Obteniendo categorías del curso:', courseId);
      console.log('🔗 URL completa:', url);
      console.log('📋 Table name:', this.tableName);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      const responseText = await response.text();
      console.log('📄 Response body:', responseText);

      if (response.status === 200) {
        const data = JSON.parse(responseText);
        console.log('📦 Parsed data:', data);
        console.log('📊 Is array?', Array.isArray(data));
        
        if (Array.isArray(data)) {
          console.log(`✅ Se encontraron ${data.length} categorías`);
          const categories = data.map((json) => Category.fromJson(json));
          console.log('🎯 Categories mapped:', categories);
          return categories;
        }
      }

      console.log('⚠️ No se encontraron categorías para el curso');
      return [];
    } catch (e: any) {
      console.error('❌ Exception en getCategoriesByCourse:', e);
      console.error('❌ Error stack:', e.stack);
      return [];
    }
  }

  async getCategory(id: string): Promise<Category | null> {
    try {
      const token = await this.getToken();
      const url = `${this.baseUrl}/read?tableName=${this.tableName}&_id=${id}`;

      console.log('🔍 Buscando categoría:', id);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          console.log('✅ Categoría encontrada');
          return Category.fromJson(data[0]);
        }
      }

      console.log('⚠️ Categoría no encontrada');
      return null;
    } catch (e: any) {
      console.error('❌ Exception en getCategory:', e);
      return null;
    }
  }
}
