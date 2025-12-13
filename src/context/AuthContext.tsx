'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  authApi,
  LoginRequest,
  LoginEmployeeCodeRequest,
  RegisterRequest,
  TokenResponse,
  ApiError,
  setAccessToken,
  clearTokens,
  initializeTokens,
  getAccessToken,
  isAccessTokenExpired,
} from '@/lib/api';

// User type based on JWT claims from backend
interface User {
  user_id: string;
  email: string;
  employee_id?: string;
  company_id?: string;
  role: 'owner' | 'manager' | 'employee' | 'pending';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  loginWithEmployeeCode: (data: LoginEmployeeCodeRequest) => Promise<void>;
  loginWithGoogle: () => void;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Parse JWT token to get user info
function parseJwt(token: string): User | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return {
      user_id: payload.user_id,
      email: payload.email,
      employee_id: payload.employee_id || undefined,
      company_id: payload.company_id || undefined,
      role: payload.role || 'pending',
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    initializeTokens();
    const token = getAccessToken();
    
    if (token && !isAccessTokenExpired()) {
      const userData = parseJwt(token);
      setUser(userData);
    } else if (token && isAccessTokenExpired()) {
      // Token expired, try to refresh
      refreshAuth();
    }
    setIsLoading(false);
  }, []);

  // Refresh auth by getting new access token
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authApi.refreshToken({} as never);
      if (response.success && response.data) {
        setAccessToken(response.data.access_token, response.data.access_token_expires_in);
        const userData = parseJwt(response.data.access_token);
        setUser(userData);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch {
      // Refresh failed, clear auth state
      clearTokens();
      setUser(null);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Handle successful token response
  const handleTokenResponse = useCallback((tokenData: TokenResponse) => {
    setAccessToken(tokenData.access_token, tokenData.access_token_expires_in);
    const userData = parseJwt(tokenData.access_token);
    setUser(userData);
    
    // Redirect based on user state
    if (userData?.company_id) {
      router.push('/dashboard');
    } else if (userData?.role === 'pending') {
      router.push('/auth/choose-role');
    } else {
      router.push('/dashboard');
    }
  }, [router]);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);
      if (response.data) {
        handleTokenResponse(response.data);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.errorDetail.message);
      } else {
        setError('Login failed. Please try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleTokenResponse]);

  const loginWithEmployeeCode = useCallback(async (data: LoginEmployeeCodeRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.loginWithEmployeeCode(data);
      if (response.data) {
        handleTokenResponse(response.data);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.errorDetail.message);
      } else {
        setError('Login failed. Please try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleTokenResponse]);

  const loginWithGoogle = useCallback(() => {
    authApi.loginWithGoogle();
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);
      if (response.data) {
        handleTokenResponse(response.data);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.errorDetail.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleTokenResponse]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors, still clear local state
    } finally {
      clearTokens();
      setUser(null);
      setIsLoading(false);
      router.push('/auth');
    }
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithEmployeeCode,
        loginWithGoogle,
        register,
        logout,
        refreshAuth,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
