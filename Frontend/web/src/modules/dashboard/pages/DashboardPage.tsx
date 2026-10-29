import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '../../employees/api/employeeApi';
import { queryKeys } from '../../../core/api/queryClient';
import type { NavigationTab } from '../../../layouts/Sidebar';
import { useAuth } from '../../auth/context/AuthContext';
import { WorkTimer } from '../../attendance/components/WorkTimer';
import { MonthlyHeatmap } from '../../attendance/components/MonthlyHeatmap';
import { MeetingsTimeline } from '../components/MeetingsTimeline';
import { OngoingProjectsCard } from '../components/OngoingProjectsCard';
import { EmployeeHeaderCard } from '../components/EmployeeHeaderCard';
import { RecentChatsCard } from '../components/RecentChatsCard';
import { RecentActivityNoticesCard } from '../components/RecentActivityNoticesCard';
import { ErrorBoundary } from '../../../core/ui/ErrorBoundary';

interface DashboardPageProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenAddEmployee?: () => void;
  onOpenApplyLeave?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
}) => {
  const { user } = useAuth();

  // Fetch employee record to display personalized profile data
  const { data: employees } = useQuery({
    queryKey: queryKeys.employees.list(),
    queryFn: () => employeeApi.list(),
  });

  const userRole = user?.role || 'Employee';

  // Match the logged in user with their employee profile record
  const currentEmployee = React.useMemo(() => {
    if (!employees || !user?.email) return undefined;
    return employees.find((e) => e.email?.toLowerCase() === user.email.toLowerCase());
  }, [employees, user?.email]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* 
        ROW 1: Items 4 & 3
        - Item 4: My small info (avatar, name, designation, and role)
        - Item 3: My device info + Raise Issue Ticket button (with interactive modal)
      */}
      <ErrorBoundary fallbackTitle="Employee header unavailable">
        <EmployeeHeaderCard
          userEmail={user?.email}
          userRole={userRole}
          employee={currentEmployee}
        />
      </ErrorBoundary>

      {/* 
        MAIN COCKPIT GRID (Responsive 2-Column Layout)
        - Left: Projects (5) -> Meetings (6) -> Activity & Notices (8)
        - Right: Clock/Punch (1) -> 1-Month Heatmap (2) -> Recent Chats (7)
      */}
      <div className="employee-dashboard-grid">
        {/* LEFT COLUMN (60%): Work, Schedule & Company Pulse */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          {/* Item 5: Ongoing Projects */}
          <ErrorBoundary fallbackTitle="Ongoing Projects unavailable">
            <OngoingProjectsCard />
          </ErrorBoundary>

          {/* Item 6: Meeting Schedule (Weekly timeline & join links) */}
          <ErrorBoundary fallbackTitle="Meeting Schedule unavailable">
            <MeetingsTimeline />
          </ErrorBoundary>

          {/* Item 8: Recent Activity and Notices (Company notices + personal activity) */}
          <ErrorBoundary fallbackTitle="Recent Activity and Notices unavailable">
            <RecentActivityNoticesCard />
          </ErrorBoundary>
        </div>

        {/* RIGHT COLUMN (40%): Daily Cockpit, Attendance & Communications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          {/* Item 1: Clock to punch in and punch out (with live circular timer & Office/Remote mode) */}
          <ErrorBoundary fallbackTitle="Work Timer unavailable">
            <WorkTimer onOpenTracker={() => onNavigate('attendance')} />
          </ErrorBoundary>

          {/* Item 2: Heat map of attendance (1 month compact GitHub matrix) */}
          <ErrorBoundary fallbackTitle="Attendance Heatmap unavailable">
            <MonthlyHeatmap compact={true} initialMonths={1} showAdminControls={false} />
          </ErrorBoundary>

          {/* Item 7: Recent Chats (Show 5 chats + 'View more in Chats' button & drawer) */}
          <ErrorBoundary fallbackTitle="Recent Chats unavailable">
            <RecentChatsCard onOpenChatsPage={() => onNavigate('dashboard')} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};
