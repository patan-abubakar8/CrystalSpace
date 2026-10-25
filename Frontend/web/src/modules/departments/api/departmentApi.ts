import { apiClient } from '../../../core/api/client';
import type { Department } from '../../../types';

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  description?: string;
  manager_id?: number | null;
}

export const departmentApi = {
  list: async (): Promise<Department[]> => {
    return apiClient.get<Department[]>('/departments');
  },

  getByID: async (id: number): Promise<Department> => {
    return apiClient.get<Department>(`/departments/${id}`);
  },

  create: async (payload: CreateDepartmentPayload): Promise<Department> => {
    return apiClient.post<Department>('/departments', payload);
  },

  update: async (id: number, payload: Partial<CreateDepartmentPayload>): Promise<Department> => {
    return apiClient.put<Department>(`/departments/${id}`, payload);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/departments/${id}`);
  },
};
