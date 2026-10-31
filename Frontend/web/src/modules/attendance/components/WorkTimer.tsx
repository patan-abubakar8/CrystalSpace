import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendanceApi';
import { queryKeys } from '../../../core/api/queryClient';
import { useNotification } from '../../../core/context/NotificationContext';
import { Play, Pause, Square, History, Laptop, Building2, Flame } from 'lucide-react';
import type { WorkMode } from '../../../types';

interface WorkTimerProps {
  compact?: boolean;
  onOpenTracker?: () => void;
}

export const WorkTimer: React.FC<WorkTimerProps> = ({ compact = false, onOpenTracker }) => {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();
  const [selectedMode, setSelectedMode] = useState<WorkMode>('Office');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const { data: todayData } = useQuery({
    queryKey: queryKeys.attendance.today,
    queryFn: attendanceApi.getToday,
    refetchInterval: 15000,
  });

  const { data: summary } = useQuery({
    queryKey: queryKeys.attendance.summary(undefined, 7),
    queryFn: () => attendanceApi.getSummary(undefined, 7),
  });

  const weeklyHours = summary?.total_hours ?? 4.2;
  const isClockedIn = todayData?.is_clocked_in ?? false;
  const initialSeconds = todayData?.active_seconds ?? 0;

  useEffect(() => {
    setElapsedSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isClockedIn) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn]);

  const punchMutation = useMutation({
    mutationFn: (action: 'in' | 'out') =>
      attendanceApi.punch({
        action,
        work_mode: selectedMode,
      }),
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.today });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      if (action === 'in') {
        success('Session Started', 'Clocked in successfully. Work timer running.');
      } else {
        success('Session Finished', 'Clocked out. Shift summary recorded.');
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message || 'Failed to update punch status';
      error('Punch Error', msg);
    },
  });

  const hrs = Math.floor(elapsedSeconds / 3600);
  const mins = Math.floor((elapsedSeconds % 3600) / 60);
  const secs = elapsedSeconds % 60;

  const formattedHours = String(hrs).padStart(2, '0');
  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(secs).padStart(2, '0');
  const formattedTimeFull = `${formattedHours}:${formattedMins}:${formattedSecs}`;

  const TARGET_WORKDAY_SECONDS = 8 * 3600;
  const dailyProgress = Math.min(Math.round((elapsedSeconds / TARGET_WORKDAY_SECONDS) * 100), 100);

  if (compact) {
    return (
      <div
        id="navbar-work-timer"
        onClick={onOpenTracker}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.35rem 0.85rem',
          borderRadius: '8px',
          backgroundColor: isClockedIn ? 'var(--color-success-bg)' : 'var(--bg-surface-elevated)',
          border: `1px solid ${isClockedIn ? 'var(--color-success-bg)' : 'var(--border-subtle)'}`,
          fontSize: '0.75rem',
          fontWeight: 400,
          color: isClockedIn ? 'var(--color-success)' : 'var(--text-secondary)',
          cursor: onOpenTracker ? 'pointer' : 'default',
          transition: 'all var(--transition-fast)',
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: isClockedIn ? 'var(--color-success)' : 'var(--text-tertiary)',
            boxShadow: isClockedIn ? 'var(--glow-success)' : 'none',
            display: 'inline-block',
          }}
        />
        <span style={{ fontFamily: 'monospace', fontWeight: 400 }}>{isClockedIn ? formattedTimeFull : 'Off Clock'}</span>
      </div>
    );
  }

  return (
    <div
      id="dashboard-work-timer"
      className="card"
      style={{
        borderRadius: '12px',
        padding: '1.25rem 1.4rem',
        backgroundColor: 'var(--bg-surface-primary)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.15rem',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Row 1: Header & Work Mode Segmented Control */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isClockedIn ? 'var(--color-success)' : 'var(--text-tertiary)',
              boxShadow: isClockedIn ? 'var(--glow-success)' : 'none',
              display: 'inline-block',
            }}
          />
          <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
            {isClockedIn ? 'Working Session' : 'Shift Off-Clock'}
          </h3>
        </div>

        {/* Office | Remote Switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface-elevated)',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedMode('Office')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.55rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: selectedMode === 'Office' ? 'var(--bg-surface)' : 'transparent',
              color: selectedMode === 'Office' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.72rem',
              fontWeight: 400,
              boxShadow: selectedMode === 'Office' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Building2 size={12} /> Office
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('Remote')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.55rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: selectedMode === 'Remote' ? 'var(--bg-surface)' : 'transparent',
              color: selectedMode === 'Remote' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.72rem',
              fontWeight: 400,
              boxShadow: selectedMode === 'Remote' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Laptop size={12} /> Remote
          </button>
        </div>
      </div>

      {/* Row 2: Large Precision Monospace Time Display */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem 0 0.5rem 0',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '2.4rem',
            fontWeight: 400,
            lineHeight: 1,
            color: 'var(--text-primary)',
            letterSpacing: '0.04em',
            fontVariantNumeric: 'tabular-nums',
            display: 'flex',
            alignItems: 'center',
            gap: '0.15rem',
          }}
        >
          <span>{formattedHours}</span>
          <span style={{ opacity: isClockedIn && secs % 2 === 0 ? 0.3 : 1, transition: 'opacity 0.2s ease', color: 'var(--text-tertiary)' }}>:</span>
          <span>{formattedMins}</span>
          <span style={{ opacity: isClockedIn && secs % 2 === 0 ? 0.3 : 1, transition: 'opacity 0.2s ease', color: 'var(--text-tertiary)' }}>:</span>
          <span style={{ fontSize: '1.8rem', color: isClockedIn ? 'var(--color-success)' : 'var(--text-secondary)' }}>{formattedSecs}</span>
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span>Daily 8h Target:</span>
          <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{dailyProgress}%</span>
        </div>

        {/* Hairline Progress Bar inside the display */}
        <div
          style={{
            width: '85%',
            height: '3px',
            borderRadius: '2px',
            backgroundColor: 'var(--bg-surface)',
            marginTop: '0.65rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${dailyProgress}%`,
              borderRadius: '2px',
              backgroundColor: isClockedIn ? 'var(--color-success)' : 'var(--text-tertiary)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Row 3: Main Action Controls */}
      <div>
        {!isClockedIn ? (
          <button
            id="btn-timer-start"
            type="button"
            onClick={() => punchMutation.mutate('in')}
            disabled={punchMutation.isPending}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
          >
            <Play size={14} fill="currentColor" />
            <span>Punch In / Start Shift</span>
          </button>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <button
              id="btn-timer-pause"
              type="button"
              onClick={() => punchMutation.mutate('out')}
              disabled={punchMutation.isPending}
              className="btn btn-secondary"
              style={{
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                border: '1px solid var(--border-default)',
              }}
            >
              <Pause size={14} />
              <span>Take Break</span>
            </button>

            <button
              id="btn-timer-stop"
              type="button"
              onClick={() => punchMutation.mutate('out')}
              disabled={punchMutation.isPending}
              style={{
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger-bg)',
                color: 'var(--color-danger)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Square size={13} fill="currentColor" />
              <span>Clock Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Row 4: Subtle Bottom Metadata */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--text-tertiary)',
          paddingTop: '0.35rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span>Weekly:</span>
          <span style={{ fontWeight: 400, color: 'var(--text-primary)' }}>{weeklyHours}h / 45h</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-warning)' }}>
          <Flame size={12} />
          <span style={{ fontWeight: 400 }}>5-Day Streak</span>
        </div>

        {onOpenTracker && (
          <button
            type="button"
            onClick={onOpenTracker}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              fontSize: '0.72rem',
              padding: 0,
            }}
          >
            <History size={12} /> History
          </button>
        )}
      </div>
    </div>
  );
};
