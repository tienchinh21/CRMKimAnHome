import axios from "axios";

const API_BASE_URL = "https://kimanhome.duckdns.org/spring-api";

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface AuthResponse {
  error: null;
  content: LoginResponse | RefreshTokenResponse;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
  isActive: boolean;
  gender: string;
  roleNames: string[];
  birthDay: string;
  ledGroupName: string;
  inGroupName: string[];
}

export interface UserMeResponse {
  error: {};
  message: string;
  exception: string;
  content: UserProfile;
}

const AuthService = {
  // Login API
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Refresh token API
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token found");
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
  },

  // Logout - clear tokens from localStorage
  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
  },

  // Get stored access token
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  },

  // Get stored refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  },

  // Store tokens
  storeTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token;
  },

  // Decode JWT token to get user info
  decodeToken(token: string): any {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  },

  // Get user info from token
  getUserInfo(): any {
    const token = this.getAccessToken();
    if (!token) return null;
    return this.decodeToken(token);
  },

  // Get current user profile
  async getCurrentUser(): Promise<UserMeResponse> {
    try {
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },
};

export default AuthService;
