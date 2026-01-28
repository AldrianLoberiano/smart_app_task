import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string; email: string; role: string } | null;
  login: (data: LoginRequest) => Promise<{ username: string; email: string; role: string }>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const storedUser = authService.getStoredUser();
      
      setIsAuthenticated(authenticated);
      setUser(storedUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    const response: AuthResponse = await authService.login(data);
    authService.storeAuth(response);
    
    const userData = {
      username: response.username,
      email: response.email,
      role: response.role,
    };
    
    setIsAuthenticated(true);
    setUser(userData);
    
    return userData;
  };

  const register = async (data: RegisterRequest) => {
    const response: AuthResponse = await authService.register(data);
    authService.storeAuth(response);
    
    setIsAuthenticated(true);
    setUser({
      username: response.username,
      email: response.email,
      role: response.role,
    });
  };

  const logout = () => {
    authService.clearAuth();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
