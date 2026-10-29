import { apiClient } from '../../../core/api/client';
import type {
  AttendanceRecord,
  AttendanceToday,
  HeatmapCell,
  AttendanceSummary,
  OrgAttendanceOverview,
} from '../../../types';

export interface AttendanceListResponse {
  data: AttendanceRecord[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    total_page: number;
  };
}

export const attendanceApi = {
  getToday: async (): Promise<AttendanceToday> => {
    return apiClient.get<AttendanceToday>('/attendance/today');
  },

  punch: async (payload: { action?: 'in' | 'out' | 'toggle'; work_mode?: string; notes?: string }): Promise<AttendanceRecord> => {
    return apiClient.post<AttendanceRecord>('/attendance/punch', payload);
  },

  getHeatmap: async (employeeId?: number, months: number = 3): Promise<HeatmapCell[]> => {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', String(employeeId));
    if (months) params.append('months', String(months));
    return apiClient.get<HeatmapCell[]>(`/attendance/heatmap?${params.toString()}`);
  },

  getSummary: async (employeeId?: number, days: number = 30): Promise<AttendanceSummary> => {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', String(employeeId));
    if (days) params.append('days', String(days));
    return apiClient.get<AttendanceSummary>(`/attendance/summary?${params.toString()}`);
  },

  getOrgOverview: async (): Promise<OrgAttendanceOverview> => {
    return apiClient.get<OrgAttendanceOverview>('/attendance/overview');
  },

  list: async (filters?: {
    employee_id?: number;
    department_id?: number;
    from?: string;
    to?: string;
    status?: string;
    query?: string;
    page?: number;
    page_size?: number;
  }): Promise<AttendanceListResponse> => {
    const params = new URLSearchParams();
    if (filters?.employee_id) params.append('employee_id', String(filters.employee_id));
    if (filters?.department_id) params.append('department_id', String(filters.department_id));
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters?.query) params.append('query', filters.query);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.page_size) params.append('page_size', String(filters.page_size));

    return apiClient.get<AttendanceListResponse>(`/attendance?${params.toString()}`);
  },
};
