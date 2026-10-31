import React from 'react';
import type { DraftValidation } from '../../../../types';
import type { OnboardingStepProps } from './stepProps';
import { SECTION_LABELS, WIZARD_STEPS } from './wizardConfig';
import { StepHeading } from './FormField';

interface StepReviewProps extends OnboardingStepProps {
  validation: DraftValidation | null;
  onJump: (step: number) => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  payload,
  permissions,
  validation,
  onJump,
}) => {
  const completed = validation?.completed_sections ?? [];
  const comp = payload.compensation;
  const gross = comp
    ? comp.basic_salary + comp.hra + comp.conveyance + comp.medical_allowance + comp.special_allowance
    : 0;
  const net = comp ? gross - (comp.employee_pf + comp.professional_tax + comp.tds) : 0;
  const sectionIssues = (section: string) =>
    (validation?.issues ?? []).filter((i) => i.section === section);

  return (
    <div>
      <StepHeading
        title="Review & Submit"
        description="Every editable section can be reopened without losing data. Submitting creates the employee record and any chosen account."
      />

      {validation && !validation.can_submit && (
        <div
          style={{
            border: '1px solid var(--color-danger)',
            background: 'var(--color-danger-bg)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.8125rem',
          }}
        >
          <strong style={{ fontWeight: 500, display: 'block', marginBottom: '0.35rem' }}>
            {validation.issues.length + validation.missing_sections.length} item(s) need attention
          </strong>
          {validation.missing_sections.length > 0 && (
            <div style={{ color: 'var(--text-secondary)' }}>
              Incomplete sections:{' '}
              {validation.missing_sections.map((s) => SECTION_LABELS[s] ?? s).join(', ')}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {WIZARD_STEPS.filter((s) => s.section !== 'review').map((step) => {
          const key = step.section;
          const isCompleted = completed.includes(key);
          if (key === 'compensation' && !permissions.compensation_view) return null;
          const issues = sectionIssues(key);
          return (
            <div
              key={step.step}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-4)',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span
                  className={`badge ${isCompleted ? 'badge-success' : issues.length ? 'badge-danger' : 'badge-warning'}`}
                >
                  {isCompleted ? 'Complete' : issues.length ? `${issues.length} error(s)` : 'Incomplete'}
                </span>
                <div>
                  <div style={{ fontSize: '0.875rem' }}>{step.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {issues.length > 0 ? issues[0].message : step.description}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onJump(step.step)}
              >
                Edit
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
        <Summary title="Employment">
          <Row label="Name" value={`${payload.personal.first_name} ${payload.personal.last_name}`.trim() || '—'} />
          <Row label="Employee ID" value={payload.employment.employee_code || 'Auto-generated'} />
          <Row label="Designation" value={payload.employment.designation || '—'} />
          <Row label="Joining" value={payload.employment.date_of_joining || '—'} />
          <Row label="Status" value={payload.employment.employment_status} />
          <Row label="Work mode" value={payload.employment.work_mode} />
        </Summary>

        {permissions.compensation_view && (
          <Summary title="Compensation">
            <Row
              label="Annual CTC"
              value={comp ? `${comp.currency} ${comp.annual_ctc.toLocaleString()}` : 'Not captured'}
            />
            <Row label="Monthly gross" value={comp ? `${comp.currency} ${gross.toLocaleString()}` : '—'} />
            <Row label="Estimated net" value={comp ? `${comp.currency} ${net.toLocaleString()}` : '—'} />
            <Row label="Pay frequency" value={comp?.pay_frequency ?? '—'} />
          </Summary>
        )}

        <Summary title="Leave & schedule">
          <Row label="Policy" value={payload.schedule.leave_policy || '—'} />
          <Row label="Allocations" value={`${payload.schedule.allocations.length} leave type(s)`} />
          <Row label="Expected hours" value={`${payload.schedule.expected_hours} / day`} />
          <Row label="Working days" value={payload.schedule.working_days || '—'} />
        </Summary>

        <Summary title="Documents">
          <Row label="Attached" value={`${payload.documents.length} document(s)`} />
          <Row
            label="Pending verification"
            value={`${payload.documents.filter((d) => (d.verification_status ?? 'Pending') === 'Pending').length}`}
          />
        </Summary>

        <Summary title="Devices & access">
          <Row label="Assets" value={`${payload.devices.assets.length} assigned`} />
          <Row label="Work email" value={payload.devices.account.work_email || payload.employment.work_email || '—'} />
          <Row label="Roles" value={payload.employment.roles.join(', ') || 'None'} />
        </Summary>
      </div>

      {validation && validation.warnings.length > 0 && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-warning)',
            background: 'var(--color-warning-bg)',
            fontSize: '0.8125rem',
          }}
        >
          <strong style={{ fontWeight: 500 }}>Before you submit</strong>
          <ul style={{ margin: '0.35rem 0 0 1rem', color: 'var(--text-secondary)' }}>
            {validation.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '1.25rem' }}>
        Submitting does not activate an application account unless account provisioning is enabled on the
        next step. Duplicate employee IDs and emails are rejected by the server.
      </p>
    </div>
  );
};

const Summary: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div
    style={{
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '0.9rem 1rem',
      background: 'var(--bg-surface)',
    }}
  >
    <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', marginBottom: '0.6rem' }}>
      {title}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem' }}>
      {children}
    </div>
  </div>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
    <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
    <span style={{ textAlign: 'right' }}>{value}</span>
  </div>
);
