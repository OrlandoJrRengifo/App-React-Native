/**
 * @fileoverview Implementación del DataSource de actividades usando Roble API.
 */
import { ILocalPreferences } from '@/src/core/iLocalPreferences';
import { Activity } from '../../domain/entities/activity';
import { IActivityDataSource } from './i_activity_source';

const PROJECT_ID = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID;
const BASE_URL = `https://roble-api.openlab.uninorte.edu.co/database/${PROJECT_ID}`;

export class ActivityRobleDataSource implements IActivityDataSource {
  private readonly baseUrl: string;
  private readonly tableName = 'activities';

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

  async createActivity(categoryId: string, name: string): Promise<Activity | null> {
    try {
      const token = await this.getToken();
      const bodyPayload = {
        tableName: this.tableName,
        records: [
          {
            category_id: categoryId,
            name: name,
            activated: false,
          },
        ],
      };

      console.log('📝 Creando actividad:', name);

      const response = await fetch(`${this.baseUrl}/insert`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (response.status === 200 || response.status === 201) {
        const data = await response.json();
        
        if (data['inserted'] && data['inserted'].length > 0) {
          console.log('✅ Actividad creada exitosamente');
          return Activity.fromJson(data['inserted'][0]);
        } else if (data['skipped'] && data['skipped'].length > 0) {
          console.log('⚠️ Actividad omitida:', data['skipped']);
          return null;
        }
      }

      const errorText = await response.text();
      console.error('❌ Error al crear actividad:', response.status, errorText);
      return null;
    } catch (e: any) {
      console.error('❌ Exception en createActivity:', e);
      return null;
    }
  }

  async getActivitiesByCategory(categoryId: string): Promise<Activity[]> {
    try {
      const token = await this.getToken();
      const url = `${this.baseUrl}/read?tableName=${this.tableName}&category_id=${categoryId}`;

      console.log('📚 Obteniendo actividades de la categoría:', categoryId);

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
          console.log(`✅ Se encontraron ${data.length} actividades`);
          return data.map((json) => Activity.fromJson(json));
        }
      } else {
        console.error('❌ Error obteniendo actividades:', response.status, await response.text());
      }

      return [];
    } catch (e: any) {
      console.error('❌ Exception en getActivitiesByCategory:', e);
      return [];
    }
  }

  async activateActivity(activityId: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      const bodyPayload = {
        tableName: this.tableName,
        idColumn: '_id',
        idValue: activityId,
        updates: { activated: true },
      };

      console.log('✅ Activando actividad:', activityId);

      const response = await fetch(`${this.baseUrl}/update`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (response.status !== 200) {
        console.error('❌ Error activando actividad:', response.status, await response.text());
        return false;
      }

      console.log('✅ Actividad activada exitosamente');
      return true;
    } catch (e: any) {
      console.error('❌ Exception en activateActivity:', e);
      return false;
    }
  }

  async updateActivityName(activityId: string, newName: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      const bodyPayload = {
        tableName: this.tableName,
        idColumn: '_id',
        idValue: activityId,
        updates: { name: newName },
      };

      console.log('📝 Actualizando nombre de actividad:', activityId);

      const response = await fetch(`${this.baseUrl}/update`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (response.status !== 200) {
        console.error('❌ Error actualizando nombre:', response.status, await response.text());
        return false;
      }

      console.log('✅ Nombre actualizado exitosamente');
      return true;
    } catch (e: any) {
      console.error('❌ Exception en updateActivityName:', e);
      return false;
    }
  }

  async deleteActivity(activityId: string): Promise<boolean> {
    try {
      const token = await this.getToken();
      const bodyPayload = {
        tableName: this.tableName,
        idColumn: '_id',
        idValue: activityId,
      };

      console.log('🗑️ Eliminando actividad:', activityId);

      const response = await fetch(`${this.baseUrl}/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (response.status !== 200) {
        console.error('❌ Error eliminando actividad:', response.status, await response.text());
        return false;
      }

      console.log('✅ Actividad eliminada exitosamente');
      return true;
    } catch (e: any) {
      console.error('❌ Exception en deleteActivity:', e);
      return false;
    }
  }
}