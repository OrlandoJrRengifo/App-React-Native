import { useState } from 'react';
import { FakeUser } from '../../domain/entities/FakeUser';
import { FakeUserUseCase } from '../../domain/usecases/FakeUserUseCase';

/**
 * Define la interfaz del Hook para uso en componentes.
 */
export interface UseFakeUsersController {
  users: FakeUser[];
  isLoading: boolean;
  error: string | null;
  
  createUserIfNotExists: (params: { authId: string, email: string, name: string }) => Promise<FakeUser | null>;
  getUsersByIds: (ids: string[]) => Promise<FakeUser[]>;
  fetchUsers: () => Promise<void>;
}

/**
 * Hook personalizado para manejar la lógica de los FakeUsers.
 *
 * @param fakeUserUseCase La instancia del Caso de Uso inyectada.
 * @returns El objeto controlador con estado y funciones.
 */
export function useFakeUsers(fakeUserUseCase: FakeUserUseCase): UseFakeUsersController {
  const [users, setUsers] = useState<FakeUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 🔹 Verifica si existe un FakeUser por authId, si no lo crea.
   */
  const createUserIfNotExists = async ({ authId, email, name }: { authId: string, email: string, name: string }): Promise<FakeUser | null> => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Verificar existencia
      const existing = await fakeUserUseCase.getUserByAuthId(authId);
      if (existing) {
        // console.log("✅ FakeUser ya existe:", existing);
        return existing;
      }

      // 2. Crear si no existe
      const newUser = new FakeUser({ authId, email, name });
      const created = await fakeUserUseCase.createUser(newUser);

      if (created) {
        // console.log("✅ FakeUser creado:", created);
        return created;
      } else {
        setError("Error al crear el usuario en Roble.");
        return null;
      }
    } catch (e: any) {
      setError(e.message || "Ocurrió un error en la creación/verificación del usuario.");
      // console.error("❌ Exception en createUserIfNotExists:", e);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🔹 Obtener usuarios por lista de IDs de autenticación.
   */
  const getUsersByIds = async (ids: string[]): Promise<FakeUser[]> => {
    if (ids.length === 0) return [];
    
    setIsLoading(true);
    setError(null);
    try {
      const fetched = await fakeUserUseCase.getUsersByIds(ids);
      return fetched;
    } catch (e: any) {
      setError("Error al obtener usuarios por IDs.");
      // console.error("❌ Exception en getUsersByIds:", e);
      return [];
    } finally {
      setIsLoading(false);
    }
  };


  /**
   * 🔹 Traer todos los usuarios (y mantenerlos en el estado interno).
   */
  const fetchUsers = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const fetched = await fakeUserUseCase.getAllUsers();
      setUsers(fetched); // Actualiza el estado RxList equivalente
    } catch (e: any) {
      setError("Error al obtener todos los usuarios.");
      // console.error("❌ Exception en fetchUsers:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    isLoading,
    error,
    createUserIfNotExists,
    getUsersByIds,
    fetchUsers,
  };
}