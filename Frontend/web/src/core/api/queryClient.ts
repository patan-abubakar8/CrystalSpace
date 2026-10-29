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
    history: (id: number) => ['employees', 'history', id] as const,
  },
  employeeDrafts: {
    all: ['employee-drafts'] as const,
    list: (filters?: Record<string, unknown>) => ['employee-drafts', 'list', filters] as const,
    detail: (id: number) => ['employee-drafts', 'detail', id] as const,
    reference: ['employee-drafts', 'reference'] as const,
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
  permissions: {
    my: ['permissions', 'my'] as const,
    roles: ['permissions', 'roles'] as const,
  },
  attendance: {
    today: ['attendance', 'today'] as const,
    heatmap: (employeeId?: number, months?: number) => ['attendance', 'heatmap', employeeId, months] as const,
    summary: (employeeId?: number, days?: number) => ['attendance', 'summary', employeeId, days] as const,
    overview: ['attendance', 'overview'] as const,
    list: (filters?: Record<string, unknown>) => ['attendance', 'list', filters] as const,
  },
};

