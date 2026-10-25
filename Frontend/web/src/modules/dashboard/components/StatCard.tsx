import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id: string;
  label: string;
  value: number | string;
  icon: LucideIcon;
  changeText?: string;
  isPositive?: boolean;
  accentColor: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  label,
  value,
  icon: Icon,
  changeText,
  isPositive = true,
  accentColor,
  onClick,
}) => {
  return (
    <div
      id={id}
      className={`card ${onClick ? 'card-interactive' : ''}`}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Accent Gradient Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: accentColor,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Icon size={20} />
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: '1.875rem',
            fontWeight: 500,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginBottom: '0.5rem',
          }}
        >
          {value}
        </div>

        {changeText && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
            <span
              className={isPositive ? 'badge badge-success' : 'badge badge-warning'}
              style={{ padding: '0.15rem 0.45rem', fontSize: '0.6875rem' }}
            >
              {isPositive ? '▲ Live' : '● Standby'}
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>{changeText}</span>
          </div>
        )}
      </div>
    </div>
  );
};
