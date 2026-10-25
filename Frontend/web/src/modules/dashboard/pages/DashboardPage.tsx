import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { departmentApi } from '../../departments/api/departmentApi';
import { employeeApi } from '../../employees/api/employeeApi';
import { leaveApi } from '../../leaves/api/leaveApi';
import { queryKeys } from '../../../core/api/queryClient';
import { StatCard } from '../components/StatCard';
import type { NavigationTab } from '../../../layouts/Sidebar';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Users,
  Building2,
  CalendarCheck,
  FolderGit2,
  UserPlus,
  CalendarPlus,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenAddEmployee?: () => void;
  onOpenApplyLeave?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenAddEmployee,
  onOpenApplyLeave,
}) => {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000,
  });

  const { data: departments, isLoading: deptsLoading } = useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: departmentApi.list,
  });

  const { data: employees, isLoading: empsLoading } = useQuery({
    queryKey: queryKeys.employees.list(),
    queryFn: () => employeeApi.list(),
  });

  const { data: pendingLeaves, isLoading: leavesLoading } = useQuery({
    queryKey: queryKeys.leaves.pending,
    queryFn: leaveApi.listPending,
  });

  const rawName = user?.email ? user.email.split('@')[0] : 'Admin';
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Quick Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 500, marginBottom: '0.25rem' }}>
            Welcome back, {displayName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Here is a summary of your workforce, departments, and active approvals.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {(user?.role === 'Admin' || user?.role === 'HR' || user?.role === 'SuperAdmin') && (
            <button
              id="btn-quick-add-employee"
              onClick={() => {
                onNavigate('employees');
                if (onOpenAddEmployee) onOpenAddEmployee();
              }}
              className="btn btn-primary"
            >
              <UserPlus size={16} /> Add Employee
            </button>
          )}

          <button
            id="btn-quick-apply-leave"
            onClick={() => {
              onNavigate('leaves');
              if (onOpenApplyLeave) onOpenApplyLeave();
            }}
            className="btn btn-secondary"
          >
            <CalendarPlus size={16} /> Request Leave
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <StatCard
          id="stat-card-employees"
          label="Total Workforce"
          value={statsLoading ? '...' : stats?.total_employees ?? 0}
          icon={Users}
          changeText="Registered members"
          onClick={() => onNavigate('employees')}
        />

        <StatCard
          id="stat-card-departments"
          label="Departments"
          value={statsLoading ? '...' : stats?.total_departments ?? 0}
          icon={Building2}
          changeText="Operational units"
          onClick={() => onNavigate('departments')}
        />

        <StatCard
          id="stat-card-leaves"
          label="Active Leaves"
          value={statsLoading ? '...' : stats?.active_leaves ?? 0}
          icon={CalendarCheck}
          changeText={
            (stats?.active_leaves ?? 0) === 0 ? 'All caught up' : 'Pending review'
          }
          onClick={() => onNavigate('leaves')}
        />

        <StatCard
          id="stat-card-projects"
          label="Active Projects"
          value={statsLoading ? '...' : stats?.total_projects ?? 0}
          icon={FolderGit2}
          changeText="In development"
        />
      </div>

      {/* Primary Section: Departments & Personnel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Departments Overview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Building2 size={16} />
              </div>
              <div>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 500 }}>Departments</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Organizational divisions
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('departments')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', gap: '0.25rem' }}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', flex: 1 }}>
            {deptsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                Loading departments...
              </div>
            ) : departments && departments.length > 0 ? (
              departments.slice(0, 5).map((dept) => (
                <div
                  key={dept.id}
                  onClick={() => onNavigate('departments')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.6875rem',
                        fontFamily: 'monospace',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {dept.code}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{dept.name}</div>
                      {dept.description && (
                        <div
                          style={{
                            fontSize: '0.6875rem',
                            color: 'var(--text-tertiary)',
                            maxWidth: '220px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {dept.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={15} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                No departments configured yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Personnel Overview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Users size={16} />
              </div>
              <div>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 500 }}>Recent Personnel</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Team members & directory
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('employees')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', gap: '0.25rem' }}
            >
              View directory <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', flex: 1 }}>
            {empsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                Loading personnel...
              </div>
            ) : employees && employees.length > 0 ? (
              employees.slice(0, 5).map((emp) => {
                const initials = `${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`.toUpperCase() || 'E';
                return (
                  <div
                    key={emp.id}
                    onClick={() => onNavigate('employees')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.875rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          color: 'var(--text-secondary)',
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                          {emp.first_name} {emp.last_name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                          {emp.designation || 'Staff'} • {emp.email}
                        </div>
                      </div>
                    </div>
                    <span
                      className="badge badge-success"
                      style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem' }}
                    >
                      {emp.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                No employees registered yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leave Management & Operational Pulse */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <CalendarCheck size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 500 }}>Leave & Absence Queue</h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Pending approvals and employee requests
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('leaves')}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', gap: '0.25rem' }}
          >
            Leave center <ArrowRight size={13} />
          </button>
        </div>

        {leavesLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
            Checking leave records...
          </div>
        ) : pendingLeaves && pendingLeaves.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingLeaves.map((leave) => (
              <div
                key={leave.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                    {leave.employee_name || `Employee #${leave.employee_id}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{leave.leave_type_name || 'Standard Leave'}</span>
                    <span>•</span>
                    <span>{leave.total_days} {leave.total_days === 1 ? 'day' : 'days'} ({leave.start_date} to {leave.end_date})</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>
                    <Clock size={11} /> Pending Review
                  </span>
                  <button
                    onClick={() => onNavigate('leaves')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-success)',
                marginBottom: '0.75rem',
              }}
            >
              <CheckCircle2 size={22} />
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              All leave requests are up to date
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', maxWidth: '380px', marginBottom: '1rem' }}>
              There are currently no approvals pending review. Any new leave submissions from your team will appear here.
            </p>
            <button
              onClick={() => {
                onNavigate('leaves');
                if (onOpenApplyLeave) onOpenApplyLeave();
              }}
              className="btn btn-secondary btn-sm"
            >
              <CalendarPlus size={14} /> Request Leave
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
