import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendanceApi';
import { queryKeys } from '../../../core/api/queryClient';
import { useAuth } from '../../auth/context/AuthContext';
import { WorkTimer } from '../components/WorkTimer';
import { MonthlyHeatmap } from '../components/MonthlyHeatmap';
import { AttendanceTrendChart } from '../components/AttendanceTrendChart';
import { AttendanceHistoryTable } from '../components/AttendanceHistoryTable';
import { ErrorBoundary } from '../../../core/ui/ErrorBoundary';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin' || user?.role === 'HR';

  const [inspectedEmployeeId, setInspectedEmployeeId] = useState<number | undefined>(undefined);

  // For Admin: Organization overview numbers
  const { data: orgOverview } = useQuery({
    queryKey: queryKeys.attendance.overview,
    queryFn: attendanceApi.getOrgOverview,
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  // Summary for selected/caller employee
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: queryKeys.attendance.summary(inspectedEmployeeId, 30),
    queryFn: () => attendanceApi.getSummary(inspectedEmployeeId, 30),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header & Top-Right Timer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 600 }}>Attendance & Time Tracking</h1>
            <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
              Real-time Live
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {isAdmin
              ? 'Monitor company-wide punch-in metrics, individual employee heatmaps, and attendance logs.'
              : 'Track your daily shift hours, clock-in status, and monthly presence history.'}
          </p>
        </div>

        {/* Top-Right Timer Anchor */}
        <ErrorBoundary fallbackTitle="Timer unavailable">
          <WorkTimer />
        </ErrorBoundary>
      </div>

      {/* Admin Organization Overview Stats Bar */}
      {isAdmin && orgOverview && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {orgOverview.present_count}{' '}
                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>
                  / {orgOverview.total_employees}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Present Today</div>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{orgOverview.late_count}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Late Arrivals</div>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(139, 92, 246, 0.12)',
                color: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{orgOverview.on_leave_count}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>On Approved Leave</div>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--color-danger, #EF4444)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{orgOverview.absent_count}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Not Checked In</div>
            </div>
          </div>
        </div>
      )}

      {/* GitHub-style Heatmap Section */}
      <ErrorBoundary fallbackTitle="Activity & Attendance Heatmap unavailable">
        <MonthlyHeatmap
          selectedEmployeeId={inspectedEmployeeId}
          onSelectEmployee={setInspectedEmployeeId}
          showAdminControls={isAdmin}
        />
      </ErrorBoundary>

      {/* 14-Day Hours Trend Chart */}
      <ErrorBoundary fallbackTitle="Attendance Trend Chart unavailable">
        <AttendanceTrendChart
          dailyTrends={summary?.daily_trends || []}
          isLoading={isSummaryLoading}
        />
      </ErrorBoundary>

      {/* Comprehensive Attendance History Log Table */}
      <ErrorBoundary fallbackTitle="Attendance History Table unavailable">
        <AttendanceHistoryTable selectedEmployeeId={inspectedEmployeeId} />
      </ErrorBoundary>
    </div>
  );
};
