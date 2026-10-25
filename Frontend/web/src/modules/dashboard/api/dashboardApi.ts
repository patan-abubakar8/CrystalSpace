import { apiClient } from '../../../core/api/client';
import type { DashboardStats } from '../../../types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/dashboard/stats');
  },
};
