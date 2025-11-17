import { LocalPreferencesAsyncStorage } from "../LocalPreferencesAsyncStorage";

export async function getAuthSessionData(): Promise<{ token: string | null; userId: string | null }> {
    try {
        const prefs = LocalPreferencesAsyncStorage.getInstance();
        const token = await prefs.retrieveData<string>("token");
        const userId = await prefs.retrieveData<string>("userId");
        
        return { token, userId };
    } catch (e) {
        console.error("Error retrieving session data:", e);
        return { token: null, userId: null };
    }
}