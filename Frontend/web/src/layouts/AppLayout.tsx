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
      <header className="mobile-top-header">
        <div
          className="mobile-header-brand"
          onClick={() => onTabChange('dashboard')}
          title="CrystalSpace"
        >
          <CrystalLogo variant="full" height={26} theme={theme} />
        </div>

        <button
          id="btn-mobile-hamburger"
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="mobile-hamburger-btn"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
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
        />

        <div className="main-content">
          <main className="page-wrapper animate-fade-in">{children}</main>
        </div>
      </div>
    </div>
  );
};
