import React, { useState } from 'react';
import {
  Bell,
  Activity,
  Calendar,
  ShieldAlert,
  Megaphone,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface NoticeItem {
  id: string;
  type: 'announcement' | 'security' | 'event';
  title: string;
  description: string;
  date: string;
  priority: 'normal' | 'important';
}

interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  type: 'punch' | 'meeting' | 'leave' | 'deploy';
}

const NOTICES: NoticeItem[] = [
  {
    id: 'n-1',
    type: 'announcement',
    title: 'Q4 Product Roadmap & Engineering Townhall',
    description: 'Join the product leadership this Thursday at 3:00 PM EST for the annual Q4 product vision.',
    date: 'Oct 30, 2024',
    priority: 'important',
  },
  {
    id: 'n-2',
    type: 'security',
    title: 'Workstation Security & 2FA Renewal',
    description: 'Ensure hardware disk encryption and MFA tokens are verified before next Friday.',
    date: 'Nov 04, 2024',
    priority: 'important',
  },
  {
    id: 'n-3',
    type: 'event',
    title: 'Welcome 2 New Recruits to Engineering',
    description: 'Please give a warm welcome to Priya Sharma (Frontend) and Elena Rostova (Product Design)!',
    date: 'Oct 28, 2024',
    priority: 'normal',
  },
];

const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Work session clocked in (Office Mode)',
    timestamp: 'Today at 09:15 AM',
    type: 'punch',
  },
  {
    id: 'act-2',
    title: 'Attended Weekly Team Sync with Engineering Squad',
    timestamp: 'Today at 10:00 AM',
    type: 'meeting',
  },
  {
    id: 'act-3',
    title: 'Annual PTO request (Nov 04–05) Approved by Lead',
    timestamp: 'Yesterday at 04:30 PM',
    type: 'leave',
  },
  {
    id: 'act-4',
    title: 'Pushed code to staging-v1.4.2 branch',
    timestamp: '2 days ago',
    type: 'deploy',
  },
];

export const RecentActivityNoticesCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notices' | 'activity'>('notices');

  return (
    <div
      className="card"
      id="dashboard-activity-notices"
      style={{
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Header with Segmented Pill Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            {activeTab === 'notices' ? <Megaphone size={15} /> : <Activity size={15} />}
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>
              {activeTab === 'notices' ? 'Company Notices' : 'Work Activity Stream'}
            </h3>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              {activeTab === 'notices'
                ? 'Official updates from leadership & operations'
                : 'Chronological timeline of shifts & milestones'}
            </div>
          </div>
        </div>

        {/* Segmented Control */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--bg-surface-elevated)',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('notices')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'notices' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'notices' ? 'var(--bg-surface)' : 'var(--text-secondary)',
              fontSize: '0.72rem',
              fontWeight: 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Bell size={12} /> Notices (3)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'activity' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'activity' ? 'var(--bg-surface)' : 'var(--text-secondary)',
              fontSize: '0.72rem',
              fontWeight: 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Activity size={12} /> Activity
          </button>
        </div>
      </div>

      {/* Tab 1: Notices Content */}
      {activeTab === 'notices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {NOTICES.map((notice) => (
            <div
              key={notice.id}
              style={{
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {notice.type === 'security' ? (
                    <ShieldAlert size={14} style={{ color: '#EF4444' }} />
                  ) : notice.type === 'event' ? (
                    <Sparkles size={14} style={{ color: '#F59E0B' }} />
                  ) : (
                    <Megaphone size={14} style={{ color: '#3B82F6' }} />
                  )}
                  <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-primary)' }}>
                    {notice.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {notice.priority === 'important' && (
                    <span
                      style={{
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.62rem',
                        fontWeight: 400,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      Priority
                    </span>
                  )}
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                    {notice.date}
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: 1.45,
                }}
              >
                {notice.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Activity Stream Content */}
      {activeTab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {RECENT_ACTIVITIES.map((act) => (
            <div
              key={act.id}
              style={{
                borderRadius: '8px',
                padding: '0.75rem 0.95rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor:
                      act.type === 'punch'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : act.type === 'meeting'
                        ? 'rgba(74, 222, 128, 0.1)'
                        : act.type === 'leave'
                        ? 'rgba(245, 158, 11, 0.1)'
                        : 'rgba(6, 182, 212, 0.1)',
                    color:
                      act.type === 'punch'
                        ? '#10B981'
                        : act.type === 'meeting'
                        ? '#4ade80'
                        : act.type === 'leave'
                        ? '#F59E0B'
                        : '#06B6D4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {act.type === 'punch' ? (
                    <Clock size={12} />
                  ) : act.type === 'meeting' ? (
                    <Calendar size={12} />
                  ) : act.type === 'leave' ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <Sparkles size={12} />
                  )}
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-primary)' }}>
                  {act.title}
                </span>
              </div>

              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                {act.timestamp}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
