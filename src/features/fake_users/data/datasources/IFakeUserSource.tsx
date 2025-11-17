import { FakeUser } from '../../domain/entities/FakeUser';

export interface IFakeUserSource {
  getUserByAuthId(authId: string): Promise<FakeUser | null>;
  createUser(user: FakeUser): Promise<FakeUser | null>;
  getUsersByIds(ids: string[]): Promise<FakeUser[]>;
  getAllUsers(): Promise<FakeUser[]>;
}