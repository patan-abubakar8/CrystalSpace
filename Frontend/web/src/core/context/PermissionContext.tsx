import React, { createContext, useContext, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { permissionApi } from '../../modules/roles/api/permissionApi';
import { queryKeys } from '../api/queryClient';
import type { PermissionsMap } from '../../types';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete';

interface PermissionContextValue {
  permissions: PermissionsMap | undefined;
  isLoading: boolean;
  can: (page: string, action: PermissionAction) => boolean;
  refetchPermissions: () => Promise<unknown>;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const {
    data: permissions,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.permissions.my,
    queryFn: permissionApi.getMyPermissions,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  const can = useCallback(
    (page: string, action: PermissionAction): boolean => {
      // SuperAdmin always has master bypass privileges on every page
      if (user?.role === 'SuperAdmin') {
        return true;
      }

      if (!permissions || !permissions[page]) {
        return false;
      }

      const perm = permissions[page];
      switch (action) {
        case 'view':
          return !!perm.can_view;
        case 'create':
          return !!perm.can_create;
        case 'update':
          return !!perm.can_update;
        case 'delete':
          return !!perm.can_delete;
        default:
          return false;
      }
    },
    [user?.role, permissions]
  );

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        isLoading,
        can,
        refetchPermissions: refetch,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextValue => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
