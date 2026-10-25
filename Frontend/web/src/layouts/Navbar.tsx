import React from 'react';
import { useTheme } from '../core/context/ThemeContext';
import { Moon, Sun, Database } from 'lucide-react';
import type { NavigationTab } from './Sidebar';

interface NavbarProps {
  currentTab: NavigationTab;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab }) => {
  const { theme, toggleTheme } = useTheme();

  const titles: Record<NavigationTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Executive Dashboard',
      subtitle: 'Real-time overview of workforce metrics, approvals, and departments',
    },
    employees: {
      title: 'Employee Directory',
      subtitle: 'Manage organizational personnel, roles, and employment profiles',
    },
    departments: {
      title: 'Departments & Hierarchy',
      subtitle: 'Organizational units, headcounts, and departmental managers',
    },
    leaves: {
      title: 'Leave & Attendance Management',
      subtitle: 'Submit leave requests, view leave quotas, and process approval queues',
    },
  };

  const meta = titles[currentTab] || { title: 'Workspace', subtitle: 'CrystalSpace Operations' };

  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div>
        <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{meta.title}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{meta.subtitle}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Backend Connectivity Status Pill */}
        <div
          className="badge badge-success"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.75rem',
            fontSize: '0.75rem',
          }}
          title="Connected to Golang N-Tier Backend"
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success)',
              boxShadow: '0 0 8px var(--color-success)',
            }}
          />
          <span>Go API v1 Active</span>
        </div>

        {/* Database Engine Pill */}
        <div
          className="badge badge-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.75rem',
            fontSize: '0.75rem',
          }}
        >
          <Database size={13} />
          <span>PostgreSQL</span>
        </div>

        {/* Dark/Light Mode Switcher */}
        <button
          id="btn-navbar-theme-toggle"
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle application theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
};
