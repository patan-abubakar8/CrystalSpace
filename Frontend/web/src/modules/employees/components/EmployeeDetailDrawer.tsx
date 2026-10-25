import React from 'react';
import type { Employee } from '../../../types';
import { X, Mail, Phone, MapPin } from 'lucide-react';

interface EmployeeDetailDrawerProps {
  employee: Employee | null;
  onClose: () => void;
}

export const EmployeeDetailDrawer: React.FC<EmployeeDetailDrawerProps> = ({
  employee,
  onClose,
}) => {
  if (!employee) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              {employee.first_name.charAt(0)}
              {employee.last_name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                {employee.first_name} {employee.last_name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {employee.employee_code} • {employee.designation}
              </div>
            </div>
          </div>
          <button
            id="btn-close-detail-drawer"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Status & Department Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              className={
                employee.status === 'Active'
                  ? 'badge badge-success'
                  : employee.status === 'OnLeave'
                  ? 'badge badge-warning'
                  : 'badge badge-danger'
              }
            >
              {employee.status}
            </span>
            <span className="badge badge-primary">
              {employee.department_name || `Dept #${employee.department_id}`}
            </span>
            {employee.professional_detail?.work_mode && (
              <span className="badge badge-info">{employee.professional_detail.work_mode}</span>
            )}
          </div>

          {/* Contact Details */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <Mail size={15} color="var(--text-tertiary)" />
              <span>{employee.email}</span>
            </div>
            {employee.phone_number && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <Phone size={15} color="var(--text-tertiary)" />
                <span>{employee.phone_number}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <MapPin size={15} color="var(--text-tertiary)" />
              <span>{employee.office_location || 'Not specified'}</span>
            </div>
          </div>

          {/* Professional Overview */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Professional Background
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                fontSize: '0.8125rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Joining Date: </span>
                <span>{new Date(employee.date_of_joining).toLocaleDateString()}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Experience: </span>
                <span>
                  {employee.professional_detail?.total_experience_years
                    ? `${employee.professional_detail.total_experience_years} Years`
                    : 'Not documented'}
                </span>
              </div>
            </div>
          </div>

          {/* Skills */}
          {employee.professional_detail?.skills && (
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Skills & Technologies
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {employee.professional_detail.skills.split(',').map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.75rem',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button id="btn-close-drawer-footer" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
