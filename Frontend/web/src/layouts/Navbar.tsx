import React from 'react';
import { useTheme } from '../core/context/ThemeContext';
import { Moon, Sun, Search, Bell } from 'lucide-react';
import type { NavigationTab } from './Sidebar';
import { WorkTimer } from '../modules/attendance/components/WorkTimer';

interface NavbarProps {
  currentTab: NavigationTab;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      style={{
        height: '60px',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Workspace Title & Brand Live Session Pill */}
        <WorkTimer compact />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Global Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: 'var(--text-tertiary)',
              pointerEvents: 'none',
            }}
          />
          <input
            id="navbar-global-search"
            type="text"
            placeholder="Search directory..."
            style={{
              padding: '0.45rem 2.2rem 0.45rem 2.2rem',
              fontSize: '0.8125rem',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-primary)',
              width: '210px',
              outline: 'none',
              transition: 'all var(--transition-fast)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.width = '260px';
              e.currentTarget.style.borderColor = 'var(--color-accent-magenta)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.width = '210px';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '0.65rem',
              fontSize: '0.65rem',
              padding: '0.1rem 0.35rem',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-tertiary)',
              lineHeight: 1,
              pointerEvents: 'none',
            }}
          >
            ⌘K
          </span>
        </div>

        {/* Notifications */}
        <button
          id="btn-navbar-notifications"
          className="btn btn-secondary btn-icon"
          title="Notifications"
          aria-label="Notifications"
          style={{ position: 'relative' }}
        >
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: '7px',
              right: '7px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent-magenta)',
            }}
          />
        </button>

        {/* Dark/Light Mode Switcher */}
        <button
          id="btn-navbar-theme-toggle"
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle application theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};
