import React from 'react';
import { useAuth } from '../modules/auth/context/AuthContext';
import { CrystalLogo } from '../core/ui/CrystalLogo';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { usePermissions } from '../core/context/PermissionContext';

export type NavigationTab = 'dashboard' | 'employees' | 'departments' | 'leaves' | 'roles';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const { can } = usePermissions();

  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees' as NavigationTab, label: 'Employees', icon: Users },
    { id: 'departments' as NavigationTab, label: 'Departments', icon: Building2 },
    { id: 'leaves' as NavigationTab, label: 'Leave Management', icon: CalendarCheck },
    { id: 'roles' as NavigationTab, label: 'Roles & Permissions', icon: ShieldCheck },
  ];

  // Dynamically filter navigation items based on database permissions
  const visibleNavItems = navItems.filter((item) => can(item.id, 'view'));

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      <div>
        {/* Brand Header */}
        <div
          style={{
            padding: '1.35rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <CrystalLogo variant="full" height={32} />
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '1.25rem 0.75rem' }}>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-tertiary)',
              padding: '0 0.75rem 0.5rem',
            }}
          >
            Main Menu
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.75rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isActive ? 'var(--color-primary-gradient)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 500 : 400,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* User Session Footer */}
      <div
        style={{
          padding: '1.25rem 1rem',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 500,
                fontSize: '0.875rem',
                flexShrink: 0,
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 400,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.email}
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: 400,
                }}
              >
                <ShieldCheck size={12} color="var(--color-accent-magenta)" />
                {user?.role}
              </div>
            </div>
          </div>
          <button
            id="btn-sidebar-logout"
            onClick={logout}
            className="btn btn-ghost btn-icon btn-sm"
            title="Sign out"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
