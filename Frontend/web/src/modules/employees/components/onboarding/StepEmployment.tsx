import React from 'react';
import type { OnboardingStepProps } from './stepProps';
import { FieldGrid, FormField, GroupLabel, StepHeading } from './FormField';

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FullTime: 'Full-time',
  PartTime: 'Part-time',
  Contract: 'Contract',
  Intern: 'Intern',
};

const addMonths = (iso: string, months: number): string => {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
};

export const StepEmployment: React.FC<OnboardingStepProps> = ({
  payload,
  errors,
  reference,
  permissions,
  departments,
  employees,
  patch,
}) => {
  const e = payload.employment;
  const isContract = e.employment_type === 'Contract' || e.employment_type === 'Intern';

  const updateDates = (changes: { date_of_joining?: string; probation_months?: number }) => {
    const joining = changes.date_of_joining ?? e.date_of_joining;
    const months = changes.probation_months ?? e.probation_months;
    patch('employment', {
      ...changes,
      probation_end_date: months > 0 ? addMonths(joining, months) : '',
    });
  };

  return (
    <div>
      <StepHeading
        title="Employment Details"
        description="Onboarding status is tracked separately from the employment status below."
      />

      <GroupLabel>Assignment</GroupLabel>
      <FieldGrid columns={3}>
        <FormField
          label="Employee ID"
          htmlFor="employee_code"
          error={errors.employee_code}
          hint="Leave blank to generate automatically."
        >
          <input
            id="employee_code"
            className="form-control"
            value={e.employee_code ?? ''}
            onChange={(ev) => patch('employment', { employee_code: ev.target.value })}
            placeholder="Auto-generated"
          />
        </FormField>
        <FormField label="Department" htmlFor="department_id" required error={errors.department_id}>
          <select
            id="department_id"
            className="form-control"
            value={e.department_id || ''}
            onChange={(ev) => patch('employment', { department_id: Number(ev.target.value) })}
          >
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Designation" htmlFor="designation" required error={errors.designation}>
          <input
            id="designation"
            className="form-control"
            value={e.designation}
            onChange={(ev) => patch('employment', { designation: ev.target.value })}
          />
        </FormField>
      </FieldGrid>

      <FieldGrid columns={3}>
        <FormField label="Job title (optional)" htmlFor="job_title">
          <input
            id="job_title"
            className="form-control"
            value={e.job_title ?? ''}
            onChange={(ev) => patch('employment', { job_title: ev.target.value })}
            placeholder="Defaults to the designation"
          />
        </FormField>
        <FormField
          label="Reporting manager"
          htmlFor="manager_id"
          error={errors.manager_id}
          hint="An employee cannot report to themselves."
        >
          <select
            id="manager_id"
            className="form-control"
            value={e.manager_id ?? ''}
            onChange={(ev) =>
              patch('employment', { manager_id: ev.target.value ? Number(ev.target.value) : null })
            }
          >
            <option value="">No manager</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name} — {emp.designation}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Secondary approver (optional)" htmlFor="secondary_approver_id">
          <select
            id="secondary_approver_id"
            className="form-control"
            value={e.secondary_approver_id ?? ''}
            onChange={(ev) =>
              patch('employment', {
                secondary_approver_id: ev.target.value ? Number(ev.target.value) : null,
              })
            }
          >
            <option value="">None</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name}
              </option>
            ))}
          </select>
        </FormField>
      </FieldGrid>

      <GroupLabel>Terms</GroupLabel>
      <FieldGrid columns={3}>
        <FormField label="Employment type" htmlFor="employment_type" required error={errors.employment_type}>
          <select
            id="employment_type"
            className="form-control"
            value={e.employment_type}
            onChange={(ev) => patch('employment', { employment_type: ev.target.value })}
          >
            {reference.employment_types.map((type) => (
              <option key={type} value={type}>
                {EMPLOYMENT_TYPE_LABELS[type] ?? type}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Work mode" htmlFor="work_mode" required error={errors.work_mode}>
          <select
            id="work_mode"
            className="form-control"
            value={e.work_mode}
            onChange={(ev) => patch('employment', { work_mode: ev.target.value })}
          >
            {reference.work_modes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Work location" htmlFor="work_location">
          <input
            id="work_location"
            className="form-control"
            value={e.work_location ?? ''}
            onChange={(ev) => patch('employment', { work_location: ev.target.value })}
            placeholder="e.g. Hyderabad HQ"
          />
        </FormField>
      </FieldGrid>

      <FieldGrid columns={4}>
        <FormField
          label="Joining date"
          htmlFor="date_of_joining"
          required
          error={errors.date_of_joining}
        >
          <input
            id="date_of_joining"
            type="date"
            className="form-control"
            value={e.date_of_joining}
            onChange={(ev) => updateDates({ date_of_joining: ev.target.value })}
          />
        </FormField>
        <FormField label="Probation (months)" htmlFor="probation_months">
          <input
            id="probation_months"
            type="number"
            min={0}
            max={24}
            className="form-control"
            value={e.probation_months}
            onChange={(ev) => updateDates({ probation_months: Number(ev.target.value) })}
          />
        </FormField>
        <FormField label="Probation end" htmlFor="probation_end_date">
          <input
            id="probation_end_date"
            type="date"
            className="form-control"
            value={e.probation_end_date ?? ''}
            onChange={(ev) => patch('employment', { probation_end_date: ev.target.value })}
          />
        </FormField>
        <FormField
          label={isContract ? 'Contract end date' : 'Contract end (n/a)'}
          htmlFor="contract_end_date"
          error={errors.contract_end_date}
        >
          <input
            id="contract_end_date"
            type="date"
            className="form-control"
            disabled={!isContract}
            value={e.contract_end_date ?? ''}
            onChange={(ev) => patch('employment', { contract_end_date: ev.target.value })}
          />
        </FormField>
      </FieldGrid>

      <FieldGrid columns={2}>
        <FormField
          label="Employment status"
          htmlFor="employment_status"
          required
          error={errors.employment_status}
          hint="This is the HR status, not the onboarding progress."
        >
          <select
            id="employment_status"
            className="form-control"
            value={e.employment_status}
            onChange={(ev) => patch('employment', { employment_status: ev.target.value })}
          >
            {reference.employment_statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Work email" htmlFor="work_email" error={errors.work_email}>
          <input
            id="work_email"
            type="email"
            className="form-control"
            value={e.work_email ?? ''}
            onChange={(ev) => patch('employment', { work_email: ev.target.value })}
            placeholder="name@organize.com"
          />
        </FormField>
      </FieldGrid>

      <GroupLabel>Application roles</GroupLabel>
      {permissions.access_manage ? (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {reference.roles.map((role) => {
              const checked = e.roles.includes(role);
              return (
                <label
                  key={role}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.7rem',
                    border: `1px solid ${checked ? 'var(--sidebar-active-border)' : 'var(--border-default)'}`,
                    background: checked ? 'var(--sidebar-active-bg)' : 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(ev) =>
                      patch('employment', {
                        roles: ev.target.checked
                          ? [...e.roles, role]
                          : e.roles.filter((r) => r !== role),
                      })
                    }
                    style={{ accentColor: 'var(--color-accent-magenta)' }}
                  />
                  {role}
                </label>
              );
            })}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
            Privileged roles can only be assigned by a role administrator. Roles are validated again on
            submission.
          </p>
        </>
      ) : (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          You do not have permission to assign application roles. An administrator can grant them after
          the profile is created.
        </p>
      )}
    </div>
  );
};
