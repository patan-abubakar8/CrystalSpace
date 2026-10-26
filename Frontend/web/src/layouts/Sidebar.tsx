import React, { useState, useEffect } from 'react';
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
  PanelLeftClose,
  PanelLeftOpen,
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

  // Expand / Collapse state with localStorage persistence
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cs_sidebar_expanded') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cs_sidebar_expanded', String(next));
      } catch {
        // Ignore localStorage error
      }
      return next;
    });
  };

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
      <aside
        className={`sidebar-container ${isExpanded ? 'expanded' : 'collapsed'}`}
        aria-label="Main Navigation"
      >
        {/* Top: Brand Header & Collapse/Expand Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {isExpanded ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.25rem 0.25rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => onTabChange('dashboard')}
                title="CrystalSpace Dashboard"
              >
                <CrystalLogo variant="full" height={26} theme={theme} />
              </div>
              <button
                id="btn-collapse-sidebar"
                onClick={toggleSidebar}
                className="sidebar-icon-btn"
                style={{ width: '32px', height: '32px' }}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.625rem',
                marginBottom: '1.25rem',
              }}
            >
              {/* Logo Tile (Compact 38px, Logo height 20) */}
              <button
                id="sidebar-brand-btn"
                onClick={() => onTabChange('dashboard')}
                className="sidebar-icon-btn"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: 0,
                  cursor: 'pointer',
                }}
                title="CrystalSpace Platform"
              >
                <CrystalLogo variant="icon" height={20} showBadge={false} />
                <span className="sidebar-tooltip">CrystalSpace Platform</span>
              </button>

              {/* Expand Toggle Button */}
              <button
                id="btn-expand-sidebar"
                onClick={toggleSidebar}
                className="sidebar-icon-btn"
                style={{ width: '32px', height: '32px', color: 'var(--text-tertiary)' }}
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen size={15} />
                <span className="sidebar-tooltip">Expand Sidebar</span>
              </button>
            </div>
          )}

          {/* Primary Navigation Stack */}
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isExpanded ? 'stretch' : 'center',
              gap: isExpanded ? '0.25rem' : '0.625rem',
              width: '100%',
            }}
          >


            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              if (isExpanded) {
                return (
                  <button
                    key={item.id}
                    id={`nav-row-${item.id}`}
                    onClick={() => onTabChange(item.id)}
                    className={`sidebar-row-btn ${isActive ? 'active' : ''}`}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={16} />
                    <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  id={`nav-rail-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  className={`sidebar-icon-btn ${isActive ? 'active' : ''}`}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={16} />
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
            alignItems: isExpanded ? 'stretch' : 'center',
            gap: isExpanded ? '0.25rem' : '0.5rem',
            width: '100%',
          }}
        >
          {/* Subtle separator */}
          <div
            style={{
              width: isExpanded ? '100%' : '26px',
              height: '1px',
              backgroundColor: 'var(--border-subtle)',
              margin: '0.35rem 0',
              alignSelf: 'center',
            }}
          />

          {isExpanded && (
            <div
              style={{
                fontSize: '0.6875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-tertiary)',
                padding: '0.25rem 0.75rem 0.25rem',
              }}
            >
              System
            </div>
          )}

          {/* Settings */}
          {isExpanded ? (
            <button
              id="btn-sidebar-settings"
              onClick={() => setIsSettingsOpen(true)}
              className="sidebar-row-btn"
              aria-label="Platform Settings"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
          ) : (
            <button
              id="btn-sidebar-settings"
              onClick={() => setIsSettingsOpen(true)}
              className="sidebar-icon-btn"
              aria-label="Platform Settings"
            >
              <Settings size={16} />
              <span className="sidebar-tooltip">Settings</span>
            </button>
          )}

          {/* Help & Support */}
          {isExpanded ? (
            <button
              id="btn-sidebar-help"
              onClick={() => setIsHelpOpen(true)}
              className="sidebar-row-btn"
              aria-label="Help & Documentation"
            >
              <HelpCircle size={16} />
              <span>Help & Resources</span>
            </button>
          ) : (
            <button
              id="btn-sidebar-help"
              onClick={() => setIsHelpOpen(true)}
              className="sidebar-icon-btn"
              aria-label="Help & Documentation"
            >
              <HelpCircle size={16} />
              <span className="sidebar-tooltip">Help & Resources</span>
            </button>
          )}

          {/* Logout */}
          {isExpanded ? (
            <button
              id="btn-sidebar-logout"
              onClick={logout}
              className="sidebar-row-btn"
              aria-label="Sign Out"
              style={{ color: 'var(--text-secondary)' }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              id="btn-sidebar-logout"
              onClick={logout}
              className="sidebar-icon-btn"
              aria-label="Sign Out"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <LogOut size={16} />
              <span className="sidebar-tooltip">Sign Out ({user?.role || 'User'})</span>
            </button>
          )}

          {/* User Profile Avatar / Session Card */}
          {isExpanded ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.625rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                marginTop: '0.35rem',
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || 'U'}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-success)',
                    border: '1.5px solid var(--bg-surface)',
                  }}
                />
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.email || 'Authenticated User'}
                </div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--color-accent-magenta)',
                    fontWeight: 400,
                  }}
                >
                  {user?.role || 'SuperAdmin'}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="sidebar-icon-btn"
              style={{
                width: '32px',
                height: '32px',
                marginTop: '0.15rem',
                padding: 0,
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(217, 70, 239, 0.3)',
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || 'U'}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-success)',
                    border: '1.5px solid var(--bg-surface)',
                  }}
                />
              </div>
              <span className="sidebar-tooltip">
                {user?.email || 'Logged In'} ({user?.role || 'SuperAdmin'})
              </span>
            </div>
          )}
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
