import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

export interface UpdateProfileDto {
  username: string;
  email: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: UpdateProfileDto): Promise<User> => {
    const response = await api.put<User>('/auth/profile', data);
    return response.data;
  },

  /**
   * Store auth token and user data
   */
  storeAuth: (authResponse: AuthResponse): void => {
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify({
      username: authResponse.username,
      email: authResponse.email,
      role: authResponse.role,
    }));
  },

  /**
   * Clear auth data
   */
  clearAuth: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get stored user data
   */
  getStoredUser: (): { username: string; email: string; role: string } | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
