import { AuthUser } from "../entities/AuthUser";

export interface AuthRepository {
  login(email: string, password: string): Promise<boolean>;
  signup(email: string, password: string): Promise<AuthUser>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
}
