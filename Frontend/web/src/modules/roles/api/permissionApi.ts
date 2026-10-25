import { apiClient } from '../../../core/api/client';
import type { PermissionsMap, RolePermissionsMatrix, RoleRecord, PagePermission } from '../../../types';

export const permissionApi = {
  getMyPermissions: async (): Promise<PermissionsMap> => {
    return apiClient.get<PermissionsMap>('/permissions/my');
  },

  listRoles: async (): Promise<RolePermissionsMatrix[]> => {
    return apiClient.get<RolePermissionsMatrix[]>('/admin/roles');
  },

  updateRolePermissions: async (role: string, permissions: PagePermission[]): Promise<void> => {
    return apiClient.put<void>(`/admin/roles/${encodeURIComponent(role)}/permissions`, {
      role,
      permissions,
    });
  },

  createRole: async (payload: { name: string; description: string }): Promise<RoleRecord> => {
    return apiClient.post<RoleRecord>('/admin/roles', payload);
  },

  deleteRole: async (name: string): Promise<void> => {
    return apiClient.delete<void>(`/admin/roles/${encodeURIComponent(name)}`);
  },
};
