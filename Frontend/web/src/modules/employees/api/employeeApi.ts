import { apiClient } from '../../../core/api/client';
import type { Employee, CreateEmployeePayload } from '../../../types';

export const employeeApi = {
  list: async (filters?: { department_id?: number; search_query?: string }): Promise<Employee[]> => {
    let endpoint = '/employees';
    const params = new URLSearchParams();
    if (filters?.department_id) {
      params.append('department_id', filters.department_id.toString());
    }
    if (filters?.search_query) {
      params.append('search_query', filters.search_query);
    }
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
    return apiClient.get<Employee[]>(endpoint);
  },

  getByID: async (id: number): Promise<Employee> => {
    return apiClient.get<Employee>(`/employees/${id}`);
  },

  create: async (payload: CreateEmployeePayload): Promise<Employee> => {
    return apiClient.post<Employee>('/employees', payload);
  },

  update: async (id: number, payload: Partial<CreateEmployeePayload>): Promise<Employee> => {
    return apiClient.put<Employee>(`/employees/${id}`, payload);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/employees/${id}`);
  },
};
