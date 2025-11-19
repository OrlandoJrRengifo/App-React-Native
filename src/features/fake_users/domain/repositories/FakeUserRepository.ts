/**
 * @fileoverview Interfaz del repositorio de FakeUser.
 */
import { FakeUser } from '../entities/FakeUser';

export abstract class FakeUserRepository {
  abstract getUserById(id: string): Promise<FakeUser | null>;
  abstract getUsersByIds(ids: string[]): Promise<FakeUser[]>;
  abstract getAllUsers(): Promise<FakeUser[]>;
}
