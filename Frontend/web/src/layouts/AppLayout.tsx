import React, { useState } from 'react';
import { Sidebar, type NavigationTab } from './Sidebar';
import { CrystalLogo } from '../core/ui/CrystalLogo';
import { Menu, Bell } from 'lucide-react';
import { useTheme } from '../core/context/ThemeContext';

interface AppLayoutProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentTab, onTabChange, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="app-container">
      {/* Mobile Top Header (only visible on screen widths <= 768px) */}
      <header className="mobile-top-header">
        <div
          className="mobile-header-brand"
          onClick={() => onTabChange('dashboard')}
          title="CrystalSpace"
        >
          <CrystalLogo variant="full" height={26} theme={theme} />
        </div>

        <div className="mobile-header-actions">
          {/* Notification Button beside hamburger */}
          <button
            id="btn-mobile-notifications"
            type="button"
            onClick={() => setIsNotificationOpen(true)}
            className="mobile-action-icon-btn"
            aria-label="View notifications"
            title="Notifications"
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Bell size={21} />
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent-magenta)',
                }}
              />
            </div>
          </button>

          {/* Hamburger Menu Button - dark, no container */}
          <button
            id="btn-mobile-hamburger"
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-action-icon-btn"
            aria-label="Open navigation menu"
            title="Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Main app body: desktop sidebar rail on left + main content, or mobile drawer */}
      <div className="app-main-layout">
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            onTabChange(tab);
            setMobileMenuOpen(false);
          }}
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          isNotificationOpen={isNotificationOpen}
          onToggleNotification={setIsNotificationOpen}
        />

        <div className="main-content">
          <main className="page-wrapper animate-fade-in">{children}</main>
        </div>
      </div>
    </div>
  );
};
