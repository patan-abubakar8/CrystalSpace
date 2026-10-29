import { apiClient } from '../../../core/api/client';
import type {
  Employee,
  CreateEmployeePayload,
  EmployeeExtras,
  SalaryRecord,
} from '../../../types';

export interface EmployeeListFilters {
  department_id?: number;
  designation?: string;
  status?: string;
  search_query?: string;
  sort_by?: 'name' | 'employee_code' | 'department' | 'joining_date' | 'status';
  sort_dir?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface EmployeeListPage {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
  total_page: number;
}

const buildQuery = (filters?: EmployeeListFilters): string => {
  const params = new URLSearchParams();
  if (filters?.department_id) params.append('department_id', String(filters.department_id));
  if (filters?.designation) params.append('designation', filters.designation);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search_query) params.append('search', filters.search_query);
  if (filters?.sort_by) params.append('sort_by', filters.sort_by);
  if (filters?.sort_dir) params.append('sort_dir', filters.sort_dir);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.page_size) params.append('page_size', String(filters.page_size));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const employeeApi = {
  list: async (filters?: EmployeeListFilters): Promise<Employee[]> => {
    const endpoint = `/employees${buildQuery(filters)}`;
    return apiClient.get<Employee[]>(endpoint);
  },

  listPaged: async (filters?: EmployeeListFilters): Promise<EmployeeListPage> => {
    const response = await apiClient.getWithMeta<Employee[]>(`/employees${buildQuery(filters)}`);
    const items = response.data ?? [];
    return {
      items,
      total: response.meta?.total ?? items.length,
      page: response.meta?.page ?? filters?.page ?? 1,
      page_size: response.meta?.page_size ?? filters?.page_size ?? 20,
      total_page: response.meta?.total_page ?? 1,
    };
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

  /** Permission-filtered profile tabs; restricted sections come back undefined. */
  extras: async (id: number): Promise<EmployeeExtras> => {
    return apiClient.get<EmployeeExtras>(`/employees/${id}/extras`);
  },

  salary: async (id: number): Promise<SalaryRecord> => {
    return apiClient.get<SalaryRecord>(`/salaries/employee/${id}`);
  },
};
