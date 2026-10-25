import { apiClient } from '../../../core/api/client';
import type { AuthSession, User } from '../../../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthSession> => {
    return apiClient.post<AuthSession>('/auth/login', credentials, { requiresAuth: false });
  },

  getProfile: async (): Promise<{ user: User }> => {
    return apiClient.get<{ user: User }>('/auth/me');
  },
};
