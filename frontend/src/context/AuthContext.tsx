import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; confirmPassword?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('melomix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('melomix_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem('melomix_token');
    localStorage.removeItem('melomix_user');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  // Load user profile on mount if token exists
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
          localStorage.setItem('melomix_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Session expired or invalid token', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, [token, logout]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      const authToken = res.data.token;
      const authUser = res.data.user;

      localStorage.setItem('melomix_token', authToken);
      localStorage.setItem('melomix_user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      showToast(`Welcome back, ${authUser.name}!`, 'success');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Check your credentials.';
      showToast(message, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; confirmPassword?: string }) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      const authToken = res.data.token;
      const authUser = res.data.user;

      localStorage.setItem('melomix_token', authToken);
      localStorage.setItem('melomix_user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      showToast(`Welcome to Melomix, ${authUser.name}!`, 'success');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed.';
      showToast(message, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('melomix_user', JSON.stringify(updated));
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
