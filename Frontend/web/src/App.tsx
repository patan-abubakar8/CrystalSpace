import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './core/api/queryClient';
import { ThemeProvider } from './core/context/ThemeContext';
import { NotificationProvider } from './core/context/NotificationContext';
import { AuthProvider, useAuth } from './modules/auth/context/AuthContext';
import { LoginPage } from './modules/auth/pages/LoginPage';
import { ForgotPasswordPage } from './modules/auth/pages/ForgotPasswordPage';
import { AppLayout } from './layouts/AppLayout';
import type { NavigationTab } from './layouts/Sidebar';
import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { EmployeesPage } from './modules/employees/pages/EmployeesPage';
import { DepartmentsPage } from './modules/departments/pages/DepartmentsPage';
import { LeavesPage } from './modules/leaves/pages/LeavesPage';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [authView, setAuthView] = useState<'login' | 'forgot'>(() => {
    return window.location.hash === '#forgot' ? 'forgot' : 'login';
  });

  React.useEffect(() => {
    const handleHash = () => {
      setAuthView(window.location.hash === '#forgot' ? 'forgot' : 'login');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Modal triggers across pages
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          backgroundColor: 'var(--bg-app)',
          color: 'var(--text-secondary)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid var(--border-default)',
            borderTopColor: 'var(--color-accent-magenta)',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <div style={{ fontWeight: 400, fontSize: '0.9375rem' }}>Initializing CrystalSpace...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'forgot') {
      return (
        <ForgotPasswordPage
          onBackToLogin={() => {
            window.location.hash = '#login';
            setAuthView('login');
          }}
        />
      );
    }

    return (
      <LoginPage
        onNavigateToForgot={() => {
          window.location.hash = '#forgot';
          setAuthView('forgot');
        }}
      />
    );
  }

  return (
    <AppLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {currentTab === 'dashboard' && (
        <DashboardPage
          onNavigate={setCurrentTab}
          onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
          onOpenApplyLeave={() => setIsApplyLeaveOpen(true)}
        />
      )}

      {currentTab === 'employees' && (
        <EmployeesPage
          isAddModalOpen={isAddEmployeeOpen}
          onCloseAddModal={() => setIsAddEmployeeOpen(false)}
        />
      )}

      {currentTab === 'departments' && <DepartmentsPage />}

      {currentTab === 'leaves' && (
        <LeavesPage
          isApplyModalOpen={isApplyLeaveOpen}
          onCloseApplyModal={() => setIsApplyLeaveOpen(false)}
        />
      )}
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <MainAppContent />
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
