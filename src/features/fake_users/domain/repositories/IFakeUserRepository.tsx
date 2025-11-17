/**
 * @fileoverview Contrato del Repositorio de Usuarios Falsos.
 * Define las operaciones disponibles para el dominio.
 */
import { FakeUser } from '../entities/FakeUser';

export interface IFakeUserRepository {
  getUserByAuthId(authId: string): Promise<FakeUser | null>;
  createUser(user: FakeUser): Promise<FakeUser | null>;
  getUsersByIds(ids: string[]): Promise<FakeUser[]>;
  getAllUsers(): Promise<FakeUser[]>;
}