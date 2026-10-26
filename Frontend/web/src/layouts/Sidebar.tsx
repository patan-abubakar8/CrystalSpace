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
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  MoreVertical,
  Clock,
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
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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
                style={{ width: '32px', height: '32px' }}
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
            {isExpanded && (
              <div
                style={{
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-tertiary)',
                  padding: '0.25rem 0.75rem 0.35rem',
                }}
              >
                Main Menu
              </div>
            )}

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

        {/* Bottom Utility Stack: Notification, Theme, and Profile */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isExpanded ? 'stretch' : 'center',
            gap: isExpanded ? '0.4rem' : '0.5rem',
            width: '100%',
          }}
        >
          {/* Subtle separator */}
          <div
            style={{
              width: isExpanded ? '100%' : '26px',
              height: '1px',
              backgroundColor: 'var(--border-subtle)',
              margin: '0.25rem 0',
              alignSelf: 'center',
            }}
          />

          {/* 1. NOTIFICATION & THEME BUTTONS ABOVE PROFILE */}
          {isExpanded ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              {/* Notification Button */}
              <button
                id="btn-sidebar-notification"
                onClick={() => setIsNotificationOpen(true)}
                className="sidebar-row-btn"
                style={{ padding: '0.45rem 0.6rem', fontSize: '0.75rem', position: 'relative' }}
                title="View Notifications"
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Bell size={15} />
                  <span
                    style={{
                      position: 'absolute',
                      top: '-1px',
                      right: '-1px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-accent-magenta)',
                    }}
                  />
                </div>
                <span>Alerts</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                id="btn-sidebar-theme"
                onClick={toggleTheme}
                className="sidebar-row-btn"
                style={{ padding: '0.45rem 0.6rem', fontSize: '0.75rem' }}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              {/* Notification Button */}
              <button
                id="btn-sidebar-notification"
                onClick={() => setIsNotificationOpen(true)}
                className="sidebar-icon-btn"
                style={{ position: 'relative' }}
                aria-label="Notifications"
              >
                <Bell size={16} />
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-accent-magenta)',
                  }}
                />
                <span className="sidebar-tooltip">Notifications</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                id="btn-sidebar-theme"
                onClick={toggleTheme}
                className="sidebar-icon-btn"
                aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span className="sidebar-tooltip">
                  {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </span>
              </button>
            </div>
          )}

          {/* 2. PROFILE WITH 3-DOT MENU (EXPANDED) OR HOVER FLYOUT (COLLAPSED) */}
          {isExpanded ? (
            <div style={{ position: 'relative' }}>
              {/* Profile Card in Expanded Mode */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  marginTop: '0.2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0, flex: 1 }}>
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
                      {user?.email || 'User Account'}
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

                {/* 3-Dot Icon Button */}
                <button
                  id="btn-sidebar-user-more"
                  onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                  className="sidebar-icon-btn"
                  style={{ width: '28px', height: '28px' }}
                  title="Account Options"
                  aria-label="Account Options"
                >
                  <MoreVertical size={15} />
                </button>
              </div>

              {/* Dropdown Menu when 3-dot is clicked */}
              {isUserDropdownOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="profile-dropdown-menu animate-fade-in">
                    <div style={{ padding: '0.35rem 0.5rem', marginBottom: '0.25rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {user?.email}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-accent-magenta)' }}>
                        {user?.role}
                      </div>
                    </div>

                    <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.35rem 0' }} />

                    <button
                      className="flyout-menu-item"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setIsSettingsOpen(true);
                      }}
                    >
                      <Settings size={15} />
                      <span>Settings</span>
                    </button>

                    <button
                      className="flyout-menu-item"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setIsHelpOpen(true);
                      }}
                    >
                      <HelpCircle size={15} />
                      <span>Help & Resources</span>
                    </button>

                    <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.35rem 0' }} />

                    <button
                      className="flyout-menu-item danger"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        logout();
                      }}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Collapsed Mode: Hover on Profile Picture triggers Flyout */
            <div className="profile-flyout-wrapper">
              <button
                id="btn-profile-collapsed-avatar"
                className="sidebar-icon-btn"
                style={{
                  width: '34px',
                  height: '34px',
                  padding: 0,
                  cursor: 'pointer',
                }}
                aria-label="Account Menu"
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
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
              </button>

              {/* Flyout Menu Appearing on Hover (with bridge) */}
              <div className="profile-flyout-menu">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.35rem 0.5rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--color-primary-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      flexShrink: 0,
                    }}
                  >
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
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
                      {user?.email || 'User Account'}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-accent-magenta)' }}>
                      {user?.role || 'SuperAdmin'}
                    </div>
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.35rem 0' }} />

                <button
                  className="flyout-menu-item"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings size={15} />
                  <span>Platform Settings</span>
                </button>

                <button
                  className="flyout-menu-item"
                  onClick={() => setIsHelpOpen(true)}
                >
                  <HelpCircle size={15} />
                  <span>Help & Resources</span>
                </button>

                <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.35rem 0' }} />

                <button
                  className="flyout-menu-item danger"
                  onClick={logout}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Notifications Modal */}
      {isNotificationOpen && (
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
          onClick={() => setIsNotificationOpen(false)}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '420px',
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
                <Bell size={18} color="var(--color-accent-magenta)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 500, margin: 0 }}>
                  System Notifications
                </h3>
              </div>
              <button
                id="btn-close-notification-modal"
                onClick={() => setIsNotificationOpen(false)}
                className="btn btn-secondary btn-icon btn-sm"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  padding: '0.75rem 0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>RBAC Dynamic Permissions Active</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock size={11} /> Just now
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                  Database-driven permission matrix for all organizational roles is synced with PostgreSQL.
                </p>
              </div>

              <div
                style={{
                  padding: '0.75rem 0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>API v1 Service Healthy</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock size={11} /> 5m ago
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                  Go N-Tier backend server connected with connection pool active.
                </p>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsNotificationOpen(false)}
                style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
              >
                Dismiss All Notifications
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <span>Toggle Theme</span>
                  <span style={{ color: 'var(--text-tertiary)' }}>Sidebar / Preferences</span>
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
