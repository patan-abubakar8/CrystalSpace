import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type LoginCredentials } from '../api/authApi';
import type { User, AuthSession } from '../../../types';
import { APP_CONFIG } from '../../../core/config';
import { queryKeys } from '../../../core/api/queryClient';
import { useNotification } from '../../../core/context/NotificationContext';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  demoLogin: (role: 'SuperAdmin' | 'HR') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(APP_CONFIG.AUTH_TOKEN_KEY);
  });

  const {
    data: profileData,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: authApi.getProfile,
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });

  const user = profileData?.user || null;

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (session: AuthSession) => {
      localStorage.setItem(APP_CONFIG.AUTH_TOKEN_KEY, session.access_token);
      setToken(session.access_token);
      queryClient.setQueryData(queryKeys.auth.profile, { user: session.user });
      success('Welcome back!', `Logged in as ${session.user.role} (${session.user.email})`);
    },
    onError: (err: { message?: string }) => {
      error('Authentication Failed', err.message || 'Invalid credentials');
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = useCallback(() => {
    localStorage.removeItem(APP_CONFIG.AUTH_TOKEN_KEY);
    setToken(null);
    queryClient.clear();
    success('Logged Out', 'You have been safely signed out.');
  }, [queryClient, success]);

  const demoLogin = async (role: 'SuperAdmin' | 'HR') => {
    if (role === 'SuperAdmin') {
      await login({ email: 'superadmin@organize.com', password: 'Admin@123' });
    } else {
      await login({ email: 'hr@organize.com', password: 'HR@123' });
    }
  };

  useEffect(() => {
    if (token) {
      refetchProfile();
    }
  }, [token, refetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isLoading: isProfileLoading || loginMutation.isPending,
        login,
        logout,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
