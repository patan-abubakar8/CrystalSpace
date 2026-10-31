import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionApi } from '../api/permissionApi';
import { queryKeys } from '../../../core/api/queryClient';
import { usePermissions } from '../../../core/context/PermissionContext';
import { useNotification } from '../../../core/context/NotificationContext';
import { RolesListPage } from './RolesListPage';
import { RolePermissionsPage } from './RolePermissionsPage';
import type { PagePermission } from '../../../types';
import { Plus, X } from 'lucide-react';

export const RolesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();
  const { refetchPermissions } = usePermissions();

  const [viewMode, setViewMode] = useState<'list' | 'permissions'>('list');
  const [selectedRoleName, setSelectedRoleName] = useState<string>('HR');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Fetch all roles & permission matrices
  const { data: matrix = [], isLoading } = useQuery({
    queryKey: queryKeys.permissions.roles,
    queryFn: permissionApi.listRoles,
  });

  // Save permissions mutation
  const saveMutation = useMutation({
    mutationFn: async ({ roleName, permissions }: { roleName: string; permissions: PagePermission[] }) => {
      await permissionApi.updateRolePermissions(roleName, permissions);
    },
    onSuccess: (_, variables) => {
      success(
        'Permissions Saved',
        `Dynamic permissions for role '${variables.roleName}' updated successfully.`
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.roles });
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.my });
      refetchPermissions();
    },
    onError: (err: Error) => {
      error('Update Failed', err.message || 'Failed to update role permissions.');
    },
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async () => {
      return permissionApi.createRole({
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
      });
    },
    onSuccess: (newRole) => {
      success(
        'Role Created',
        `Role '${newRole.name}' created successfully. Now configure its access matrix.`
      );
      setIsCreateModalOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.roles });
      // Immediately open Page 2 to configure the new role's permissions
      setSelectedRoleName(newRole.name);
      setViewMode('permissions');
    },
    onError: (err: Error) => {
      error('Creation Failed', err.message || 'Failed to create role.');
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleName: string) => {
      await permissionApi.deleteRole(roleName);
    },
    onSuccess: () => {
      success('Role Deleted', 'The custom role has been removed from the system.');
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.roles });
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.my });
      refetchPermissions();
    },
    onError: (err: Error) => {
      error('Deletion Failed', err.message || 'Failed to delete role.');
    },
  });

  const handleDeleteRole = (roleName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete custom role '${roleName}'?`)) {
      deleteRoleMutation.mutate(roleName);
    }
  };

  const handleSelectRole = (roleName: string) => {
    setSelectedRoleName(roleName);
    setViewMode('permissions');
  };

  return (
    <>
      {viewMode === 'list' ? (
        <RolesListPage
          matrix={matrix}
          isLoading={isLoading}
          onSelectRole={handleSelectRole}
          onCreateRoleClick={() => setIsCreateModalOpen(true)}
          onDeleteRole={handleDeleteRole}
          isDeleting={deleteRoleMutation.isPending}
        />
      ) : (
        <RolePermissionsPage
          roleName={selectedRoleName}
          matrix={matrix}
          onBack={() => setViewMode('list')}
          onSelectRole={(r) => setSelectedRoleName(r)}
          onSave={async (roleName, perms) => {
            await saveMutation.mutateAsync({ roleName, permissions: perms });
          }}
          isSaving={saveMutation.isPending}
        />
      )}

      {/* Create New Role Modal */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--bg-overlay)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '1.5rem',
              backgroundColor: 'var(--bg-surface-elevated)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1.125rem', fontWeight: 500, margin: 0 }}>
                Create Custom Role
              </h3>
              <button
                id="btn-close-create-role-modal"
                onClick={() => setIsCreateModalOpen(false)}
                className="btn btn-secondary btn-icon btn-sm"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newRoleName.trim()) {
                  createRoleMutation.mutate();
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <div>
                <label className="form-label" htmlFor="input-new-role-name">
                  Role Title *
                </label>
                <input
                  id="input-new-role-name"
                  type="text"
                  required
                  placeholder="e.g. Lead Developer, Recruiter, Auditor"
                  className="form-control"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="form-label" htmlFor="input-new-role-desc">
                  Description
                </label>
                <textarea
                  id="input-new-role-desc"
                  rows={3}
                  placeholder="Describe the operational scope and purpose of this role..."
                  className="form-control"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 'var(--space-3)',
                  marginTop: '0.5rem',
                }}
              >
                <button
                  type="button"
                  id="btn-cancel-create-role"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-create-role"
                  disabled={!newRoleName.trim() || createRoleMutation.isPending}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} />
                  {createRoleMutation.isPending ? 'Creating...' : 'Create & Configure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
