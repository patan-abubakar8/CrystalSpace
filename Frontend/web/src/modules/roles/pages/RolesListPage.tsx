import React, { useState } from 'react';
import type { RolePermissionsMatrix } from '../../../types';
import {
  Shield,
  ShieldCheck,
  Lock,
  Plus,
  Trash2,
  KeyRound,
  ArrowRight,
  Search,
  Sparkles,
} from 'lucide-react';

interface RolesListPageProps {
  matrix: RolePermissionsMatrix[];
  isLoading: boolean;
  onSelectRole: (roleName: string) => void;
  onCreateRoleClick: () => void;
  onDeleteRole: (roleName: string) => void;
  isDeleting: boolean;
}

export const RolesListPage: React.FC<RolesListPageProps> = ({
  matrix,
  isLoading,
  onSelectRole,
  onCreateRoleClick,
  onDeleteRole,
  isDeleting,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoles = matrix.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.role.name.toLowerCase().includes(q) ||
      (m.role.description && m.role.description.toLowerCase().includes(q))
    );
  });

  const totalRoles = matrix.length;
  const systemRolesCount = matrix.filter((m) => m.role.is_system).length;
  const customRolesCount = totalRoles - systemRolesCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.25rem' }}>
            Roles Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
            Configure organizational roles and grant or revoke module access rights.
          </p>
        </div>

        <button
          id="btn-create-role-modal-trigger"
          onClick={onCreateRoleClick}
          className="btn btn-primary"
        >
          <Plus size={16} /> Create New Role
        </button>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="card" style={{ padding: '1.125rem 1.25rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 400 }}>
            Total Roles
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 500, marginTop: '0.25rem' }}>
            {isLoading ? '...' : totalRoles}
          </div>
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Configured in system
          </div>
        </div>

        <div className="card" style={{ padding: '1.125rem 1.25rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 400 }}>
            System Roles
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 500, marginTop: '0.25rem' }}>
            {isLoading ? '...' : systemRolesCount}
          </div>
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Master protected
          </div>
        </div>

        <div className="card" style={{ padding: '1.125rem 1.25rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 400 }}>
            Custom Roles
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 500, marginTop: '0.25rem' }}>
            {isLoading ? '...' : customRolesCount}
          </div>
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            User created profiles
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.875rem 1.25rem',
        }}
      >
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <input
            id="input-role-search"
            type="text"
            className="form-control"
            placeholder="Search roles by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}
          />
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Showing {filteredRoles.length} of {matrix.length} roles
        </div>
      </div>

      {/* Roles List Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading roles and access policies...
          </div>
        ) : filteredRoles.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
            <Shield size={40} color="var(--text-tertiary)" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>No Roles Found</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              {searchQuery ? 'Try clearing your search query.' : 'Click Create New Role to add one.'}
            </p>
          </div>
        ) : (
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
                    ROLE
                  </th>
                  <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    DESCRIPTION
                  </th>
                  <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    ACCESS PRIVILEGES
                  </th>
                  <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    TYPE
                  </th>
                  <th
                    style={{
                      padding: '0.875rem 1.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      textAlign: 'right',
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((m) => {
                  const isSuperAdmin = m.role.name === 'SuperAdmin';
                  const activePagesCount = Object.values(m.permissions).filter((p) => p.can_view).length;
                  const totalPages = Object.keys(m.permissions).length || 7;

                  return (
                    <tr
                      key={m.role.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      className="hover-bg-surface-elevated"
                    >
                      {/* Role Name */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: isSuperAdmin
                                ? 'rgba(74, 222, 128, 0.15)'
                                : 'var(--bg-surface-elevated)',
                              border: `1px solid ${isSuperAdmin ? 'rgba(74, 222, 128, 0.3)' : 'var(--border-subtle)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isSuperAdmin ? 'var(--color-accent-magenta)' : 'var(--text-secondary)',
                            }}
                          >
                            {isSuperAdmin ? <ShieldCheck size={18} /> : <Shield size={17} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                              {m.role.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                              ID #{m.role.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td style={{ padding: '1rem 1.25rem', maxWidth: '320px' }}>
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.4,
                          }}
                        >
                          {m.role.description || 'No description provided'}
                        </div>
                      </td>

                      {/* Permissions Breakdown */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {isSuperAdmin ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: 'rgba(74, 222, 128, 0.15)',
                                color: 'var(--color-accent-magenta)',
                                border: '1px solid rgba(74, 222, 128, 0.3)',
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.55rem',
                              }}
                            >
                              <Sparkles size={11} style={{ marginRight: '0.25rem' }} />
                              Full Master Access
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: activePagesCount > 0 ? 'rgba(34, 197, 94, 0.12)' : 'var(--bg-surface-elevated)',
                                color: activePagesCount > 0 ? 'var(--color-success)' : 'var(--text-tertiary)',
                                border: `1px solid ${activePagesCount > 0 ? 'rgba(34, 197, 94, 0.25)' : 'var(--border-subtle)'}`,
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.55rem',
                              }}
                            >
                              {activePagesCount} of {totalPages} Modules
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Role Type */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {m.role.is_system ? (
                          <span
                            className="badge"
                            style={{
                              backgroundColor: 'var(--bg-surface-elevated)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.55rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Lock size={10} /> System Role
                          </span>
                        ) : (
                          <span
                            className="badge"
                            style={{
                              backgroundColor: 'rgba(59, 130, 246, 0.12)',
                              color: 'var(--color-primary-blue)',
                              border: '1px solid rgba(59, 130, 246, 0.25)',
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.55rem',
                            }}
                          >
                            Custom Role
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            id={`btn-configure-role-${m.role.name}`}
                            onClick={() => onSelectRole(m.role.name)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              fontSize: '0.8125rem',
                            }}
                          >
                            <KeyRound size={13} />
                            Permissions
                            <ArrowRight size={13} />
                          </button>

                          {!m.role.is_system && (
                            <button
                              id={`btn-delete-role-${m.role.id}`}
                              onClick={() => onDeleteRole(m.role.name)}
                              disabled={isDeleting}
                              className="btn btn-danger btn-sm btn-icon"
                              title="Delete Custom Role"
                              aria-label="Delete Custom Role"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
