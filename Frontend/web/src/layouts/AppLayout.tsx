import React from 'react';
import { Sidebar, type NavigationTab } from './Sidebar';

interface AppLayoutProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentTab, onTabChange, children }) => {
  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} onTabChange={onTabChange} />
      <div className="main-content">
        <main className="page-wrapper animate-fade-in">{children}</main>
      </div>
    </div>
  );
};
