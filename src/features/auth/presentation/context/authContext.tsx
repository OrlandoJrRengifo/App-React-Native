import React, { createContext, useContext, useEffect, useState } from "react";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { FakeUser } from "@/src/features/fake_users/domain/entities/FakeUser";
import { IFakeUserRepository } from "@/src/features/fake_users/domain/repositories/IFakeUserRepository";
import { AuthUser } from "../../domain/entities/AuthUser";
import { GetCurrentUserUseCase } from "../../domain/usecases/GetCurrentUserUseCase";
import { LoginUseCase } from "../../domain/usecases/LoginUseCase";
import { LogoutUseCase } from "../../domain/usecases/LogoutUseCase";
import { SignupUseCase } from "../../domain/usecases/SignupUseCase";


type AuthContextType = {
  isLoggedIn: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();

  const loginUseCase = di.resolve<LoginUseCase>(TOKENS.LoginUC);
  const signupUseCase = di.resolve<SignupUseCase>(TOKENS.SignupUC);
  const logoutUseCase = di.resolve<LogoutUseCase>(TOKENS.LogoutUC);
  const getCurrentUserUseCase = di.resolve<GetCurrentUserUseCase>(TOKENS.GetCurrentUserUC);
  const fakeUserRepo = di.resolve<IFakeUserRepository>(TOKENS.FakeUserRepo);


  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Función auxiliar para verificar/crear FakeUser
  const ensureFakeUserExists = async (authUser: AuthUser) => {
    try {
      // Verificar si ya existe el FakeUser
      const existingFakeUser = await fakeUserRepo.getUserByAuthId(authUser.id);
      
      if (!existingFakeUser) {
        // No existe, crear uno nuevo
        console.log("[AuthContext] Creating FakeUser for authId:", authUser.id);
        const newFakeUser = new FakeUser({
          authId: authUser.id,
          email: authUser.email,
          name: authUser.email.split("@")[0],
        });
        
        await fakeUserRepo.createUser(newFakeUser);
        console.log("[AuthContext] FakeUser created successfully");
      } else {
        console.log("[AuthContext] FakeUser already exists for authId:", authUser.id);
      }
    } catch (error) {
      console.error("[AuthContext] Error ensuring FakeUser exists:", error);
    }
  };

  useEffect(() => {
    getCurrentUserUseCase.execute().then(async (user: AuthUser | null) => {
      if (user) {
        // Verificar/crear FakeUser en el montaje inicial
        await ensureFakeUserExists(user);
      }
      setUser(user);
      setIsLoggedIn(!!user);
    });
  }, [getCurrentUserUseCase]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const success = await loginUseCase.execute(email, password);
    if (success) {
      const currentUser = await getCurrentUserUseCase.execute();
      if (currentUser) {
        // Verificar/crear FakeUser después del login
        await ensureFakeUserExists(currentUser);
        setUser(currentUser);
        setIsLoggedIn(true);
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
    return success;
  };


  const signup = async (email: string, password: string) => {
    const newUser = await signupUseCase.execute(email, password);
    // Después del signup, el usuario necesita hacer login
    // En el login se creará el FakeUser
    setUser(newUser);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await logoutUseCase.execute();
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
