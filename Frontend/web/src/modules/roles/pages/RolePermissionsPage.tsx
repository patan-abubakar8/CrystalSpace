import React, { useState, useEffect } from 'react';
import type { RolePermissionsMatrix, PagePermission } from '../../../types';
import {
  ArrowLeft,
  ShieldCheck,
  Shield,
  Lock,
  Save,
  RotateCcw,
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CreditCard,
  FolderGit2,
  Clock,
  CircleCheck,
  NotebookPen,
  CalendarDays,
  MessagesSquare,
  Video,
  FileText,
  Ticket,
  Megaphone,
  ListChecks,
  ScrollText,
  Settings,
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
    description: 'Executive overview, key workforce metrics, and organizational activity',
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
    name: 'Projects',
    description: 'Work initiatives, deliverables, and project task tracking',
    icon: FolderGit2,
  },
  {
    id: 'tasks',
    name: 'Tasks',
    description: 'Assigned work items, priorities, and due dates',
    icon: CircleCheck,
  },
  {
    id: 'daily-logs',
    name: 'Daily Logs',
    description: 'Day-to-day work updates and progress notes',
    icon: NotebookPen,
  },
  {
    id: 'attendance',
    name: 'Attendance',
    description: 'Clock in/out records, work hours, and attendance history',
    icon: Clock,
  },
  {
    id: 'calendar',
    name: 'Company Calendar',
    description: 'Holidays, org-wide events, and team schedules',
    icon: CalendarDays,
  },
  {
    id: 'chats',
    name: 'Chats',
    description: 'Direct and group team conversations',
    icon: MessagesSquare,
  },
  {
    id: 'meetings',
    name: 'Meetings',
    description: 'Meeting schedules, agendas, and outcomes',
    icon: Video,
  },
  {
    id: 'documents',
    name: 'Documents',
    description: 'Company and employee document storage',
    icon: FileText,
  },
  {
    id: 'support',
    name: 'IT Support Tickets',
    description: 'Internal IT requests and resolution tracking',
    icon: Ticket,
  },
  {
    id: 'announcements',
    name: 'Announcements',
    description: 'Company-wide notices and broadcast updates',
    icon: Megaphone,
  },
  {
    id: 'roles',
    name: 'Roles & Permissions',
    description: 'Dynamic access control matrix and role administrative rights',
    icon: ShieldCheck,
  },
  {
    id: 'workflows',
    name: 'Approval Workflows',
    description: 'Multi-step approval chains for requests and records',
    icon: ListChecks,
  },
  {
    id: 'audit-logs',
    name: 'Audit Logs',
    description: 'Chronological trail of administrative actions and changes',
    icon: ScrollText,
  },
  {
    id: 'org-settings',
    name: 'Org Settings',
    description: 'Organization-wide preferences, policies, and defaults',
    icon: Settings,
  },
];

interface RolePermissionsPageProps {
  roleName: string;
  matrix: RolePermissionsMatrix[];
  onBack: () => void;
  onSelectRole: (newRoleName: string) => void;
  onSave: (roleName: string, permissions: PagePermission[]) => Promise<void>;
  isSaving: boolean;
}

export const RolePermissionsPage: React.FC<RolePermissionsPageProps> = ({
  roleName,
  matrix,
  onBack,
  onSelectRole,
  onSave,
  isSaving,
}) => {
  const currentMatrix = matrix.find((m) => m.role.name === roleName);
  const isSuperAdmin = roleName === 'SuperAdmin';

  const [localPermissions, setLocalPermissions] = useState<Record<string, PagePermission>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Synchronize permissions when role or remote matrix changes
  useEffect(() => {
    if (currentMatrix) {
      const copy: Record<string, PagePermission> = {};
      PAGES_CONFIG.forEach((p) => {
        copy[p.id] = currentMatrix.permissions[p.id] || {
          page: p.id,
          can_view: isSuperAdmin,
          can_create: isSuperAdmin,
          can_update: isSuperAdmin,
          can_delete: isSuperAdmin,
        };
      });
      setLocalPermissions(copy);
      setIsDirty(false);
    }
  }, [roleName, currentMatrix, isSuperAdmin]);

  const handleToggle = (pageId: string, action: 'can_view' | 'can_create' | 'can_update' | 'can_delete') => {
    if (isSuperAdmin) return; // SuperAdmin locked

    setLocalPermissions((prev) => {
      const current = prev[pageId] || {
        page: pageId,
        can_view: false,
        can_create: false,
        can_update: false,
        can_delete: false,
      };

      const updated = { ...current };
      const nextVal = !updated[action];
      updated[action] = nextVal;

      // Cascading logic:
      // If any mutation (create, update, delete) is turned ON, can_view must be ON
      if ((action === 'can_create' || action === 'can_update' || action === 'can_delete') && nextVal) {
        updated.can_view = true;
      }

      // If can_view is turned OFF, turn OFF all mutations
      if (action === 'can_view' && !nextVal) {
        updated.can_create = false;
        updated.can_update = false;
        updated.can_delete = false;
      }

      setIsDirty(true);
      return {
        ...prev,
        [pageId]: updated,
      };
    });
  };

  const handleDiscard = () => {
    if (currentMatrix) {
      const copy: Record<string, PagePermission> = {};
      PAGES_CONFIG.forEach((p) => {
        copy[p.id] = currentMatrix.permissions[p.id] || {
          page: p.id,
          can_view: isSuperAdmin,
          can_create: isSuperAdmin,
          can_update: isSuperAdmin,
          can_delete: isSuperAdmin,
        };
      });
      setLocalPermissions(copy);
      setIsDirty(false);
    }
  };

  const handleSave = async () => {
    const list = Object.values(localPermissions);
    await onSave(roleName, list);
    setIsDirty(false);
  };

  const handleSwitchRole = (newRole: string) => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Discard and switch role?')) {
        onSelectRole(newRole);
      }
    } else {
      onSelectRole(newRole);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Discard and return to roles list?')) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Top Navigation & Role Details Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <button
            id="btn-back-to-roles"
            onClick={handleBack}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={15} /> Back to All Roles
          </button>

          {/* Quick role switcher tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginRight: '0.25rem' }}>
              Switch Role:
            </span>
            {matrix.map((m) => {
              const isSelected = m.role.name === roleName;
              return (
                <button
                  key={m.role.id}
                  id={`tab-switch-${m.role.name}`}
                  onClick={() => handleSwitchRole(m.role.name)}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 500 : 400,
                    border: isSelected ? '1px solid var(--color-primary-action)' : '1px solid var(--border-subtle)',
                    backgroundColor: isSelected ? 'var(--color-success-bg)' : 'var(--bg-surface)',
                    color: isSelected ? 'var(--color-primary-action)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {m.role.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Role Identity Card */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSuperAdmin ? 'var(--color-success-bg)' : 'var(--bg-surface-elevated)',
                border: `1px solid ${isSuperAdmin ? 'var(--color-success-bg)' : 'var(--border-subtle)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSuperAdmin ? 'var(--color-primary-action)' : 'var(--text-secondary)',
              }}
            >
              {isSuperAdmin ? <ShieldCheck size={22} /> : <Shield size={22} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 500, margin: 0 }}>
                  {roleName} Permissions
                </h2>
                {currentMatrix?.role.is_system ? (
                  <span
                    className="badge"
                    style={{
                      backgroundColor: 'var(--bg-surface-elevated)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.7rem',
                    }}
                  >
                    <Lock size={10} style={{ marginRight: '0.2rem' }} /> System Protected
                  </span>
                ) : (
                  <span
                    className="badge"
                    style={{
                      backgroundColor: 'var(--color-info-bg)',
                      color: 'var(--color-accent)',
                      border: '1px solid var(--color-info-bg)',
                      fontSize: '0.7rem',
                    }}
                  >
                    Custom Role
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                {currentMatrix?.role.description || 'Configure granular view, create, edit, and delete permissions for this role.'}
              </p>
            </div>
          </div>

          {/* Action buttons if dirty */}
          {isDirty && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <button
                id="btn-discard-permissions-top"
                onClick={handleDiscard}
                className="btn btn-secondary btn-sm"
              >
                <RotateCcw size={14} /> Discard
              </button>
              <button
                id="btn-save-permissions-top"
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary btn-sm"
              >
                <Save size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SuperAdmin Master Protection Notice */}
      {isSuperAdmin && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-bg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            color: 'var(--text-secondary)',
            fontSize: '0.8125rem',
          }}
        >
          <Lock size={16} color="var(--color-primary-action)" />
          <span>
            <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              Master Access Policy:
            </strong>{' '}
            System Administrator retains permanent, unconditional View, Create, Update, and Delete rights across all modules to ensure system continuity.
          </span>
        </div>
      )}

      {/* Granular Permission Matrix Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                }}
              >
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  MODULE / PAGE
                </th>
                <th
                  style={{
                    padding: '0.875rem 1.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    width: '120px',
                  }}
                >
                  <div>CAN VIEW</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>Nav item & read</div>
                </th>
                <th
                  style={{
                    padding: '0.875rem 1.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    width: '120px',
                  }}
                >
                  <div>CAN CREATE</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>+ Add buttons</div>
                </th>
                <th
                  style={{
                    padding: '0.875rem 1.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    width: '120px',
                  }}
                >
                  <div>CAN UPDATE</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>Edit actions</div>
                </th>
                <th
                  style={{
                    padding: '0.875rem 1.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    width: '120px',
                  }}
                >
                  <div>CAN DELETE</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>Delete & remove</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {PAGES_CONFIG.map((page) => {
                const Icon = page.icon;
                const perm = localPermissions[page.id] || {
                  page: page.id,
                  can_view: false,
                  can_create: false,
                  can_update: false,
                  can_delete: false,
                };

                return (
                  <tr
                    key={page.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    className="hover-bg-surface-elevated"
                  >
                    {/* Module Details */}
                    <td style={{ padding: '1.125rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-primary-action)',
                          }}
                        >
                          <Icon size={17} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {page.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {page.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Can View Switch */}
                    <td style={{ padding: '1.125rem 1.25rem', textAlign: 'center' }}>
                      <ToggleSwitch
                        id={`switch-${page.id}-view`}
                        checked={perm.can_view}
                        disabled={isSuperAdmin}
                        onChange={() => handleToggle(page.id, 'can_view')}
                      />
                    </td>

                    {/* Can Create Switch */}
                    <td style={{ padding: '1.125rem 1.25rem', textAlign: 'center' }}>
                      <ToggleSwitch
                        id={`switch-${page.id}-create`}
                        checked={perm.can_create}
                        disabled={isSuperAdmin}
                        onChange={() => handleToggle(page.id, 'can_create')}
                      />
                    </td>

                    {/* Can Update Switch */}
                    <td style={{ padding: '1.125rem 1.25rem', textAlign: 'center' }}>
                      <ToggleSwitch
                        id={`switch-${page.id}-update`}
                        checked={perm.can_update}
                        disabled={isSuperAdmin}
                        onChange={() => handleToggle(page.id, 'can_update')}
                      />
                    </td>

                    {/* Can Delete Switch */}
                    <td style={{ padding: '1.125rem 1.25rem', textAlign: 'center' }}>
                      <ToggleSwitch
                        id={`switch-${page.id}-delete`}
                        checked={perm.can_delete}
                        disabled={isSuperAdmin}
                        onChange={() => handleToggle(page.id, 'can_delete')}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Save Bar when dirty */}
      {isDirty && (
        <div
          style={{
            position: 'sticky',
            bottom: '1.5rem',
            padding: '1rem 1.5rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            zIndex: 40,
            backdropFilter: 'var(--glass-blur)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-warning)',
              }}
            />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              Unsaved modifications for {roleName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              id="btn-discard-permissions-bottom"
              onClick={handleDiscard}
              className="btn btn-secondary btn-sm"
            >
              <RotateCcw size={14} /> Discard Changes
            </button>
            <button
              id="btn-save-permissions-bottom"
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary btn-sm"
            >
              <Save size={14} /> {isSaving ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
        width: '38px',
        height: '22px',
        borderRadius: '8px',
        backgroundColor: checked
          ? 'var(--color-primary-action)'
          : 'var(--border-default)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'background-color 0.2s ease, opacity 0.2s ease',
        padding: '2px',
        outline: 'none',
      }}
    >
      <span
        style={{
          display: 'block',
          width: '18px',
          height: '18px',
          borderRadius: '8px',
          backgroundColor: 'var(--switch-knob)',
          boxShadow: 'var(--shadow-md)',
          transform: checked ? 'translateX(16px)' : 'translateX(0)',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </button>
  );
};
