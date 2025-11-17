
import { FakeUser } from '../entities/FakeUser';
import { IFakeUserRepository } from '../repositories/IFakeUserRepository';

export class FakeUserUseCase {
  private repository: IFakeUserRepository;

  constructor(repository: IFakeUserRepository) {
    this.repository = repository;
  }

  getUserByAuthId(authId: string): Promise<FakeUser | null> {
    return this.repository.getUserByAuthId(authId);
  }

  createUser(user: FakeUser): Promise<FakeUser | null> {
    return this.repository.createUser(user);
  }

  async getUsersByIds(ids: string[]): Promise<FakeUser[]> {
    // console.log("📡 UseCase.getUsersByIds con", ids);
    return this.repository.getUsersByIds(ids);
  }

  getAllUsers(): Promise<FakeUser[]> {
    return this.repository.getAllUsers();
  }
}