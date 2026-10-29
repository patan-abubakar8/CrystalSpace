import React from 'react';
import type { LucideIcon } from 'lucide-react';

export type StatAccent = 'purple' | 'cyan' | 'emerald' | 'rose';

interface StatCardProps {
  id: string;
  label: string;
  value: number | string;
  icon: LucideIcon;
  changeText?: string;
  trendBadge?: string;
  trendType?: 'positive' | 'neutral' | 'attention';
  accent?: StatAccent;
  onClick?: () => void;
}

const ACCENT_STYLES: Record<
  StatAccent,
  {
    iconColor: string;
    iconBg: string;
    borderHover: string;
    topAccent: string;
    badgeBg: string;
    badgeColor: string;
  }
> = {
  purple: {
    iconColor: '#4ade80',
    iconBg: 'rgba(74, 222, 128, 0.12)',
    borderHover: 'rgba(74, 222, 128, 0.35)',
    topAccent: 'linear-gradient(90deg, #22c55e, #15803d)',
    badgeBg: 'rgba(74, 222, 128, 0.1)',
    badgeColor: '#4ade80',
  },
  cyan: {
    iconColor: '#06B6D4',
    iconBg: 'rgba(6, 182, 212, 0.12)',
    borderHover: 'rgba(6, 182, 212, 0.35)',
    topAccent: 'linear-gradient(90deg, #06B6D4, #3B82F6)',
    badgeBg: 'rgba(6, 182, 212, 0.1)',
    badgeColor: '#0891B2',
  },
  emerald: {
    iconColor: '#10B981',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    borderHover: 'rgba(16, 185, 129, 0.35)',
    topAccent: 'linear-gradient(90deg, #10B981, #059669)',
    badgeBg: 'rgba(16, 185, 129, 0.1)',
    badgeColor: '#059669',
  },
  rose: {
    iconColor: '#F43F5E',
    iconBg: 'rgba(244, 63, 94, 0.12)',
    borderHover: 'rgba(244, 63, 94, 0.35)',
    topAccent: 'linear-gradient(90deg, #F43F5E, #E11D48)',
    badgeBg: 'rgba(244, 63, 94, 0.1)',
    badgeColor: '#E11D48',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  id,
  label,
  value,
  icon: Icon,
  changeText,
  trendBadge,
  trendType = 'positive',
  accent = 'purple',
  onClick,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const theme = ACCENT_STYLES[accent];

  return (
    <div
      id={id}
      className={`card ${onClick ? 'card-interactive' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 1.35rem',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-surface)',
        border: `1px solid ${isHovered ? theme.borderHover : 'var(--border-subtle)'}`,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isHovered
          ? '0 8px 24px -4px rgba(0, 0, 0, 0.1), 0 2px 6px -1px rgba(0, 0, 0, 0.05)'
          : 'var(--shadow-sm)',
        transform: isHovered && onClick ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Subtle top edge accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: theme.topAccent,
          opacity: isHovered ? 1 : 0.6,
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Header: Label and Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            backgroundColor: theme.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.iconColor,
            border: `1px solid ${theme.borderHover}`,
            transition: 'transform 0.2s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          <Icon size={18} />
        </div>
      </div>

      {/* Main Metric Value */}
      <div style={{ marginBottom: '0.65rem' }}>
        <div
          style={{
            fontSize: '2.15rem',
            fontWeight: 500,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: 'var(--text-primary)',
          }}
        >
          {value}
        </div>
      </div>

      {/* Footer: Trend Pill + Explanatory Text */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          fontSize: '0.75rem',
        }}
      >
        {trendBadge && (
          <span
            style={{
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              fontSize: '0.6875rem',
              fontWeight: 400,
              backgroundColor:
                trendType === 'attention'
                  ? 'rgba(245, 158, 11, 0.12)'
                  : theme.badgeBg,
              color:
                trendType === 'attention'
                  ? '#D97706'
                  : theme.badgeColor,
              border: `1px solid ${
                trendType === 'attention'
                  ? 'rgba(245, 158, 11, 0.3)'
                  : theme.borderHover
              }`,
              display: 'inline-flex',
              alignItems: 'center',
              lineHeight: 1.2,
            }}
          >
            {trendBadge}
          </span>
        )}

        {changeText && (
          <span
            style={{
              color: 'var(--text-tertiary)',
              fontWeight: 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {changeText}
          </span>
        )}
      </div>
    </div>
  );
};
