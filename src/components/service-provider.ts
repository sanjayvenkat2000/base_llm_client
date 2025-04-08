import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

interface ServiceProviderProps {
  apiUrl?: string;
}

interface AuthToken {
  token: string;
  expiresAt: number;
}

interface ProtectedResponse {
  data: unknown;
  status: number;
  [key: string]: unknown;
}

export class ServiceProvider {
  private static instance: ServiceProvider;
  private cachedToken: AuthToken | null = null;
  private apiUrl: string;

  constructor(options: ServiceProviderProps = {}) {
    this.apiUrl = options.apiUrl || "http://localhost:8000";
  }

  static getInstance(options: ServiceProviderProps = {}): ServiceProvider {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider(options);
    }
    return ServiceProvider.instance;
  }

  private isTokenValid(token: AuthToken | null): boolean {
    if (!token) return false;
    // Check if token is still valid (with 60s buffer)
    return token.expiresAt > Date.now() + 60000;
  }

  async getToken(getToken: () => Promise<string>): Promise<string> {
    if (this.isTokenValid(this.cachedToken)) {
      return this.cachedToken!.token;
    }

    try {
      const token = await getToken();
      // Default expiry time: 1 hour
      this.cachedToken = {
        token,
        expiresAt: Date.now() + 3600000,
      };
      return token;
    } catch (error) {
      console.error("Failed to get authentication token:", error);
      throw error;
    }
  }

  async getProtected(token: string): Promise<ProtectedResponse> {
    try {
      // Log token for debugging (remove in production)
      console.log("Token being sent:", token.substring(0, 10) + "...");
      
      // Try different headers format depending on your FastAPI setup
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Option 1: Standard Bearer token (URL encoded)
      headers["Authorization"] = `Bearer ${encodeURIComponent(token)}`;
      
      // Uncomment if your FastAPI expects a different format:
      // Option 2: Token without Bearer prefix
      // headers["Authorization"] = encodeURIComponent(token);
      
      // Option 3: Custom header
      // headers["X-API-Token"] = encodeURIComponent(token);

      const response = await fetch(`${this.apiUrl}/user`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Protected API call failed:", error);
      throw error;
    }
  }

  // Method to test different auth formats with FastAPI
  async testAuthFormats(token: string): Promise<void> {
    interface FormatTest {
      name: string;
      headers: Record<string, string>;
    }

    const formats: FormatTest[] = [
      { name: "Standard Bearer", headers: { "Authorization": `Bearer ${token}` } },
      { name: "URL-encoded Bearer", headers: { "Authorization": `Bearer ${encodeURIComponent(token)}` } },
      { name: "Token only", headers: { "Authorization": token } },
      { name: "URL-encoded token only", headers: { "Authorization": encodeURIComponent(token) } },
      { name: "Custom header", headers: { "X-API-Token": token } },
      { name: "Token in Bearer without space", headers: { "Authorization": `Bearer${token}` } },
    ];

    console.log("Testing different authentication formats...");
    
    for (const format of formats) {
      try {
        const response = await fetch(`${this.apiUrl}/protected`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...format.headers,
          },
        });
        
        console.log(`Format: ${format.name}`);
        console.log(`Status: ${response.status}`);
        
        if (response.ok) {
          console.log("SUCCESS: This format works!");
          return; // Exit once we find a working format
        }
      } catch (error) {
        console.error(`Error with format ${format.name}:`, error);
      }
    }
    
    console.log("All authentication formats failed");
  }
}

export function useServiceProvider(options: ServiceProviderProps = {}) {
  const { getToken, isSignedIn } = useAuth();
  const [serviceProvider] = useState(() => ServiceProvider.getInstance(options));
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn && getToken) {
      const fetchToken = async () => {
        try {
          const authToken = await serviceProvider.getToken(() => getToken({}) as Promise<string>);
          setToken(authToken);
        } catch (error) {
          console.error("Failed to get auth token:", error);
        }
      };

      fetchToken();
    } else {
      setToken(null);
    }
  }, [isSignedIn, getToken, serviceProvider]);

  const callProtectedApi = async () => {
    if (!token || !isSignedIn) {
      throw new Error("User is not authenticated");
    }

    return await serviceProvider.getProtected(token);
  };

  return {
    isAuthenticated: !!token && isSignedIn,
    getProtected: callProtectedApi,
    testAuthFormats: async () => {
      if (!token || !isSignedIn) {
        throw new Error("User is not authenticated");
      }
      return serviceProvider.testAuthFormats(token);
    }
  };
}
