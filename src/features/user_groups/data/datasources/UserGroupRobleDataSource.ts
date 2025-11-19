import { getAuthSessionData } from '@/src/core/utils/getAuthSession';
import { UserGroup } from '../../domain/entities/UserGroup';
import { UserGroupDataSource } from './UserGroupDataSource';

const PROJECT_ID = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID;
const BASE_URL = `https://roble-api.openlab.uninorte.edu.co/database/${PROJECT_ID}`;

export class UserGroupRobleDataSource extends UserGroupDataSource {
  async getUserGroupsByGroupId(groupId: string): Promise<UserGroup[]> {
    try {
      const session = await getAuthSessionData();
      if (!session?.token) throw new Error('No autenticado');

      const url = `${BASE_URL}/read?tableName=user_groups&group_id=${groupId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any) => UserGroup.fromJson(item));
    } catch (e: any) {
      console.error('Error getUserGroupsByGroupId:', e);
      return [];
    }
  }

  async getUserGroupByCategoryId(userId: string, categoryId: string): Promise<UserGroup | null> {
    try {
      const session = await getAuthSessionData();
      if (!session?.token) throw new Error('No autenticado');

      const groupsUrl = `${BASE_URL}/read?tableName=groups&category_id=${categoryId}`;
      const groupsResponse = await fetch(groupsUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!groupsResponse.ok) return null;

      const groups = await groupsResponse.json();
      if (!Array.isArray(groups) || groups.length === 0) return null;

      const groupIds = groups.map((g: any) => g._id);

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
            return UserGroup.fromJson(data[0]);
          }
        }
      }

      return null;
    } catch (e: any) {
      console.error('Error getUserGroupByCategoryId:', e);
      return null;
    }
  }

  async getUserGroupByUserIdAndGroupId(userId: string, groupId: string): Promise<UserGroup | null> {
    try {
      const session = await getAuthSessionData();
      if (!session?.token) throw new Error('No autenticado');

      const url = `${BASE_URL}/read?tableName=user_groups&user_id=${userId}&group_id=${groupId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      return UserGroup.fromJson(data[0]);
    } catch (e: any) {
      console.error('Error getUserGroupByUserIdAndGroupId:', e);
      return null;
    }
  }

  async createUserGroup(userGroup: UserGroup): Promise<UserGroup> {
    const session = await getAuthSessionData();
    if (!session?.token) throw new Error('No autenticado');

    const bodyPayload = {
      tableName: 'user_groups',
      records: [
        {
          user_id: userGroup.userId,
          group_id: userGroup.groupId,
        },
      ],
    };

    const url = `${BASE_URL}/insert`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error createUserGroup:', errorText);
      throw new Error(`Error al inscribirse al grupo: ${response.status}`);
    }

    const data = await response.json();
    if (data['inserted'] && data['inserted'].length > 0) {
      return UserGroup.fromJson(data['inserted'][0]);
    }

    throw new Error('No se pudo crear la inscripción');
  }

  async deleteUserGroup(id: string): Promise<void> {
    const session = await getAuthSessionData();
    if (!session?.token) throw new Error('No autenticado');

    const bodyPayload = {
      tableName: 'user_groups',
      idColumn: '_id',
      idValue: id,
    };

    const url = `${BASE_URL}/delete`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleteUserGroup:', errorText);
      throw new Error(`Error al salir del grupo: ${response.status}`);
    }
  }

  async countUsersByGroupId(groupId: string): Promise<number> {
    try {
      const session = await getAuthSessionData();
      if (!session?.token) throw new Error('No autenticado');

      const url = `${BASE_URL}/read?tableName=user_groups&group_id=${groupId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return 0;

      const data = await response.json();
      return Array.isArray(data) ? data.length : 0;
    } catch (e: any) {
      console.error('Error countUsersByGroupId:', e);
      return 0;
    }
  }
}
