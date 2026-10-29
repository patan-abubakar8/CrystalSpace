import React from 'react';
import {
  FolderGit2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export interface ProjectCardItem {
  id: string;
  title: string;
  category: string;
  date: string;
  progressPercent: number;
  daysLeft: number;
  statusTag: string;
  avatars: { name: string; url: string }[];
  extraAvatarsCount?: number;
}

const DEFAULT_PROJECTS: ProjectCardItem[] = [
  {
    id: 'proj-1',
    title: 'Web Platform Redesign',
    category: 'Prototyping & Tokens',
    date: 'Due in 2 days',
    progressPercent: 90,
    daysLeft: 2,
    statusTag: 'Review',
    avatars: [
      { name: 'Alex Rivera', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces' },
      { name: 'Sarah Chen', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=faces' },
      { name: 'David Kim', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces' },
    ],
    extraAvatarsCount: 3,
  },
  {
    id: 'proj-2',
    title: 'Mobile App Architecture',
    category: 'Flutter Multiplatform',
    date: 'Due in 5 days',
    progressPercent: 50,
    daysLeft: 5,
    statusTag: 'In Progress',
    avatars: [
      { name: 'Elena Rostova', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=faces' },
      { name: 'Priya Sharma', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=faces' },
      { name: 'Marcus Chen', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&h=60&fit=crop&crop=faces' },
    ],
    extraAvatarsCount: 2,
  },
  {
    id: 'proj-3',
    title: 'Analytics & Heatmap Matrix',
    category: 'Data Visualization',
    date: 'Due in 8 days',
    progressPercent: 70,
    daysLeft: 8,
    statusTag: 'Sprint Active',
    avatars: [
      { name: 'Sarah Jenkins', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=faces' },
      { name: 'Alexander Vance', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces' },
      { name: 'Rachel Adams', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces' },
    ],
    extraAvatarsCount: 4,
  },
];

export const OngoingProjectsCard: React.FC = () => {
  return (
    <div
      className="card"
      id="dashboard-ongoing-projects"
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FolderGit2 size={15} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>
              Ongoing Projects & Deliverables
            </h3>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              Active sprint milestones assigned to your engineering squad
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 400,
            padding: '0.2rem 0.55rem',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          3 Active Tracks
        </span>
      </div>

      {/* Modern Minimal Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {DEFAULT_PROJECTS.map((proj) => {
          return (
            <div
              key={proj.id}
              style={{
                borderRadius: '10px',
                padding: '1.1rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.9rem',
                position: 'relative',
                transition: 'all 0.18s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Top Row: Category & Status */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 400,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {proj.category}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 400,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      color: '#22c55e',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                    }}
                  >
                    {proj.statusTag}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.015em',
                    lineHeight: 1.3,
                  }}
                >
                  {proj.title}
                </div>
              </div>

              {/* Progress & Due Date */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    marginBottom: '0.35rem',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
                    {proj.progressPercent}% complete
                  </span>
                  <span
                    style={{
                      color: 'var(--text-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Clock size={11} /> {proj.date}
                  </span>
                </div>

                {/* Sleek Hairline Progress Bar */}
                <div
                  style={{
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${proj.progressPercent}%`,
                      borderRadius: '2px',
                      background: 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Bottom: Team Avatars & Action Link */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.35rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                {/* Overlapping Avatars */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {proj.avatars.map((av, idx) => (
                    <img
                      key={idx}
                      src={av.url}
                      alt={av.name}
                      title={av.name}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '2px solid var(--bg-surface-elevated)',
                        marginLeft: idx === 0 ? 0 : '-6px',
                        objectFit: 'cover',
                      }}
                    />
                  ))}
                  {proj.extraAvatarsCount && (
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-surface)',
                        border: '2px solid var(--bg-surface-elevated)',
                        marginLeft: '-6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.62rem',
                        fontWeight: 400,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      +{proj.extraAvatarsCount}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontSize: '0.72rem',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  <span>Details</span>
                  <ArrowUpRight size={13} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
