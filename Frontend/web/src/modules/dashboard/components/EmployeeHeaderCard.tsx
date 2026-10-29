import React from 'react';
import type { Employee, UserRole } from '../../../types';
import { DeviceInfoCard } from './DeviceInfoCard';
import { Building2, Sparkles } from 'lucide-react';

interface EmployeeHeaderCardProps {
  userEmail?: string;
  userRole?: UserRole | string;
  employee?: Employee;
}

export const EmployeeHeaderCard: React.FC<EmployeeHeaderCardProps> = ({
  userEmail = 'employee1@organize.com',
  userRole = 'Employee',
  employee,
}) => {
  const fullName = employee
    ? `${employee.first_name} ${employee.last_name}`
    : userEmail.split('@')[0] ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1) : 'Ahmed Khan';
  const designation = employee?.designation || 'Senior Full Stack Engineer';
  const departmentName = employee?.department_name || 'Engineering Division';
  const employeeCode = employee?.employee_code || 'EMP-1042';

  const avatarUrl =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop&crop=faces';

  return (
    <div
      className="card"
      id="dashboard-employee-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Top Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '5%',
          right: '5%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.4), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Left: Avatar, Name, Designation, Role & Dept (Item 4) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-default)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              backgroundColor: 'var(--bg-surface-elevated)',
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

          {/* Pulse Online Indicator */}
          <span
            title="Online & Synchronized"
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              border: '2px solid var(--bg-surface)',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.7)',
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: '1.35rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              {fullName}
            </h1>

            {/* Sleek Role Badge */}
            <span
              style={{
                padding: '0.15rem 0.55rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 400,
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                color: '#4ade80',
                border: '1px solid rgba(74, 222, 128, 0.25)',
                letterSpacing: '0.02em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Sparkles size={11} /> {userRole}
            </span>

            {/* Employee ID Tag */}
            <span
              style={{
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 400,
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontFamily: 'monospace',
                letterSpacing: '0.03em',
              }}
            >
              {employeeCode}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              marginTop: '0.3rem',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ fontWeight: 400, color: 'var(--text-primary)' }}>{designation}</span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
              <Building2 size={13} style={{ color: 'var(--text-tertiary)' }} /> {departmentName}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Device Info & Raise Issue Ticket (Item 3) */}
      <DeviceInfoCard compact={true} />
    </div>
  );
};
