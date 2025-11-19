/**
 * @fileoverview Implementación del DataSource de grupos usando Roble API.
 */
import { ILocalPreferences } from '@/src/core/iLocalPreferences';
import { Group } from '../../domain/entities/Group';
import { GroupDataSource } from './GroupDataSource';

const PROJECT_ID = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID;
const BASE_URL = `https://roble-api.openlab.uninorte.edu.co/database/${PROJECT_ID}`;

export class GroupRobleDataSource implements GroupDataSource {
  private readonly baseUrl: string;
  private readonly tableName = 'groups';

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

  async createGroup(group: Group): Promise<Group> {
    try {
      const token = await this.getToken();
      const bodyPayload = {
        tableName: this.tableName,
        records: [group.toJson()],
      };

      console.log('📝 Creando grupo:', group.numeration);

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
          console.log('✅ Grupo creado exitosamente');
          return Group.fromJson(data['inserted'][0]);
        }
      }

      const errorText = await response.text();
      throw new Error(`Error al crear grupo: ${response.status} - ${errorText}`);
    } catch (e: any) {
      console.error('❌ Exception en createGroup:', e);
      throw e;
    }
  }

  async createMultipleGroups(groups: Group[]): Promise<Group[]> {
    try {
      const token = await this.getToken();
      const bodyPayload = {
        tableName: this.tableName,
        records: groups.map(g => g.toJson()),
      };

      console.log(`📝 Creando ${groups.length} grupos...`);

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
          console.log(`✅ ${data['inserted'].length} grupos creados exitosamente`);
          return data['inserted'].map((json: any) => Group.fromJson(json));
        }
      }

      const errorText = await response.text();
      throw new Error(`Error al crear grupos: ${response.status} - ${errorText}`);
    } catch (e: any) {
      console.error('❌ Exception en createMultipleGroups:', e);
      throw e;
    }
  }

  async updateGroup(group: Group): Promise<Group> {
    try {
      const token = await this.getToken();
      const bodyPayload = {
        tableName: this.tableName,
        _id: group.id,
        updatedRecord: group.toJson(),
      };

      console.log('📝 Actualizando grupo:', group.id);

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
          console.log('✅ Grupo actualizado exitosamente');
          return Group.fromJson(data['updated']);
        }
      }

      const errorText = await response.text();
      throw new Error(`Error al actualizar grupo: ${response.status} - ${errorText}`);
    } catch (e: any) {
      console.error('❌ Exception en updateGroup:', e);
      throw e;
    }
  }

  async deleteGroup(id: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      const bodyPayload = {
        tableName: this.tableName,
        idColumn: '_id',
        idValue: id,
      };

      console.log('🗑️ Eliminando grupo:', id);

      const response = await fetch(`${this.baseUrl}/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (response.status === 200) {
        console.log('✅ Grupo eliminado exitosamente');
        return true;
      }

      const errorText = await response.text();
      console.error('❌ Error al eliminar grupo:', response.status, errorText);
      return false;
    } catch (e: any) {
      console.error('❌ Exception en deleteGroup:', e);
      return false;
    }
  }

  async getGroupsByCategory(categoryId: string): Promise<Group[]> {
    try {
      const token = await this.getToken();
      const url = `${this.baseUrl}/read?tableName=${this.tableName}&category_id=${categoryId}`;

      console.log('📚 Obteniendo grupos de la categoría:', categoryId);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        if (Array.isArray(data)) {
          console.log(`✅ Se encontraron ${data.length} grupos`);
          return data.map((json) => Group.fromJson(json));
        }
      }

      console.log('⚠️ No se encontraron grupos para la categoría');
      return [];
    } catch (e: any) {
      console.error('❌ Exception en getGroupsByCategory:', e);
      return [];
    }
  }

  async getGroup(id: string): Promise<Group | null> {
    try {
      const token = await this.getToken();
      const url = `${this.baseUrl}/read?tableName=${this.tableName}&_id=${id}`;

      console.log('🔍 Buscando grupo:', id);

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
          console.log('✅ Grupo encontrado');
          return Group.fromJson(data[0]);
        }
      }

      console.log('⚠️ Grupo no encontrado');
      return null;
    } catch (e: any) {
      console.error('❌ Exception en getGroup:', e);
      return null;
    }
  }

  async getHighestNumerationByCategory(categoryId: string): Promise<number> {
    try {
      const groups = await this.getGroupsByCategory(categoryId);
      if (groups.length === 0) return 0;
      
      const highestNumeration = Math.max(...groups.map(g => g.numeration));
      console.log(`🔢 Numeración más alta en categoría ${categoryId}: ${highestNumeration}`);
      return highestNumeration;
    } catch (e: any) {
      console.error('❌ Exception en getHighestNumerationByCategory:', e);
      return 0;
    }
  }
}
