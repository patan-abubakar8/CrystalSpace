import { apiClient } from '../../../core/api/client';
import type {
  DraftListResult,
  DraftSection,
  DraftSubmitResult,
  DraftValidation,
  EmployeeAuditLog,
  EmployeeDraftResponse,
  OnboardingReferenceData,
} from '../../../types';

export const employeeDraftApi = {
  reference: async (): Promise<OnboardingReferenceData> => {
    return apiClient.get<OnboardingReferenceData>('/employees/onboarding/reference');
  },

  list: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<DraftListResult> => {
    const qs = new URLSearchParams();
    if (params?.search) qs.append('search', params.search);
    if (params?.status) qs.append('status', params.status);
    if (params?.page) qs.append('page', String(params.page));
    if (params?.page_size) qs.append('page_size', String(params.page_size));
    const suffix = qs.toString();
    return apiClient.get<DraftListResult>(`/employees/drafts${suffix ? `?${suffix}` : ''}`);
  },

  create: async (currentStep = 1): Promise<EmployeeDraftResponse> => {
    return apiClient.post<EmployeeDraftResponse>('/employees/drafts', { current_step: currentStep });
  },

  get: async (id: number): Promise<EmployeeDraftResponse> => {
    return apiClient.get<EmployeeDraftResponse>(`/employees/drafts/${id}`);
  },

  saveSection: async (
    id: number,
    section: DraftSection,
    data: unknown,
    version: number,
    currentStep: number
  ): Promise<EmployeeDraftResponse> => {
    return apiClient.patch<EmployeeDraftResponse>(`/employees/drafts/${id}/sections/${section}`, {
      version,
      current_step: currentStep,
      data,
    });
  },

  update: async (
    id: number,
    payload: { version: number; current_step: number; status?: string }
  ): Promise<EmployeeDraftResponse> => {
    return apiClient.patch<EmployeeDraftResponse>(`/employees/drafts/${id}`, payload);
  },

  remove: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/employees/drafts/${id}`);
  },

  validate: async (id: number): Promise<DraftValidation> => {
    return apiClient.post<DraftValidation>(`/employees/drafts/${id}/validate`, {});
  },

  submit: async (
    id: number,
    payload: { version: number; create_account: boolean; roles?: string[] }
  ): Promise<DraftSubmitResult> => {
    return apiClient.post<DraftSubmitResult>(`/employees/drafts/${id}/submit`, payload);
  },

  history: async (employeeId: number): Promise<EmployeeAuditLog[]> => {
    return apiClient.get<EmployeeAuditLog[]>(`/employees/${employeeId}/history`);
  },
};
