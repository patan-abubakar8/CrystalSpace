import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes fresh cache
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
      retry: (failureCount, error: unknown) => {
        const statusCode = (error as { statusCode?: number })?.statusCode;
        if (statusCode === 401 || statusCode === 403 || statusCode === 404) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
  },
  employees: {
    all: ['employees'] as const,
    list: (filters?: Record<string, unknown>) => ['employees', 'list', filters] as const,
    detail: (id: number) => ['employees', 'detail', id] as const,
  },
  departments: {
    all: ['departments'] as const,
  },
  leaves: {
    my: ['leaves', 'my'] as const,
    types: ['leaves', 'types'] as const,
    balances: (employeeId?: number) => ['leaves', 'balances', employeeId] as const,
    pending: ['leaves', 'pending'] as const,
  },
};
