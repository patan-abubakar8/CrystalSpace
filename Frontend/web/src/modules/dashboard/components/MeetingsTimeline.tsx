import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Clock,
  Calendar,
  X,
  ExternalLink,
  MapPin,
} from 'lucide-react';

export interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
}

export interface MeetingItem {
  id: string;
  title: string;
  subtitle: string;
  timeRange: string;
  dayDate: number;   // 24 = Wed 24
  participants: Participant[];
  extraCount: number;
  meetingLink: string;
  location: string;
  description: string;
}

export const MeetingsTimeline: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(24);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(1);
  const [activeMeeting, setActiveMeeting] = useState<MeetingItem | null>(null);

  const months = [
    { name: 'August 2024', prevLabel: 'July', nextLabel: 'September' },
    { name: 'September 2024', prevLabel: 'August', nextLabel: 'October' },
    { name: 'October 2024', prevLabel: 'September', nextLabel: 'November' },
  ];

  const currentMonth = months[currentMonthIndex];

  const days = [
    { dayName: 'Mon', date: 22, hasMeetings: false },
    { dayName: 'Tue', date: 23, hasMeetings: true },
    { dayName: 'Wed', date: 24, hasMeetings: true, isToday: true },
    { dayName: 'Thu', date: 25, hasMeetings: true },
    { dayName: 'Fri', date: 26, hasMeetings: false },
    { dayName: 'Sat', date: 27, hasMeetings: false },
  ];

  const teamParticipants: Participant[] = [
    {
      id: 'p1',
      name: 'Alex Rivera',
      initials: 'AR',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    },
    {
      id: 'p2',
      name: 'Sarah Chen',
      initials: 'SC',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
    },
    {
      id: 'p3',
      name: 'David Kim',
      initials: 'DK',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    },
  ];

  const onboardingParticipants: Participant[] = [
    {
      id: 'p4',
      name: 'Priya Sharma',
      initials: 'PS',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    },
    {
      id: 'p5',
      name: 'Elena Rostova',
      initials: 'ER',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    },
  ];

  const ALL_MEETINGS: MeetingItem[] = [
    {
      id: 'm1',
      title: 'Weekly Engineering Sync',
      subtitle: 'Sprint backlog & architecture review',
      timeRange: '10:00 AM – 10:45 AM',
      dayDate: 24,
      participants: teamParticipants,
      extraCount: 2,
      meetingLink: 'https://meet.google.com/cys-sync-weekly',
      location: 'Google Meet • Conf Room Aurora',
      description: 'Weekly team engineering sprint review, blockers triage, and API contracts alignment.',
    },
    {
      id: 'm2',
      title: 'Product Design Hand-off',
      subtitle: 'Dashboard tokens & mobile client components',
      timeRange: '02:30 PM – 03:15 PM',
      dayDate: 24,
      participants: onboardingParticipants,
      extraCount: 1,
      meetingLink: 'https://meet.google.com/design-handoff-cs',
      location: 'Zoom • Design Hub',
      description: 'Reviewing finalized design tokens, mobile navigation patterns, and component accessibility.',
    },
    {
      id: 'm3',
      title: 'Architecture & Scalability Discussion',
      subtitle: 'PostgreSQL connection pooling & Redis cache',
      timeRange: '11:00 AM – 12:00 PM',
      dayDate: 23,
      participants: teamParticipants,
      extraCount: 3,
      meetingLink: 'https://meet.google.com/arch-deepdive',
      location: 'Google Meet',
      description: 'Deep dive into database scaling strategies, read replicas, and query optimization.',
    },
    {
      id: 'm4',
      title: 'New Recruits Onboarding & Setup',
      subtitle: 'Environment configuration walkthrough',
      timeRange: '11:30 AM – 12:30 PM',
      dayDate: 25,
      participants: onboardingParticipants,
      extraCount: 4,
      meetingLink: 'https://meet.google.com/onboard-new-hires',
      location: 'Executive Room B / Zoom',
      description: 'Welcoming new recruits, setting up dev containers, SSH keys, and security guidelines.',
    },
  ];

  const filteredMeetings = ALL_MEETINGS.filter((m) => m.dayDate === selectedDay);

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : months.length - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className="card"
      id="dashboard-meetings-timeline"
      style={{
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        backgroundColor: 'var(--bg-surface-primary)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.15rem',
      }}
    >
      {/* Header: Title and Month Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-info-bg)',
              color: 'var(--color-info)',
              border: '1px solid var(--color-info-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={15} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>
              Meeting Schedule & Agenda
            </h3>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              Scheduled team syncs & 1-click video call links
            </div>
          </div>
        </div>

        {/* Month Navigator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            backgroundColor: 'var(--bg-surface-elevated)',
            padding: '2px 4px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={handlePrevMonth}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.2rem 0.4rem', borderRadius: '4px' }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: '0.75rem', fontWeight: 400, padding: '0 0.35rem', color: 'var(--text-primary)' }}>
            {currentMonth.name}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.2rem 0.4rem', borderRadius: '4px' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Days Strip Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 'var(--space-2)',
        }}
      >
        {days.map((item) => {
          const isSelected = selectedDay === item.date;

          return (
            <button
              key={item.date}
              type="button"
              onClick={() => setSelectedDay(item.date)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.55rem 0.25rem',
                borderRadius: '8px',
                border: isSelected ? '1px solid var(--color-success)' : '1px solid var(--border-subtle)',
                backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-surface-elevated)',
                color: isSelected ? 'var(--bg-surface)' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 400,
                  opacity: isSelected ? 0.9 : 0.65,
                  textTransform: 'uppercase',
                }}
              >
                {item.dayName}
              </span>

              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 400,
                  marginTop: '0.15rem',
                  lineHeight: 1.1,
                }}
              >
                {item.date}
              </span>

              {/* Indicator Dot if meetings exist */}
              {item.hasMeetings && (
                <span
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? 'var(--color-success)' : 'var(--color-info)',
                    marginTop: '0.3rem',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Agenda Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {filteredMeetings.length > 0 ? (
          filteredMeetings.map((mtg) => (
            <div
              key={mtg.id}
              onClick={() => setActiveMeeting(mtg)}
              style={{
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-4)',
                cursor: 'pointer',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                {/* Time Badge */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={12} style={{ color: 'var(--color-info)', marginBottom: '0.15rem' }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
                    {mtg.timeRange.split('–')[0].trim()}
                  </span>
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 400,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {mtg.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginTop: '0.15rem',
                    }}
                  >
                    <MapPin size={11} /> {mtg.location}
                  </div>
                </div>
              </div>

              {/* Right Side: Attendees + Join Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
                {/* Avatars */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {mtg.participants.map((p, idx) => (
                    <img
                      key={p.id}
                      src={p.avatarUrl}
                      alt={p.name}
                      title={p.name}
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: '2px solid var(--bg-surface)',
                        marginLeft: idx === 0 ? 0 : '-5px',
                        objectFit: 'cover',
                      }}
                    />
                  ))}
                  {mtg.extraCount > 0 && (
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-surface)',
                        border: '2px solid var(--border-subtle)',
                        marginLeft: '-5px',
                        fontSize: '0.6rem',
                        fontWeight: 400,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      +{mtg.extraCount}
                    </span>
                  )}
                </div>

                <a
                  href={mtg.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="btn btn-secondary btn-sm"
                  style={{
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.72rem',
                    borderRadius: '6px',
                    gap: '0.35rem',
                    fontWeight: 400,
                  }}
                >
                  <Video size={12} style={{ color: 'var(--color-info)' }} /> Join
                </a>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: '1.5rem',
              textAlign: 'center',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px dashed var(--border-subtle)',
              color: 'var(--text-tertiary)',
              fontSize: '0.78rem',
            }}
          >
            No meetings scheduled for this day • Uninterrupted focus time ☕
          </div>
        )}
      </div>

      {/* Meeting Details Modal */}
      {activeMeeting && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--bg-overlay)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setActiveMeeting(null)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface-primary)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-surface-elevated)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-info-bg)',
                    color: 'var(--color-info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Video size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>
                    {activeMeeting.title}
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    {activeMeeting.timeRange}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveMeeting(null)}
                className="btn btn-ghost btn-sm"
                style={{ borderRadius: '6px', padding: '0.35rem' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Agenda & Description
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.45 }}>
                  {activeMeeting.description}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                  Participants ({activeMeeting.participants.length + activeMeeting.extraCount})
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {activeMeeting.participants.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                      }}
                    >
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveMeeting(null)}
                  className="btn btn-secondary"
                  style={{ borderRadius: '6px', fontSize: '0.8125rem' }}
                >
                  Close
                </button>
                <a
                  href={activeMeeting.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ borderRadius: '6px', fontSize: '0.8125rem', gap: '0.4rem' }}
                >
                  <Video size={14} /> Join Call <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
