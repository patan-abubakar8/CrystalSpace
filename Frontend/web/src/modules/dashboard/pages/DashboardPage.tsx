import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
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
  Shield,
  Layers
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

  const { data: stats, isLoading } = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: dashboardApi.getStats,
    refetchInterval: 15000, // Background poll every 15s for live dashboard
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div
        className="card card-glass"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(16, 185, 129, 0.05))',
          borderColor: 'rgba(99, 102, 241, 0.2)',
          padding: '2rem',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-primary">CrystalSpace Enterprise</span>
            <span className="badge badge-success">Online</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>
            Welcome back, {user?.email.split('@')[0]}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '600px' }}>
            System operations are running smoothly with PostgreSQL connection pooling and JWT RBAC authentication.
          </p>
        </div>

        {/* Quick Actions */}
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <StatCard
          id="stat-card-employees"
          label="Total Workforce"
          value={isLoading ? '...' : stats?.total_employees ?? 0}
          icon={Users}
          changeText="Active members registered"
          accentColor="#6366f1"
          onClick={() => onNavigate('employees')}
        />

        <StatCard
          id="stat-card-departments"
          label="Departments"
          value={isLoading ? '...' : stats?.total_departments ?? 0}
          icon={Building2}
          changeText="Operational units"
          accentColor="#0ea5e9"
          onClick={() => onNavigate('departments')}
        />

        <StatCard
          id="stat-card-leaves"
          label="Active Leaves"
          value={isLoading ? '...' : stats?.active_leaves ?? 0}
          icon={CalendarCheck}
          changeText="Pending approvals"
          isPositive={(stats?.active_leaves ?? 0) === 0}
          accentColor="#10b981"
          onClick={() => onNavigate('leaves')}
        />

        <StatCard
          id="stat-card-projects"
          label="Active Projects"
          value={isLoading ? '...' : stats?.total_projects ?? 0}
          icon={FolderGit2}
          changeText="Tracking milestones"
          accentColor="#f59e0b"
        />
      </div>

      {/* Bottom Grid: Architecture & Quick Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* N-Tier Architecture Diagnostics Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Layers size={18} color="var(--color-primary-400)" />
            <h2 style={{ fontSize: '1.125rem' }}>N-Tier Architecture Health</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Tier 1: Presentation API</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Go Chi Router + JWT Auth Middleware
                </div>
              </div>
              <span className="badge badge-success">Port 8080 (Healthy)</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Tier 2: Business Logic Layer</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Service domain validation & rules
                </div>
              </div>
              <span className="badge badge-success">Active</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Tier 3: Data Access Layer</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  PostgreSQL pgxpool (Port 5432)
                </div>
              </div>
              <span className="badge badge-success">Connected</span>
            </div>
          </div>
        </div>

        {/* User Identity & Security Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Shield size={18} color="var(--color-success)" />
            <h2 style={{ fontSize: '1.125rem' }}>Active Session Security</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Authenticated User</span>
              <span style={{ fontWeight: 600 }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Assigned Role</span>
              <span className="badge badge-primary">{user?.role}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>State Manager</span>
              <span style={{ fontWeight: 600, color: 'var(--color-primary-400)' }}>TanStack Query v5</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Role-Based Access</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                {user?.role === 'SuperAdmin' || user?.role === 'Admin'
                  ? 'Full Administrative Privileges'
                  : user?.role === 'HR'
                  ? 'HR & Department Management'
                  : 'Employee Self-Service'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
