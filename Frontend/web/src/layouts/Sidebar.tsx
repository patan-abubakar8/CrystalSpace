import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../modules/auth/context/AuthContext';
import { CrystalLogo } from '../core/ui/CrystalLogo';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  ShieldCheck,
  LogOut,
  X,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  MoreVertical,
  Clock,
  FolderKanban,
  CircleCheck,
  NotebookPen,
  CalendarDays,
  MessagesSquare,
  Video,
  Ticket,
  FileText,
  Megaphone,
  ListChecks,
  ScrollText,
  Settings,
} from 'lucide-react';
import { usePermissions } from '../core/context/PermissionContext';
import { useTheme } from '../core/context/ThemeContext';

export type NavigationTab =
  | 'dashboard'
  | 'employees'
  | 'departments'
  | 'projects'
  | 'tasks'
  | 'daily-logs'
  | 'attendance'
  | 'leaves'
  | 'calendar'
  | 'chats'
  | 'meetings'
  | 'documents'
  | 'support'
  | 'announcements'
  | 'roles'
  | 'workflows'
  | 'audit-logs'
  | 'org-settings';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  /** Optional count pill (badge) rendered on the right of the row. */
  badge?: number;
}

interface NavSection {
  /** Section heading; the first section is unlabeled. */
  label?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'employees', label: 'Employees', icon: Users },
      { id: 'departments', label: 'Departments', icon: Building2 },
      { id: 'projects', label: 'Projects', icon: FolderKanban },
      { id: 'tasks', label: 'Tasks', icon: CircleCheck },
      { id: 'daily-logs', label: 'Daily Logs', icon: NotebookPen },
    ],
  },
  {
    label: 'People & Time',
    items: [
      { id: 'attendance', label: 'Attendance', icon: Clock },
      { id: 'leaves', label: 'Leaves & Permissions', icon: CalendarCheck },
      { id: 'calendar', label: 'Company Calendar', icon: CalendarDays },
    ],
  },
  {
    label: 'Collaboration',
    items: [
      { id: 'chats', label: 'Chats', icon: MessagesSquare },
      { id: 'meetings', label: 'Meetings', icon: Video },
      { id: 'documents', label: 'Documents', icon: FileText },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'support', label: 'IT Support Tickets', icon: Ticket, badge: 3 },
      { id: 'announcements', label: 'Announcements', icon: Megaphone },
    ],
  },
  {
    label: 'Administration',
    items: [
      { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
      { id: 'workflows', label: 'Approval Workflows', icon: ListChecks, badge: 7 },
      { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText },
      { id: 'org-settings', label: 'Org Settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isNotificationOpen?: boolean;
  onToggleNotification?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isMobileOpen = false,
  onCloseMobile,
  isNotificationOpen: externalNotificationOpen,
  onToggleNotification,
}) => {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const { theme, toggleTheme } = useTheme();
  const userMenuRef = useRef<HTMLDivElement>(null);

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
        // ignore
      }
      return next;
    });
  };

  const isEffectiveExpanded = isExpanded || isMobileOpen;

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [internalNotificationOpen, setInternalNotificationOpen] = useState(false);

  const isNotificationOpen =
    externalNotificationOpen !== undefined ? externalNotificationOpen : internalNotificationOpen;

  const setIsNotificationOpen = (open: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof open === 'function' ? open(isNotificationOpen) : open;
    if (onToggleNotification) {
      onToggleNotification(nextVal);
    } else {
      setInternalNotificationOpen(nextVal);
    }
  };

  // Close the user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen]);

  // Filter navigation items based on permissions from the backend
  const visibleSections = NAV_SECTIONS.map((section) => ({
    label: section.label,
    items: section.items.filter((item) => can(item.id, 'view')),
  })).filter((section) => section.items.length > 0);

  // Shared user dropdown menu (used in both expanded and collapsed modes)
  const UserDropdown = () => (
    <div
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 0.5rem)',
        left: isEffectiveExpanded ? '0' : 'calc(100% + 0.5rem)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        padding: '0.4rem 0',
        minWidth: '180px',
        zIndex: 1000,
      }}
    >
      {/* User identity summary */}
      <div
        style={{
          padding: '0.5rem 0.75rem 0.4rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '0.25rem',
        }}
      >
        <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user?.email}
        </div>
        <div style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {user?.role}
        </div>
      </div>

      {/* Logout action */}
      <button
        onClick={() => {
          setIsUserDropdownOpen(false);
          logout();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
          padding: '0.45rem 0.75rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 400,
          fontSize: '0.875rem',
          color: 'var(--color-danger, #e05252)',
          textAlign: 'left',
          borderRadius: 0,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-surface-elevated)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
        }}
      >
        <LogOut size={15} />
        Logout
      </button>
    </div>
  );

  return (
    <>
      <aside
        className={`sidebar-container ${isEffectiveExpanded ? 'expanded' : 'collapsed'} ${isMobileOpen ? 'mobile-open' : ''}`}
        aria-label="Main Navigation"
      >
        {/* Top: Brand Header & Collapse/Expand Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {isEffectiveExpanded ? (
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
                onClick={() => { onTabChange('dashboard'); onCloseMobile?.(); }}
                title="CrystalSpace Dashboard"
              >
                <CrystalLogo variant="full" height={26} theme={theme} />
              </div>
              {isMobileOpen ? (
                <button
                  id="btn-close-mobile-drawer"
                  onClick={onCloseMobile}
                  className="sidebar-icon-btn"
                  style={{ width: '32px', height: '32px' }}
                  title="Close menu"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              ) : (
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
              )}
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
              {/* Logo Tile (Compact) */}
              <button
                id="sidebar-brand-btn"
                onClick={() => onTabChange('dashboard')}
                className="sidebar-icon-btn"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
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

              {/* Expand Toggle */}
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

          {/* Primary Navigation */}
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isEffectiveExpanded ? 'stretch' : 'center',
              gap: isEffectiveExpanded ? '0.25rem' : '0.625rem',
              width: '100%',
            }}
          >
            {visibleSections.map((section, sectionIndex) => (
              <div
                key={section.label ?? `section-${sectionIndex}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isEffectiveExpanded ? 'stretch' : 'center',
                  gap: isEffectiveExpanded ? '0.15rem' : '0.4rem',
                  width: '100%',
                }}
              >
                {isEffectiveExpanded &&
                  (section.label ? (
                    <div
                      style={{
                        fontSize: '0.6875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-tertiary)',
                        padding: '0.85rem 0.75rem 0.3rem',
                      }}
                    >
                      {section.label}
                    </div>
                  ) : (
                    sectionIndex === 0 && (
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
                    )
                  ))}

                {!isEffectiveExpanded && sectionIndex > 0 && (
                  <div
                    style={{
                      width: '22px',
                      height: '1px',
                      backgroundColor: 'var(--border-subtle)',
                      margin: '0.2rem 0',
                    }}
                  />
                )}

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  if (isEffectiveExpanded) {
                    return (
                      <button
                        key={item.id}
                        id={`nav-row-${item.id}`}
                        onClick={() => { onTabChange(item.id); onCloseMobile?.(); }}
                        className={`sidebar-row-btn ${isActive ? 'active' : ''}`}
                        aria-label={item.label}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon size={16} />
                        <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
                        {!!item.badge && (
                          <span
                            style={{
                              minWidth: '18px',
                              height: '18px',
                              padding: '0 0.3rem',
                              borderRadius: 'var(--radius-full)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.6875rem',
                              fontWeight: 500,
                              lineHeight: 1,
                              backgroundColor:
                                item.id === 'support'
                                  ? 'var(--color-danger-bg)'
                                  : 'var(--bg-surface-elevated)',
                              color:
                                item.id === 'support'
                                  ? 'var(--color-danger)'
                                  : 'var(--text-secondary)',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      id={`nav-rail-${item.id}`}
                      onClick={() => { onTabChange(item.id); onCloseMobile?.(); }}
                      className={`sidebar-icon-btn ${isActive ? 'active' : ''}`}
                      aria-label={item.label}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon size={16} />
                      {!!item.badge && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor:
                              item.id === 'support'
                                ? 'var(--color-danger)'
                                : 'var(--color-accent-magenta)',
                          }}
                        />
                      )}
                      <span className="sidebar-tooltip">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Utility Stack */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isEffectiveExpanded ? 'stretch' : 'center',
            gap: isEffectiveExpanded ? '0.4rem' : '0.5rem',
            width: '100%',
          }}
        >
          {/* Separator */}
          <div
            style={{
              width: isEffectiveExpanded ? '100%' : '26px',
              height: '1px',
              backgroundColor: 'var(--border-subtle)',
              margin: '0.25rem 0',
              alignSelf: 'center',
            }}
          />

          {/* Notification & Theme */}
          {isEffectiveExpanded ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
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

          {/* Profile Section with working 3-dot menu + logout */}
          {isEffectiveExpanded ? (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              {/* Profile card */}
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
                      borderRadius: '8px',
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
                  {user?.email?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <div style={{ overflow: 'hidden', flexGrow: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.email}
                    </div>
                    <div style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {user?.role}
                    </div>
                  </div>
                </div>

                {/* Three-dot button */}
                <button
                  className="sidebar-icon-btn"
                  onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                  aria-label="User menu"
                  aria-expanded={isUserDropdownOpen}
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Dropdown menu */}
              {isUserDropdownOpen && <UserDropdown />}
            </div>
          ) : (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              {/* Collapsed avatar button */}
              <button
                className="sidebar-icon-btn"
                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                aria-label="User menu"
                aria-expanded={isUserDropdownOpen}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: 'var(--color-primary-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.email?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <span className="sidebar-tooltip">Profile & Logout</span>
              </button>

              {/* Dropdown menu */}
              {isUserDropdownOpen && <UserDropdown />}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
