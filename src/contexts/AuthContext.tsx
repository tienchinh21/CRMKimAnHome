import React, { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  initializeAuth,
  logout,
  clearError,
  loginAsync,
  getCurrentUserAsync,
} from "@/store/authSlice";
import type { User } from "@/store/authSlice";
import type { UserProfile } from "@/services/api/AuthService";
import type { UserRole } from "@/lib/rbac/types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userRole: UserRole | null;
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, userProfile, isAuthenticated, isLoading, error } =
    useAppSelector((state) => state.auth);

  // ⭐ Lấy role từ userProfile
  const userRole = (userProfile?.roleNames?.[0] || null) as UserRole | null;

  // Initialize auth on app start
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  const login = async (phoneNumber: string, password: string) => {
    try {
      await dispatch(loginAsync({ phoneNumber, password })).unwrap();
      // After successful login, get user profile
      // ⭐ IMPORTANT: await để đảm bảo userProfile được load trước khi redirect
      await dispatch(getCurrentUserAsync()).unwrap();
    } catch (error) {
      // Error is handled by Redux store
      throw error;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const value: AuthContextType = {
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    error,
    userRole,
    login,
    logout: handleLogout,
    clearError: handleClearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
