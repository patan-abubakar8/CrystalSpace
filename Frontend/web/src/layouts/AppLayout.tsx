import React, { useState } from 'react';
import { Sidebar, type NavigationTab } from './Sidebar';
import { CrystalLogo } from '../core/ui/CrystalLogo';
import { Menu } from 'lucide-react';
import { useTheme } from '../core/context/ThemeContext';

interface AppLayoutProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentTab, onTabChange, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="app-container">
      {/* Mobile Top Header (only visible on screen widths <= 768px) */}
      <header className="mobile-header">
        <div
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => onTabChange('dashboard')}
          title="CrystalSpace"
        >
          <CrystalLogo variant="full" height={26} theme={theme} />
        </div>

        <button
          id="btn-mobile-hamburger"
          onClick={() => setMobileMenuOpen(true)}
          className="sidebar-icon-btn"
          style={{ width: '36px', height: '36px' }}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Sidebar with mobile drawer support */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          onTabChange(tab);
          setMobileMenuOpen(false);
        }}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="main-content">
        <main className="page-wrapper animate-fade-in">{children}</main>
      </div>
    </div>
  );
};
