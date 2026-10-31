import React from 'react';
import type { Department } from '../../../types';
import { Building2, Layers, Calendar } from 'lucide-react';

interface DepartmentCardProps {
  department: Department;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({ department }) => {
  return (
    <div
      id={`dept-card-${department.id}`}
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 'var(--space-5)',
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-action)',
            }}
          >
            <Building2 size={20} />
          </div>
          <span
            className="badge badge-primary"
            style={{ fontFamily: 'monospace', fontWeight: 500 }}
          >
            {department.code}
          </span>
        </div>

        <h3 style={{ fontSize: '1.0625rem', marginBottom: '0.35rem', fontWeight: 500 }}>{department.name}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', minHeight: '38px' }}>
          {department.description || 'Organizational business unit.'}
        </p>
      </div>

      <div
        style={{
          paddingTop: '0.875rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Layers size={13} />
          Unit ID #{department.id}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={13} />
          {new Date(department.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
