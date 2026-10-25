import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id: string;
  label: string;
  value: number | string;
  icon: LucideIcon;
  changeText?: string;
  isPositive?: boolean;
  accentColor?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  label,
  value,
  icon: Icon,
  changeText,
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
        padding: '1.35rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Icon size={18} />
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: '2rem',
            fontWeight: 500,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.025em',
            lineHeight: 1,
            marginBottom: '0.45rem',
          }}
        >
          {value}
        </div>

        {changeText && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>
            {changeText}
          </div>
        )}
      </div>
    </div>
  );
};
