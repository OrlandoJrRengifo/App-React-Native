import { FakeUser } from '../../domain/entities/FakeUser';
import { IFakeUserRepository } from '../../domain/repositories/IFakeUserRepository';
import { IFakeUserSource } from '../datasources/IFakeUserSource';

export class FakeUserRepositoryImpl implements IFakeUserRepository {
  private dataSource: IFakeUserSource;

  constructor(dataSource: IFakeUserSource) {
    this.dataSource = dataSource;
  }

  getUserByAuthId(authId: string): Promise<FakeUser | null> {
    // La conversión de modelos a entidades ya se maneja en el Datasource (FakeUser.fromJson)
    return this.dataSource.getUserByAuthId(authId);
  }

  createUser(user: FakeUser): Promise<FakeUser | null> {
    return this.dataSource.createUser(user);
  }

  getUsersByIds(ids: string[]): Promise<FakeUser[]> {
    // console.log("📡 Repository.getUsersByIds con", ids);
    return this.dataSource.getUsersByIds(ids);
  }

  getAllUsers(): Promise<FakeUser[]> {
    return this.dataSource.getAllUsers();
  }
}