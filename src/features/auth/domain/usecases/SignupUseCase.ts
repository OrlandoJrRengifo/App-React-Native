import { AuthUser } from "../entities/AuthUser";
import { AuthRepository } from "../repositories/AuthRepository";

export class SignupUseCase {
  constructor(private authRepo: AuthRepository) {}

  async execute(email: string, password: string): Promise<AuthUser> {
    // Solo crear usuario en auth
    // El FakeUser se creará en el primer login
    return await this.authRepo.signup(email, password);
  }
}
