/**
 * @fileoverview Implementación del datasource de UserGroup usando Roble API.
 */
import { getAuthSessionData } from '@/src/core/utils/getAuthSession';
import { UserGroup } from '../../domain/entities/UserGroup';
import { UserGroupDataSource } from './UserGroupDataSource';

const PROJECT_ID = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID;
const BASE_URL = `https://roble-api.openlab.uninorte.edu.co/database/${PROJECT_ID}`;

export class UserGroupRobleDataSource extends UserGroupDataSource {
  async getUserGroupsByGroupId(groupId: string): Promise<UserGroup[]> {
    try {
      console.log('🔍 getUserGroupsByGroupId:', groupId);
      const session = await getAuthSessionData();
      if (!session?.token) throw new Error('No autenticado');

      const url = `${BASE_URL}/read?tableName=user_groups&group_id=${groupId}`;
      console.log('📡 GET:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`⚠️ Error ${response.status}:`, errorText);
        return [];
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        console.log('📭 No hay inscripciones en este grupo');
        return [];
      }

      const inscriptions = data.map((item: any) => UserGroup.fromJson(item));
      console.log('✅ Inscripciones obtenidas:', inscriptions.length);
      return inscriptions;
    } catch (e: any) {
      console.error('❌ Exception en getUserGroupsByGroupId:', e);
      return [];
    }
  }

  async getUserGroupByCategoryId(userId: string, categoryId: string): Promise<UserGroup | null> {
    try {
      console.log('🔍 getUserGroupByCategoryId:', { userId, categoryId });
      const session = await getAuthSessionData();
      if (!session?.token) throw new Error('No autenticado');

      // Primero obtenemos todos los grupos de la categoría usando el endpoint correcto
      const groupsUrl = `${BASE_URL}/read?tableName=groups&category_id=${categoryId}`;
      console.log('📡 GET grupos de categoría:', groupsUrl);
      
      const groupsResponse = await fetch(groupsUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!groupsResponse.ok) {
        const errorText = await groupsResponse.text();
        console.log('❌ Error al obtener grupos:', groupsResponse.status, errorText);
        return null;
      }

      const groups = await groupsResponse.json();
      console.log('✅ Grupos encontrados:', Array.isArray(groups) ? groups.length : 0);
      
      if (!Array.isArray(groups) || groups.length === 0) {
        console.log('📭 No hay grupos en esta categoría');
        return null;
      }

      const groupIds = groups.map((g: any) => g._id);
      console.log('🔍 Buscando inscripción del usuario en estos grupos:', groupIds);

      // Buscar si el usuario está inscrito en alguno de esos grupos
      for (const groupId of groupIds) {
        const url = `${BASE_URL}/read?tableName=user_groups&user_id=${userId}&group_id=${groupId}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            console.log('✅ Usuario inscrito en grupo:', data[0]);
            return UserGroup.fromJson(data[0]);
          }
        }
      }

      console.log('📭 Usuario no inscrito en ningún grupo de esta categoría');
      return null;
    } catch (e: any) {
      console.error('❌ Exception en getUserGroupByCategoryId:', e);
      return null;
    }
  }

  async getUserGroupByUserIdAndGroupId(userId: string, groupId: string): Promise<UserGroup | null> {
    try {
      console.log('🔍 getUserGroupByUserIdAndGroupId:', { userId, groupId });
      const session = await getAuthSessionData();
      if (!session?.token) throw new Error('No autenticado');

      const url = `${BASE_URL}/read?tableName=user_groups&user_id=${userId}&group_id=${groupId}`;
      console.log('📡 GET:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`⚠️ Error ${response.status}:`, errorText);
        return null;
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        console.log('📭 No encontrado');
        return null;
      }

      console.log('✅ Inscripción encontrada:', data[0]);
      return UserGroup.fromJson(data[0]);
    } catch (e: any) {
      console.error('❌ Exception en getUserGroupByUserIdAndGroupId:', e);
      return null;
    }
  }

  async createUserGroup(userGroup: UserGroup): Promise<UserGroup> {
    console.log('➕ createUserGroup:', userGroup.toString());
    const session = await getAuthSessionData();
    if (!session?.token) throw new Error('No autenticado');

    const body = {
      user_id: userGroup.userId,
      group_id: userGroup.groupId,
    };

    const url = `${BASE_URL}/user_groups`;
    console.log('📡 POST:', url, body);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', errorText);
      throw new Error(`Error al inscribirse al grupo: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Inscripción creada:', data);
    return UserGroup.fromJson(data[0]);
  }

  async deleteUserGroup(id: string): Promise<void> {
    console.log('🗑️ deleteUserGroup:', id);
    const session = await getAuthSessionData();
    if (!session?.token) throw new Error('No autenticado');

    const url = `${BASE_URL}/user_groups`;
    const body = {
      tableName: 'user_groups',
      idColumn: '_id',
      idValue: id,
    };

    console.log('📡 DELETE:', url, body);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error al salir del grupo:', errorText);
      throw new Error(`Error al salir del grupo: ${response.status}`);
    }

    console.log('✅ Inscripción eliminada');
  }

  async countUsersByGroupId(groupId: string): Promise<number> {
    try {
      console.log('🔢 countUsersByGroupId:', groupId);
      const session = await getAuthSessionData();
      if (!session?.token) throw new Error('No autenticado');

      const url = `${BASE_URL}/read?tableName=user_groups&group_id=${groupId}`;
      console.log('📡 GET:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`⚠️ Error ${response.status}:`, errorText);
        return 0;
      }

      const data = await response.json();
      const count = Array.isArray(data) ? data.length : 0;
      console.log('✅ Total usuarios en grupo:', count);
      return count;
    } catch (e: any) {
      console.error('❌ Exception en countUsersByGroupId:', e);
      return 0;
    }
  }
}
