import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { FakeUser } from '../../domain/entities/FakeUser';
import { IFakeUserSource } from './IFakeUserSource';

// Nota: Asumo que ILocalPreferences está disponible en esta ruta.
// Se usa un mock si no está disponible, pero se mantiene la interfaz para la migración.

export class FakeUserRobleSource implements IFakeUserSource {
  private readonly baseUrl: string;
  private readonly tableName = "fake_users";

  // En una aplicación real, el constructor recibiría las preferencias a través de DI
  constructor(private prefs: ILocalPreferences, projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var for Roble DB");
    }
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${projectId}`;
  }

  private async getToken(): Promise<string> {
    const token = await this.prefs.retrieveData<string>('token');
    if (!token) {
      throw new Error("No token found for Roble DB access.");
    }
    return token;
  }

  async getUserByAuthId(authId: string): Promise<FakeUser | null> {
    try {
      const token = await this.getToken();
      const url = `${this.baseUrl}/read?tableName=${this.tableName}&auth_id=${authId}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return FakeUser.fromJson(data[0]);
        }
      } else {
        console.error("❌ getUserByAuthId error:", response.status, await response.text());
      }
    } catch (e) {
      console.error("❌ Exception in getUserByAuthId:", e);
    }
    return null;
  }

  async createUser(user: FakeUser): Promise<FakeUser | null> {
    try {
      const token = await this.getToken();
      const bodyPayload = {
        "tableName": this.tableName,
        "records": [user.toJson()],
      };

      const response = await fetch(`${this.baseUrl}/insert`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyPayload),
      });

      // console.log("👉 Creando FakeUser. Respuesta Roble:", response.status, await response.clone().text());

      if (response.status === 201 || response.status === 200) {
        const data = await response.json();
        if (data["inserted"] && data["inserted"].length > 0) {
          // Roble devuelve la lista de records insertados
          return FakeUser.fromJson(data["inserted"][0]);
        } else {
          console.warn("❌ No se insertó ningún FakeUser:", data);
        }
      } else {
        console.error("❌ createUser error:", response.status, await response.text());
      }
    } catch (e) {
      console.error("❌ Exception in createUser:", e);
    }
    return null;
  }

  async getUsersByIds(authIds: string[]): Promise<FakeUser[]> {
    // El código de Flutter hacía un loop síncrono, lo replicamos aquí.
    if (authIds.length === 0) return [];
    
    try {
      const token = await this.getToken();
      const results: FakeUser[] = [];

      for (const authId of authIds) {
        const url = `${this.baseUrl}/read?tableName=${this.tableName}&auth_id=${authId}`;
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            results.push(FakeUser.fromJson(data[0]));
          }
        } else {
          console.error(`❌ Error HTTP para auth_id=${authId}: ${response.status}`);
        }
      }
      
      // console.log("✅ getUsersByIds devolvió:", results.length, "usuarios");
      return results;

    } catch (e) {
      console.error("❌ Exception en DataSource.getUsersByIds:", e);
      return [];
    }
  }

  async getAllUsers(): Promise<FakeUser[]> {
    try {
      const token = await this.getToken();
      const bodyPayload = { "tableName": this.tableName };

      const response = await fetch(`${this.baseUrl}/find`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyPayload),
      });

      // console.log("👉 getAllUsers response:", response.status, await response.clone().text());

      if (response.status === 200) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return data.map(e => FakeUser.fromJson(e));
        }
      }
    } catch (e) {
      console.error("❌ Exception in getAllUsers:", e);
    }
    return [];
  }
}