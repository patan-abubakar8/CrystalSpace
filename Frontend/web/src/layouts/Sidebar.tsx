import React, { useState } from 'react';
import { useAuth } from '../modules/auth/context/AuthContext';
import { CrystalLogo } from '../core/ui/CrystalLogo';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  ShieldCheck,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Moon,
  Sun,
  Shield,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { usePermissions } from '../core/context/PermissionContext';
import { useTheme } from '../core/context/ThemeContext';

export type NavigationTab = 'dashboard' | 'employees' | 'departments' | 'leaves' | 'roles';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const { theme, toggleTheme } = useTheme();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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
    <>
      <aside className="sidebar-rail" aria-label="Main Navigation">
        {/* Top: Brand Logo Tile */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <button
            id="sidebar-brand-btn"
            onClick={() => onTabChange('dashboard')}
            className="sidebar-icon-btn"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '13px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              padding: 0,
              cursor: 'pointer',
              marginBottom: '1.5rem',
            }}
            title="CrystalSpace Platform"
          >
            <CrystalLogo variant="icon" height={28} showBadge={false} />
            <span className="sidebar-tooltip">CrystalSpace Platform</span>
          </button>

          {/* Primary Navigation Stack */}
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
            }}
          >
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-rail-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  className={`sidebar-icon-btn ${isActive ? 'active' : ''}`}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={20} />
                  <span className="sidebar-tooltip">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Stack */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.625rem',
            width: '100%',
          }}
        >
          {/* Subtle separator */}
          <div
            style={{
              width: '28px',
              height: '1px',
              backgroundColor: 'var(--border-subtle)',
              marginBottom: '0.25rem',
            }}
          />

          {/* Settings */}
          <button
            id="btn-sidebar-settings"
            onClick={() => setIsSettingsOpen(true)}
            className="sidebar-icon-btn"
            aria-label="Platform Settings"
          >
            <Settings size={19} />
            <span className="sidebar-tooltip">Settings</span>
          </button>

          {/* Help & Support */}
          <button
            id="btn-sidebar-help"
            onClick={() => setIsHelpOpen(true)}
            className="sidebar-icon-btn"
            aria-label="Help & Documentation"
          >
            <HelpCircle size={19} />
            <span className="sidebar-tooltip">Help & Resources</span>
          </button>

          {/* Logout */}
          <button
            id="btn-sidebar-logout"
            onClick={logout}
            className="sidebar-icon-btn"
            aria-label="Sign Out"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <LogOut size={19} />
            <span className="sidebar-tooltip">Sign Out ({user?.role || 'User'})</span>
          </button>

          {/* User Profile Avatar with Online Status */}
          <div
            className="sidebar-icon-btn"
            style={{
              width: '38px',
              height: '38px',
              marginTop: '0.25rem',
              padding: 0,
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--color-primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 500,
                fontSize: '0.8125rem',
                position: 'relative',
                boxShadow: '0 2px 10px rgba(217, 70, 239, 0.3)',
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
              <span
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)',
                  border: '2px solid var(--bg-surface)',
                }}
              />
            </div>
            <span className="sidebar-tooltip">
              {user?.email || 'Logged In'} ({user?.role || 'SuperAdmin'})
            </span>
          </div>
        </div>
      </aside>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setIsSettingsOpen(false)}
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
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={18} color="var(--color-accent-magenta)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 500, margin: 0 }}>
                  Platform Preferences
                </h3>
              </div>
              <button
                id="btn-close-settings-modal"
                onClick={() => setIsSettingsOpen(false)}
                className="btn btn-secondary btn-icon btn-sm"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Theme Preference */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Interface Appearance</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Current theme: {theme === 'dark' ? 'Dark Matte' : 'Clean Light'}
                  </div>
                </div>
                <button
                  id="btn-settings-toggle-theme"
                  onClick={toggleTheme}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>

              {/* User Account Info */}
              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                  Authenticated Account
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Email: <span style={{ color: 'var(--text-primary)' }}>{user?.email}</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Assigned Role:{' '}
                  <span
                    className="badge"
                    style={{
                      backgroundColor: 'rgba(168, 85, 247, 0.15)',
                      color: 'var(--color-accent-magenta)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      fontSize: '0.7rem',
                      padding: '0.15rem 0.45rem',
                      marginLeft: '0.25rem',
                    }}
                  >
                    <Shield size={10} style={{ marginRight: '0.2rem' }} />
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Backend Engine Status */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-success)',
                }}
              >
                <CheckCircle2 size={16} />
                <span>Go N-Tier API v1 & PostgreSQL Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {isHelpOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setIsHelpOpen(false)}
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
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={18} color="var(--color-accent-magenta)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 500, margin: 0 }}>
                  Help & Documentation
                </h3>
              </div>
              <button
                id="btn-close-help-modal"
                onClick={() => setIsHelpOpen(false)}
                className="btn btn-secondary btn-icon btn-sm"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                CrystalSpace is an enterprise Human Resource Management & Operations platform powered by Golang and PostgreSQL.
              </p>

              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Quick Shortcuts</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>Global Search</span>
                  <kbd style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>⌘K</kbd>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>Toggle Theme</span>
                  <span style={{ color: 'var(--text-tertiary)' }}>Navbar / Settings</span>
                </div>
              </div>

              <a
                href="#landing"
                onClick={(e) => {
                  e.preventDefault();
                  setIsHelpOpen(false);
                  window.location.hash = '#landing';
                  window.location.reload();
                }}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', width: '100%' }}
              >
                <span>View Crystal Overview & Features</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
