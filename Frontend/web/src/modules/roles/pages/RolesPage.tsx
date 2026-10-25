import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionApi } from '../api/permissionApi';
import { queryKeys } from '../../../core/api/queryClient';
import { usePermissions } from '../../../core/context/PermissionContext';
import { useNotification } from '../../../core/context/NotificationContext';
import type { RolePermissionsMatrix, PagePermission } from '../../../types';
import {
  Users,
  Building2,
  CalendarCheck,
  FolderGit2,
  ShieldCheck,
  CreditCard,
  Plus,
  Trash2,
  Save,
  Lock,
  RotateCcw,
  LayoutDashboard,
} from 'lucide-react';

interface PageMetadata {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}

const PAGES_CONFIG: PageMetadata[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Executive overview, key metrics, and organizational activity',
    icon: LayoutDashboard,
  },
  {
    id: 'employees',
    name: 'Employees',
    description: 'Workforce personnel directory, profiles, and employee records',
    icon: Users,
  },
  {
    id: 'departments',
    name: 'Departments',
    description: 'Organizational units, headcounts, and departmental hierarchy',
    icon: Building2,
  },
  {
    id: 'leaves',
    name: 'Leave Management',
    description: 'Leave submissions, approval queues, and balance records',
    icon: CalendarCheck,
  },
  {
    id: 'salaries',
    name: 'Salaries & Payroll',
    description: 'Compensation structures, allowances, and salary revisions',
    icon: CreditCard,
  },
  {
    id: 'projects',
    name: 'Projects & Tasks',
    description: 'Work initiatives, deliverables, and project task tracking',
    icon: FolderGit2,
  },
  {
    id: 'roles',
    name: 'Roles & Permissions',
    description: 'Dynamic access control matrix and role administrative rights',
    icon: ShieldCheck,
  },
];

export const RolesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();
  const { refetchPermissions } = usePermissions();

  const [selectedRoleName, setSelectedRoleName] = useState<string>('HR');
  const [localPermissions, setLocalPermissions] = useState<Record<string, PagePermission>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Fetch all roles and permissions
  const { data: matrix, isLoading } = useQuery({
    queryKey: queryKeys.permissions.roles,
    queryFn: permissionApi.listRoles,
  });

  const selectedMatrix = matrix?.find((m) => m.role.name === selectedRoleName);
  const isSuperAdminRole = selectedRoleName === 'SuperAdmin';

  // Synchronize local editable state when selected role changes or data loads
  useEffect(() => {
    if (selectedMatrix) {
      const copy: Record<string, PagePermission> = {};
      PAGES_CONFIG.forEach((p) => {
        copy[p.id] = selectedMatrix.permissions[p.id] || {
          page: p.id,
          can_view: isSuperAdminRole,
          can_create: isSuperAdminRole,
          can_update: isSuperAdminRole,
          can_delete: isSuperAdminRole,
        };
      });
      setLocalPermissions(copy);
      setIsDirty(false);
    }
  }, [selectedRoleName, selectedMatrix, isSuperAdminRole]);

  // Mutation for saving permissions
  const saveMutation = useMutation({
    mutationFn: async () => {
      const permsArray = Object.values(localPermissions);
      await permissionApi.updateRolePermissions(selectedRoleName, permsArray);
    },
    onSuccess: () => {
      success(
        'Permissions Saved',
        `Dynamic permissions for role '${selectedRoleName}' updated successfully.`
      );
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.roles });
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.my });
      refetchPermissions();
    },
    onError: (err: Error) => {
      error('Update Failed', err.message || 'Failed to update role permissions.');
    },
  });

  // Mutation for creating a new role
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
        `Role '${newRole.name}' created successfully. You can now configure its permissions.`
      );
      setIsCreateModalOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.roles });
      setSelectedRoleName(newRole.name);
    },
    onError: (err: Error) => {
      error('Creation Failed', err.message || 'Failed to create role.');
    },
  });

  // Mutation for deleting a custom role
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleName: string) => {
      await permissionApi.deleteRole(roleName);
    },
    onSuccess: () => {
      success('Role Deleted', `Role '${selectedRoleName}' removed from the system.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.roles });
      setSelectedRoleName('HR');
    },
    onError: (err: Error) => {
      error('Deletion Failed', err.message || 'Failed to delete role.');
    },
  });

  const handleToggle = (pageId: string, action: 'can_view' | 'can_create' | 'can_update' | 'can_delete') => {
    if (isSuperAdminRole) return; // SuperAdmin locked

    setLocalPermissions((prev) => {
      const currentPerm = prev[pageId] || {
        page: pageId,
        can_view: false,
        can_create: false,
        can_update: false,
        can_delete: false,
      };

      const nextVal = !currentPerm[action];
      const updatedPerm = {
        ...currentPerm,
        [action]: nextVal,
      };

      // If user enables create, update, or delete, auto-enable can_view
      if (nextVal && action !== 'can_view') {
        updatedPerm.can_view = true;
      }
      // If user disables can_view, auto-disable create, update, delete
      if (!nextVal && action === 'can_view') {
        updatedPerm.can_create = false;
        updatedPerm.can_update = false;
        updatedPerm.can_delete = false;
      }

      setIsDirty(true);
      return {
        ...prev,
        [pageId]: updatedPerm,
      };
    });
  };

  const handleDiscard = () => {
    if (selectedMatrix) {
      const copy: Record<string, PagePermission> = {};
      PAGES_CONFIG.forEach((p) => {
        copy[p.id] = selectedMatrix.permissions[p.id] || {
          page: p.id,
          can_view: isSuperAdminRole,
          can_create: isSuperAdminRole,
          can_update: isSuperAdminRole,
          can_delete: isSuperAdminRole,
        };
      });
      setLocalPermissions(copy);
      setIsDirty(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.25rem' }}>
            Roles & Dynamic Permissions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
            Manage the 4 core permissions (View, Create, Update, Delete) dynamically for any role.
          </p>
        </div>

        <button
          id="btn-create-role-modal"
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={15} /> Create New Role
        </button>
      </div>

      {/* Role Selector Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {isLoading ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>Loading roles...</div>
        ) : (
          matrix?.map((m: RolePermissionsMatrix) => {
            const isSelected = m.role.name === selectedRoleName;
            return (
              <button
                key={m.role.id}
                id={`tab-role-${m.role.name}`}
                onClick={() => {
                  if (isDirty) {
                    if (window.confirm('You have unsaved changes. Discard and switch role?')) {
                      setSelectedRoleName(m.role.name);
                    }
                  } else {
                    setSelectedRoleName(m.role.name);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 500 : 400,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {m.role.is_system && <Lock size={12} style={{ color: 'var(--text-tertiary)' }} />}
                <span>{m.role.name}</span>
                {m.role.is_system && (
                  <span
                    style={{
                      fontSize: '0.625rem',
                      padding: '0.1rem 0.35rem',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'rgba(217, 70, 239, 0.1)',
                      color: 'var(--color-accent-magenta)',
                    }}
                  >
                    System
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Main Matrix Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Role Info & Actions Banner */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 500 }}>{selectedRoleName} Permissions</h2>
              {selectedMatrix?.role.is_system ? (
                <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                  Protected Role
                </span>
              ) : (
                <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>
                  Custom Role
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              {selectedMatrix?.role.description || 'Custom organizational permission rules.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Delete custom role button */}
            {!selectedMatrix?.role.is_system && (
              <button
                id="btn-delete-role"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete role '${selectedRoleName}'?`)) {
                    deleteRoleMutation.mutate(selectedRoleName);
                  }
                }}
                disabled={deleteRoleMutation.isPending}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--color-danger)', gap: '0.35rem' }}
              >
                <Trash2 size={14} /> Delete Role
              </button>
            )}

            {/* Discard button */}
            {isDirty && (
              <button
                id="btn-discard-permissions"
                onClick={handleDiscard}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <RotateCcw size={14} /> Discard
              </button>
            )}

            {/* Save button */}
            {!isSuperAdminRole && (
              <button
                id="btn-save-permissions"
                onClick={() => saveMutation.mutate()}
                disabled={!isDirty || saveMutation.isPending}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.4rem' }}
              >
                <Save size={14} /> {saveMutation.isPending ? 'Saving...' : 'Save Permissions'}
              </button>
            )}
          </div>
        </div>

        {/* SuperAdmin Master Notice */}
        {isSuperAdminRole && (
          <div
            style={{
              padding: '0.85rem 1.5rem',
              backgroundColor: 'rgba(217, 70, 239, 0.06)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--color-accent-magenta)',
            }}
          >
            <Lock size={14} />
            <span>
              <strong>Master Access Protected:</strong> System Administrator automatically retains unconditional View, Create, Update, and Delete permissions across all modules.
            </span>
          </div>
        )}

        {/* Permissions Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
                <th style={{ padding: '0.875rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Module / Page
                </th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Can View
                  <div style={{ fontSize: '0.6875rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>Nav item & read</div>
                </th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Can Create
                  <div style={{ fontSize: '0.6875rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>+Add buttons</div>
                </th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Can Update
                  <div style={{ fontSize: '0.6875rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>Edit actions</div>
                </th>
                <th style={{ padding: '0.875rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Can Delete
                  <div style={{ fontSize: '0.6875rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>Delete & remove</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {PAGES_CONFIG.map((page) => {
                const Icon = page.icon;
                const perm = localPermissions[page.id] || {
                  page: page.id,
                  can_view: isSuperAdminRole,
                  can_create: isSuperAdminRole,
                  can_update: isSuperAdminRole,
                  can_delete: isSuperAdminRole,
                };

                return (
                  <tr
                    key={page.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Module info */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-secondary)',
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{page.name}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{page.description}</div>
                        </div>
                      </div>
                    </td>

                    {/* Can View Toggle */}
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <ToggleSwitch
                        id={`toggle-${selectedRoleName}-${page.id}-view`}
                        checked={perm.can_view}
                        disabled={isSuperAdminRole}
                        onChange={() => handleToggle(page.id, 'can_view')}
                      />
                    </td>

                    {/* Can Create Toggle */}
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <ToggleSwitch
                        id={`toggle-${selectedRoleName}-${page.id}-create`}
                        checked={perm.can_create}
                        disabled={isSuperAdminRole || !perm.can_view}
                        onChange={() => handleToggle(page.id, 'can_create')}
                      />
                    </td>

                    {/* Can Update Toggle */}
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <ToggleSwitch
                        id={`toggle-${selectedRoleName}-${page.id}-update`}
                        checked={perm.can_update}
                        disabled={isSuperAdminRole || !perm.can_view}
                        onChange={() => handleToggle(page.id, 'can_update')}
                      />
                    </td>

                    {/* Can Delete Toggle */}
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      <ToggleSwitch
                        id={`toggle-${selectedRoleName}-${page.id}-delete`}
                        checked={perm.can_delete}
                        disabled={isSuperAdminRole || !perm.can_view}
                        onChange={() => handleToggle(page.id, 'can_delete')}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {isDirty && (
          <div
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-warning)' }}>
              ● Unsaved permission changes for <strong>{selectedRoleName}</strong>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={handleDiscard} className="btn btn-secondary btn-sm">
                Discard
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="btn btn-primary btn-sm"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Custom Role Modal */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--bg-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '420px', padding: '1.75rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Create New Role</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
              Add a new custom role to the organizational matrix.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newRoleName.trim()) {
                  createRoleMutation.mutate();
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Role Name *
                </label>
                <input
                  id="input-new-role-name"
                  type="text"
                  required
                  placeholder="e.g. Auditor, TeamLead, Recruiter"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Description
                </label>
                <input
                  id="input-new-role-desc"
                  type="text"
                  placeholder="e.g. Department reporting and audit oversight"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRoleName.trim() || createRoleMutation.isPending}
                  className="btn btn-primary btn-sm"
                >
                  {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Clean Custom Toggle Switch Component
interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, disabled, onChange }) => {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '40px',
        height: '22px',
        borderRadius: '9999px',
        backgroundColor: checked ? 'var(--color-accent-magenta)' : 'var(--bg-surface-elevated)',
        border: checked ? '1px solid var(--color-accent-magenta)' : '1px solid var(--border-default)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all var(--transition-fast)',
        padding: '2px',
      }}
    >
      <span
        style={{
          display: 'block',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          transform: checked ? 'translateX(18px)' : 'translateX(0px)',
          transition: 'transform var(--transition-fast)',
        }}
      />
    </button>
  );
};
