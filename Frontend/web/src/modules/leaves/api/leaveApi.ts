import { apiClient } from '../../../core/api/client';
import type { Leave, LeaveType, LeaveBalance, ApplyLeavePayload } from '../../../types';

export const leaveApi = {
  listMyLeaves: async (): Promise<Leave[]> => {
    return apiClient.get<Leave[]>('/leaves/my');
  },

  listLeaveTypes: async (): Promise<LeaveType[]> => {
    return apiClient.get<LeaveType[]>('/leaves/types');
  },

  getBalances: async (employeeID: number): Promise<LeaveBalance[]> => {
    return apiClient.get<LeaveBalance[]>(`/leaves/balances/${employeeID}`);
  },

  apply: async (payload: ApplyLeavePayload): Promise<Leave> => {
    return apiClient.post<Leave>('/leaves/apply', payload);
  },

  listPending: async (): Promise<Leave[]> => {
    return apiClient.get<Leave[]>('/leaves/pending');
  },

  review: async (
    leaveID: number,
    status: 'Approved' | 'Rejected',
    rejectionReason?: string
  ): Promise<Leave> => {
    return apiClient.patch<Leave>(`/leaves/${leaveID}/status`, {
      status,
      rejection_reason: rejectionReason,
    });
  },
};
