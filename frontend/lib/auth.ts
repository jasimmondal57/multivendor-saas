import api from './api';

export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string | null;
  user_type: 'customer' | 'vendor' | 'admin';
  status: string;
  email_verified: boolean;
  phone_verified: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  user_type: 'customer' | 'vendor';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
  };
}

export const authService = {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/v1/auth/register', data);
    if (response.data.success) {
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/v1/auth/login', data);
    if (response.data.success) {
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/v1/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<{ success: boolean; data: { user: User } }>('/v1/auth/user');
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data.data.user;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  // Get user from localStorage
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },
};

