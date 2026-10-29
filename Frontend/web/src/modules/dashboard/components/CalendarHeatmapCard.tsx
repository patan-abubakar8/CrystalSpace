import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface DayBlockData {
  dayNumber: number;
  type: 'regular' | 'charcoal' | 'coral' | 'blue' | 'amber' | 'purple' | 'weekend';
  hoursLogged?: number;
  statusText: string;
  mode: 'Office' | 'Remote' | 'Leave' | 'Off';
  punchIn?: string;
  punchOut?: string;
}

export const CalendarHeatmapCard: React.FC = () => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(2); // 0=Jan, 1=Feb, 2=March
  const [selectedDay, setSelectedDay] = useState<number>(27);

  const months = ['January', 'February', 'March', 'April', 'May', 'June'];
  const monthName = months[currentMonthIndex];

  // Distinct day blocks matching the reference screenshot exactly!
  // Day 5 is Coral Red, Day 8 is Charcoal, Day 12 is Sky Blue,
  // Day 17 & 20 are Charcoal, Day 23 is Amber, Day 25 is Charcoal, Day 27 is Purple!
  const daysData: DayBlockData[] = Array.from({ length: 28 }, (_, i) => {
    const day = i + 1;
    if (day === 5) {
      return {
        dayNumber: day,
        type: 'coral',
        statusText: 'Approved Leave (Spring Holiday)',
        mode: 'Leave',
      };
    }
    if (day === 12) {
      return {
        dayNumber: day,
        type: 'blue',
        hoursLogged: 8.0,
        statusText: 'Remote Shift (Sprint Deliverable)',
        mode: 'Remote',
        punchIn: '09:00 AM',
        punchOut: '05:00 PM',
      };
    }
    if (day === 23) {
      return {
        dayNumber: day,
        type: 'amber',
        hoursLogged: 4.5,
        statusText: 'Design Sprint Review & Half-Day',
        mode: 'Office',
        punchIn: '09:00 AM',
        punchOut: '01:30 PM',
      };
    }
    if (day === 27) {
      return {
        dayNumber: day,
        type: 'purple',
        hoursLogged: 9.5,
        statusText: 'Overtime Sprint (+1.5h Overtime Target)',
        mode: 'Office',
        punchIn: '08:45 AM',
        punchOut: '06:15 PM',
      };
    }
    if ([8, 17, 20, 25].includes(day)) {
      return {
        dayNumber: day,
        type: 'charcoal',
        hoursLogged: 8.0,
        statusText: 'Standard Full Workday (On-Time)',
        mode: 'Office',
        punchIn: '09:00 AM',
        punchOut: '05:00 PM',
      };
    }
    if (day % 7 === 6 || day % 7 === 0) {
      return {
        dayNumber: day,
        type: 'weekend',
        statusText: 'Weekend Rest Day',
        mode: 'Off',
      };
    }
    return {
      dayNumber: day,
      type: 'regular',
      hoursLogged: 7.5,
      statusText: 'Regular Shift Logged',
      mode: 'Office',
      punchIn: '09:15 AM',
      punchOut: '05:15 PM',
    };
  });

  const activeDayRecord = daysData.find((d) => d.dayNumber === selectedDay) || daysData[26];

  // Colors matching the user's reference screenshot
  const getBlockStyle = (d: DayBlockData, isSelected: boolean) => {
    let background = 'var(--bg-surface-elevated)';
    let color = 'var(--text-secondary)';
    let border = '1px solid var(--border-subtle)';

    switch (d.type) {
      case 'coral':
        background = '#F43F5E';
        color = '#FFFFFF';
        border = '1px solid #E11D48';
        break;
      case 'blue':
        background = '#38BDF8';
        color = '#FFFFFF';
        border = '1px solid #0284C7';
        break;
      case 'amber':
        background = '#FBBF24';
        color = '#78350F';
        border = '1px solid #D97706';
        break;
      case 'purple':
        background = '#6366F1';
        color = '#FFFFFF';
        border = '1px solid #4F46E5';
        break;
      case 'charcoal':
        background = '#334155';
        color = '#F8FAFC';
        border = '1px solid #1E293B';
        break;
      case 'weekend':
        background = 'var(--bg-surface)';
        color = 'var(--text-tertiary)';
        border = '1px dashed var(--border-subtle)';
        break;
      case 'regular':
      default:
        background = 'var(--bg-surface-elevated)';
        color = 'var(--text-primary)';
        border = '1px solid var(--border-default)';
        break;
    }

    if (isSelected) {
      border = '2px solid var(--color-accent-magenta)';
    }

    return { background, color, border };
  };

  return (
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
      }}
    >
      {/* Top Header: "Calender" pill icon, Month Switcher, Menu */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            <span>Calender</span>
            <CalendarIcon size={15} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>

        {/* Month Title with Arrow Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            title="Previous Month"
            onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : months.length - 1))}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <span
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              minWidth: '80px',
              textAlign: 'center',
            }}
          >
            {monthName}
          </span>

          <button
            type="button"
            title="Next Month"
            onClick={() => setCurrentMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : 0))}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          type="button"
          title="Calendar Options"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.2rem',
          }}
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Tactile Day Blocks Grid (7 Columns, matching reference!) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.5rem',
        }}
      >
        {daysData.map((d) => {
          const isSelected = selectedDay === d.dayNumber;
          const { background, color, border } = getBlockStyle(d, isSelected);

          return (
            <div
              key={d.dayNumber}
              onClick={() => setSelectedDay(d.dayNumber)}
              title={`${monthName} ${d.dayNumber} - ${d.statusText}`}
              style={{
                aspectRatio: '1',
                borderRadius: '6px',
                background,
                color,
                border,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 0 0 2px var(--color-accent-magenta)' : 'none',
                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.filter = 'brightness(1.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.filter = 'none';
                }
              }}
            >
              {d.dayNumber}
            </div>
          );
        })}
      </div>

      {/* Selected Day Details Strip */}
      {activeDayRecord && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor:
                  activeDayRecord.type === 'coral'
                    ? '#F43F5E'
                    : activeDayRecord.type === 'blue'
                    ? '#0284C7'
                    : activeDayRecord.type === 'amber'
                    ? '#F59E0B'
                    : activeDayRecord.type === 'purple'
                    ? '#6366F1'
                    : '#10B981',
              }}
            />
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {monthName} {activeDayRecord.dayNumber} • {activeDayRecord.statusText}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                {activeDayRecord.punchIn && activeDayRecord.punchOut
                  ? `Logged Shift: ${activeDayRecord.punchIn} – ${activeDayRecord.punchOut} (${activeDayRecord.hoursLogged}h)`
                  : `Mode: ${activeDayRecord.mode}`}
              </div>
            </div>
          </div>

          <span
            style={{
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
            }}
          >
            {activeDayRecord.mode}
          </span>
        </div>
      )}

      {/* Monthly Attendance Health Metrics */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <CheckCircle2 size={13} style={{ color: '#10B981' }} />
          <span>Present: <strong>96% (22d)</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={13} style={{ color: '#06B6D4' }} />
          <span>Avg: <strong>8.2h / day</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={13} style={{ color: '#4ade80' }} />
          <span>Total: <strong>176 hrs</strong></span>
        </div>
      </div>
    </div>
  );
};
