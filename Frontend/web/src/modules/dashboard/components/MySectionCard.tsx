import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MessageSquare,
  Video,
  Calendar,
  MoreVertical,
  Briefcase,
  Clock,
  Timer,
} from 'lucide-react';
import type { Employee } from '../../../types';
import { WorkTimer } from '../../attendance/components/WorkTimer';

interface MySectionCardProps {
  userEmail?: string;
  userRole?: string;
  employee?: Employee;
  onOpenTracker?: () => void;
  onOpenMeetings?: () => void;
}

export const MySectionCard: React.FC<MySectionCardProps> = ({
  userEmail = 'superadmin@organize.com',
  userRole = 'SuperAdmin',
  employee,
  onOpenTracker,
  onOpenMeetings,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timer'>('details');

  // Derive employee fields or handsome fallbacks matching the reference
  const fullName = employee
    ? `${employee.first_name} ${employee.last_name}`
    : 'Abubakar Patan';
  const designation = employee?.designation || 'Chief Technology Officer';
  const phone = employee?.phone_number || '+1 (555) 019-2831';
  const email = employee?.email || userEmail;
  const departmentName = employee?.department_name || 'Administration';

  // Handsome bearded gentleman portrait matching the Robert Smith reference aesthetic
  const avatarUrl =
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Profile Header & Contact Channels Card */}
      <div
        className="card"
        style={{
          borderRadius: '8px',
          padding: '1.5rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          position: 'relative',
        }}
      >
        {/* Top: Photo, Name, Designation, Role & Menu */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Avatar with warm amber backdrop matching reference */}
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '8px',
                backgroundColor: '#FDE68A',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                border: '2px solid var(--border-default)',
                flexShrink: 0,
              }}
            >
              <img
                src={avatarUrl}
                alt={fullName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {fullName}
                </h2>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(74, 222, 128, 0.12)',
                    color: '#4ade80',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                  }}
                >
                  {userRole}
                </span>
              </div>

              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  marginTop: '0.2rem',
                }}
              >
                {designation}
              </div>

              <div
                style={{
                  fontSize: '0.725rem',
                  color: 'var(--text-tertiary)',
                  marginTop: '0.1rem',
                }}
              >
                {departmentName} Division
              </div>
            </div>
          </div>

          <button
            type="button"
            title="Profile Options"
            className="btn btn-ghost"
            style={{
              padding: '0.4rem',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
            }}
          >
            <MoreVertical size={18} />
          </button>
        </div>

        {/* 4 Communication Action Buttons matching reference */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <a
            href={`mailto:${email}`}
            title={`Send Email to ${email}`}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Mail size={17} />
          </a>

          <a
            href={`tel:${phone}`}
            title={`Call ${phone}`}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Phone size={17} />
          </a>

          <button
            type="button"
            title="Direct Chat"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <MessageSquare size={17} />
          </button>

          <button
            type="button"
            title="Start Video Meeting"
            onClick={onOpenMeetings}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Video size={17} />
          </button>
        </div>

        {/* Time Slots & Meetings Bar */}
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              marginBottom: '0.5rem',
            }}
          >
            Time Slots
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              <span>March, 2024</span>
              <Calendar size={14} style={{ color: 'var(--text-tertiary)' }} />
            </div>

            <button
              type="button"
              onClick={onOpenMeetings}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-surface)',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <span>Meetings</span>
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                3
              </span>
            </button>
          </div>
        </div>

        {/* Tab switcher: Profile Details vs Work Timer */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface-elevated)',
            padding: '3px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            style={{
              flex: 1,
              padding: '0.35rem 0',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'details' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'details' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: activeTab === 'details' ? 600 : 500,
              boxShadow: activeTab === 'details' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Detailed Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timer')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'timer' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'timer' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: activeTab === 'timer' ? 600 : 500,
              boxShadow: activeTab === 'timer' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Timer size={13} /> Work Clock
          </button>
        </div>
      </div>

      {/* Embedded Work Timer (when timer tab selected) */}
      {activeTab === 'timer' ? (
        <WorkTimer onOpenTracker={onOpenTracker} />
      ) : (
        /* Detailed Information Card matching reference */
        <div
          className="card"
          style={{
            borderRadius: '8px',
            padding: '1.5rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 0.4rem 0',
              letterSpacing: '-0.01em',
            }}
          >
            Detailed Information
          </h3>

          {/* Row 1: Full Name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 0.95rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: '2px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  Full Name
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {fullName}
                </div>
              </div>
            </div>

            <span
              style={{
                padding: '0.15rem 0.55rem',
                borderRadius: '6px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#059669',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              Online
            </span>
          </div>

          {/* Row 2: Email Address */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 0.95rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: '2px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  Email Address
                </div>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    maxWidth: '170px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {email}
                </div>
              </div>
            </div>

            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <Mail size={14} />
            </div>
          </div>

          {/* Row 3: Contact Number */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 0.95rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: '2px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  Contact Number
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {phone}
                </div>
              </div>
            </div>

            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <Phone size={14} />
            </div>
          </div>

          {/* Row 4: Designation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 0.95rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: '2px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  Designation
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {designation}
                </div>
              </div>
            </div>

            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <Briefcase size={14} />
            </div>
          </div>

          {/* Row 5: Availability / Working Shift */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 0.95rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: '2px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  Availability
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Office • Mon-Fri 09:00 - 18:00
                </div>
              </div>
            </div>

            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <Clock size={14} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
