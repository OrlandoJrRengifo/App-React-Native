import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRemoteDataSource } from "./AuthRemoteDataSource";


export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;

  private prefs: ILocalPreferences;

  constructor(projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    }
    this.projectId = projectId;
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/auth/${this.projectId}`;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
    console.log("AuthRemoteDataSource: Initialized with Project ID:", this.projectId);
  }

  async login(email: string, password: string): Promise<boolean> {
    console.log("-> AuthRemoteDataSource: Calling login for email:", email);
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 201) {
        console.log("<- AuthRemoteDataSource: Login successful (201). Storing tokens.");
        const data = await response.json();
        const token = data["accessToken"];
        const refreshToken = data["refreshToken"];
        
        const userId = data["id"] || data["user"]?.["id"]; 

        await this.prefs.storeData("token", token);
        await this.prefs.storeData("refreshToken", refreshToken);
        
        if (userId) {
            await this.prefs.storeData("userId", userId); 
            console.log("   -> AuthRemoteDataSource: Stored userId:", userId);
        } else {
            await this.prefs.removeData("userId");
            console.warn("   -> AuthRemoteDataSource: Warning! userId not returned by /login. Fallback to email for session.");
        }

        await this.prefs.storeData("userEmail", email); 
        
        console.log("Token:", token, "\nRefresh Token:", refreshToken);
        return true;
      } else {
        const body = await response.json();
        console.error("<- AuthRemoteDataSource: Login failed (Status:", response.status, "):", body.message);
        throw new Error(`Login error: ${body.message}`);
      }
    } catch (e: any) {
      console.error("<- AuthRemoteDataSource: Login failed (Exception)", e);
      throw e;
    }
  }

  async signUp(email: string, password: string): Promise<AuthUser> {
    console.log("-> AuthRemoteDataSource: Calling signUp for email:", email);
    try {
      const response = await fetch(`${this.baseUrl}/signup-direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          email: email,
          name: email.split("@")[0],
          password: password,
        }),
      });

      if (response.status === 201) {
        const data = await response.json();
        console.log("<- AuthRemoteDataSource: SignUp successful (201). User ID:", data.id);
        return new AuthUser(data.id, data.email);
      } else {
        const body = await response.json();
        console.error("<- AuthRemoteDataSource: SignUp failed (Status:", response.status, "):", (body.message || []).join(" "));
        throw new Error(`Signup error: ${(body.message || []).join(" ")}`);
      }
    } catch (e: any) {
      console.error("<- AuthRemoteDataSource: Signup failed (Exception)", e);
      throw e;
    }
  }
  
  public async getAuthUserFromToken(): Promise<AuthUser | null> {
    console.log("-> AuthRemoteDataSource: Checking AuthUser from local storage...");
    try {
      const token = await this.prefs.retrieveData<string>("token");
      const userId = await this.prefs.retrieveData<string>("userId");
      const userEmail = await this.prefs.retrieveData<string>("userEmail");

      if (!token || !userEmail) {
        console.log("<- AuthRemoteDataSource: No token or email found. Session expired/not set.");
        return null;
      }
      
      console.log("   -> AuthRemoteDataSource: Found token and email. Verifying token...");
      const isValid = await this.verifyToken();
      if (!isValid) {
        console.log("<- AuthRemoteDataSource: Token verification failed. Session invalid.");
        return null;
      }

      const finalId = userId ?? userEmail; 
      console.log("<- AuthRemoteDataSource: Session found and valid. User ID:", finalId);
      return new AuthUser(finalId, userEmail);

    } catch (e) {
      console.error("<- AuthRemoteDataSource: Error getting user from LocalPrefs:", e);
      return null;
    }
  }

async logOut(): Promise<void> {
    console.log("-> AuthRemoteDataSource: Calling logOut.");
    let apiError = null;

    try {
      const token = await this.prefs.retrieveData<string>("token");
      if (!token) {
        console.warn("   -> AuthRemoteDataSource: No token found for logout. Skipping API call.");
        return Promise.resolve(); // Salir si no hay token que enviar
      }

      const response = await fetch(`${this.baseUrl}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        console.log("<- AuthRemoteDataSource: Logout API successful (201).");
      } else if (response.status === 401 || response.status === 403) {
        console.warn(`<- AuthRemoteDataSource: Logout API returned ${response.status} (Unauthorized/Forbidden). Token expired, but proceeding to clear local session.`);
      } else {
        const body = await response.json();
        const errorMessage = body.message || `API error status ${response.status}`;
        console.error("<- AuthRemoteDataSource: Logout failed (Server Error):", errorMessage);
        apiError = new Error(`Logout error: ${errorMessage}`);
      }
    } catch (e: any) {
      console.error("<- AuthRemoteDataSource: Logout failed (Network Exception)", e);
      apiError = e;
    } finally {
      console.log("   -> AuthRemoteDataSource: Executing local storage session cleanup.");
      await this.prefs.removeData("token");
      await this.prefs.removeData("refreshToken");
      await this.prefs.removeData("userId"); 
      await this.prefs.removeData("userEmail"); 

      // Limpiar preferencias de sesión guardadas
      await this.prefs.removeData("savedEmail");
      await this.prefs.removeData("savedPassword");
      await this.prefs.removeData("rememberSession");

    }
  }

  async validate(email: string, validationCode: string): Promise<boolean> {
    console.log("-> AuthRemoteDataSource: Calling validate email:", email);
    try {
      const response = await fetch(`${this.baseUrl}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email, code: validationCode }),
      });

      if (response.status === 201) {
        console.log("<- AuthRemoteDataSource: Email validation successful (201).");
        return true;
      } else {
        const body = await response.json();
        console.error("<- AuthRemoteDataSource: Email validation failed (Status:", response.status, "):", body.message);
        throw new Error(`Validation error: ${body.message}`);
      }
    } catch (e: any) {
      console.error("<- AuthRemoteDataSource: Validation failed (Exception)", e);
      throw e;
    }
  }

  async refreshToken(): Promise<boolean> {
    console.log("-> AuthRemoteDataSource: Attempting to refreshToken.");
    try {
      const refreshToken = await this.prefs.retrieveData<string>(
        "refreshToken"
      );
      if (!refreshToken) {
        console.log("<- AuthRemoteDataSource: Refresh token not found. Cannot refresh.");
        throw new Error("No refresh token found");
      }
      
      const response = await fetch(`${this.baseUrl}/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.status === 201) {
        const data = await response.json();
        const newToken = data["accessToken"];
        await this.prefs.storeData("token", newToken);
        console.log("<- AuthRemoteDataSource: Token refreshed successfully.");
        return true;
      } else {
        const body = await response.json();
        console.error("<- AuthRemoteDataSource: Refresh token failed (Status:", response.status, "):", body.message);
        throw new Error(`Refresh token error: ${body.message}`);
      }
    } catch (e: any) {
      console.error("<- AuthRemoteDataSource: Refresh token failed (Exception)", e);
      throw e;
    }
  }

  forgotPassword(email: string): Promise<boolean> {
    console.log("-> AuthRemoteDataSource: forgotPassword called (Not implemented).");
    throw new Error("Method not implemented.");
  }

  resetPassword(
    email: string,
    newPassword: string,
    validationCode: string
  ): Promise<boolean> {
    console.log("-> AuthRemoteDataSource: resetPassword called (Not implemented).");
    throw new Error("Method not implemented.");
  }

  async verifyToken(): Promise<boolean> {
    console.log("-> AuthRemoteDataSource: Calling verifyToken.");
    try {
      const token = await this.prefs.retrieveData<string>("token");
      if (!token) {
        console.log("<- AuthRemoteDataSource: verifyToken: No token in storage.");
        return false;
      }

      const response = await fetch(`${this.baseUrl}/verify-token`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        console.log("<- AuthRemoteDataSource: Token is valid (200).");
        return true;
      } else {
        const body = await response.json();
        console.error("<- AuthRemoteDataSource: Token verification failed (Status:", response.status, "):", body.message);
        return false;
      }
    } catch (e: any) {
      console.error("<- AuthRemoteDataSource: Verify token failed (Exception)", e);
      return false;
    }
  }
}