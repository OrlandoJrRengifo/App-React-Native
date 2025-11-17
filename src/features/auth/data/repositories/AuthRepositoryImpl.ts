import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { AuthRemoteDataSource } from "../datasources/AuthRemoteDataSource";
import { AuthRemoteDataSourceImpl } from "../datasources/AuthRemoteDataSourceImp";

export class AuthRepositoryImpl implements AuthRepository {
  private dataSource: AuthRemoteDataSource;

  constructor(dataSource: AuthRemoteDataSource) {
    this.dataSource = dataSource;
  }

  async login(email: string, password: string): Promise<boolean> {
    const result = await this.dataSource.login(email, password);
    return result;
  }

  async signup(email: string, password: string): Promise<AuthUser> {
    const result = await this.dataSource.signUp(email, password);
    return result;
  }

  async logout(): Promise<void> {
    await this.dataSource.logOut();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const user = await (this.dataSource as AuthRemoteDataSourceImpl).getAuthUserFromToken();
    return user;
  }
}