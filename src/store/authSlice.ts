import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import AuthService from "@/services/api/AuthService";
import type { LoginRequest, UserProfile } from "@/services/api/AuthService";

export interface User {
  sub: string;
  exp: number;
  token_type: string;
  iat: number;
  authorities: string[];
}

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  userProfile: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      const { accessToken } = response.content;

      // Store tokens
      AuthService.storeTokens(accessToken);

      // Decode token to get user info
      const userInfo = AuthService.decodeToken(accessToken);

      return {
        accessToken,
        user: userInfo,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Đăng nhập thất bại"
      );
    }
  }
);

// Async thunk for getting current user profile
export const getCurrentUserAsync = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getCurrentUser();
      return response.content;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Không thể lấy thông tin người dùng"
      );
    }
  }
);

export const refreshTokenAsync = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.refreshToken();
      const { accessToken } = response.content;

      // Store new token
      AuthService.storeTokens(accessToken);

      // Decode token to get user info
      const userInfo = AuthService.decodeToken(accessToken);

      return {
        accessToken,
        user: userInfo,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Làm mới token thất bại"
      );
    }
  }
);

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const accessToken = AuthService.getAccessToken();
      if (!accessToken) {
        throw new Error("No token found");
      }

      // Check if token is expired
      const userInfo = AuthService.decodeToken(accessToken);
      const currentTime = Date.now() / 1000;

      if (userInfo.exp < currentTime) {
        // Token expired, try to refresh
        const response = await AuthService.refreshToken();
        const { accessToken: newToken } = response.content;
        const newUserInfo = AuthService.decodeToken(newToken);

        // Get user profile after successful refresh
        dispatch(getCurrentUserAsync());

        return {
          accessToken: newToken,
          user: newUserInfo,
        };
      }

      // Get user profile for valid token
      dispatch(getCurrentUserAsync());

      return {
        accessToken,
        user: userInfo,
      };
    } catch (error: any) {
      // Clear invalid tokens
      AuthService.logout();
      return rejectWithValue("Token không hợp lệ");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      AuthService.logout();
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.error = null;
      })
      // Get Current User Profile
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userProfile = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.userProfile = null;
        state.error = action.payload as string;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Refresh Token
      .addCase(refreshTokenAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(refreshTokenAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        // Clear tokens on refresh failure
        AuthService.logout();
      })
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
