import { AuthRepository } from "../repositories/AuthRepository";

export class LoginUseCase {
  constructor(private repo: AuthRepository) {}

  async execute(email: string, password: string): Promise<boolean> {
    return this.repo.login(email, password);
  }
}
