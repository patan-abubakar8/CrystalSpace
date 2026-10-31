import React from 'react';
import type { DraftCompensationSection } from '../../../../types';
import type { OnboardingStepProps } from './stepProps';
import { FieldGrid, FormField, GroupLabel, StepHeading } from './FormField';

const blankCompensation = (): DraftCompensationSection => ({
  annual_ctc: 0,
  currency: 'INR',
  salary_structure: 'Fixed + Variable',
  basic_salary: 0,
  hra: 0,
  conveyance: 0,
  medical_allowance: 0,
  special_allowance: 0,
  variable_pay: 0,
  employer_pf: 0,
  employee_pf: 0,
  professional_tax: 0,
  tds: 0,
  hourly_rate: 0,
  pay_frequency: 'Monthly',
  effective_date: '',
  payroll_id: '',
  statutory_info: '',
});

const money = (v: number) =>
  v.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 });

export const StepCompensation: React.FC<OnboardingStepProps> = ({
  payload,
  errors,
  permissions,
  setSection,
}) => {
  const comp = payload.compensation ?? blankCompensation();
  const readOnly = !permissions.compensation_edit;

  const setComp = (patch: Partial<DraftCompensationSection>) =>
    setSection('compensation', { ...comp, ...patch });

  const gross =
    comp.basic_salary + comp.hra + comp.conveyance + comp.medical_allowance + comp.special_allowance;
  const deductions = comp.employee_pf + comp.professional_tax + comp.tds;
  const net = gross - deductions;

  const amount = (
    label: string,
    key: keyof DraftCompensationSection,
    opts?: { required?: boolean }
  ) => (
    <FormField label={label} htmlFor={`comp_${key}`} required={opts?.required} error={errors[key]}>
      <input
        id={`comp_${key}`}
        type="number"
        min={0}
        step="0.01"
        className="form-control"
        disabled={readOnly}
        value={Number(comp[key] ?? 0)}
        onChange={(e) => setComp({ [key]: Number(e.target.value) } as Partial<DraftCompensationSection>)}
      />
    </FormField>
  );

  return (
    <div>
      <StepHeading
        title="Compensation & Payroll"
        description="Annual CTC is not take-home pay. Components, deductions and employer contributions are recorded separately."
      />

      {readOnly && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
          }}
        >
          Read-only: your role can view compensation but not change it.
        </div>
      )}

      <GroupLabel>Package</GroupLabel>
      <FieldGrid columns={3}>
        {amount('Annual CTC', 'annual_ctc')}
        <FormField label="Currency" htmlFor="comp_currency">
          <select
            id="comp_currency"
            className="form-control"
            disabled={readOnly}
            value={comp.currency}
            onChange={(e) => setComp({ currency: e.target.value })}
          >
            {['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Salary structure" htmlFor="comp_structure">
          <select
            id="comp_structure"
            className="form-control"
            disabled={readOnly}
            value={comp.salary_structure}
            onChange={(e) => setComp({ salary_structure: e.target.value })}
          >
            {['Fixed + Variable', 'Fixed Only', 'Hourly', 'Contract Retainer'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FormField>
      </FieldGrid>

      <GroupLabel>Earnings</GroupLabel>
      <FieldGrid columns={3}>
        {amount('Basic salary', 'basic_salary', { required: true })}
        {amount('HRA', 'hra')}
        {amount('Conveyance', 'conveyance')}
        {amount('Medical allowance', 'medical_allowance')}
        {amount('Special allowance', 'special_allowance')}
        {amount('Variable pay', 'variable_pay')}
      </FieldGrid>

      <GroupLabel>Deductions & contributions</GroupLabel>
      <FieldGrid columns={3}>
        {amount('Employee PF', 'employee_pf')}
        {amount('Employer PF', 'employer_pf')}
        {amount('Professional tax', 'professional_tax')}
        {amount('TDS', 'tds')}
        {amount('Hourly rate (if applicable)', 'hourly_rate')}
        <FormField label="Pay frequency" htmlFor="comp_frequency">
          <select
            id="comp_frequency"
            className="form-control"
            disabled={readOnly}
            value={comp.pay_frequency}
            onChange={(e) => setComp({ pay_frequency: e.target.value })}
          >
            {['Monthly', 'Semi-Monthly', 'Bi-Weekly', 'Weekly', 'Hourly'].map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </FormField>
      </FieldGrid>

      <FieldGrid columns={3}>
        <FormField label="Effective date" htmlFor="comp_effective" error={errors.effective_date}>
          <input
            id="comp_effective"
            type="date"
            className="form-control"
            disabled={readOnly}
            value={comp.effective_date}
            onChange={(e) => setComp({ effective_date: e.target.value })}
          />
        </FormField>
        <FormField label="Payroll identifier" htmlFor="comp_payroll">
          <input
            id="comp_payroll"
            className="form-control"
            disabled={readOnly}
            value={comp.payroll_id ?? ''}
            onChange={(e) => setComp({ payroll_id: e.target.value })}
          />
        </FormField>
        <FormField label="Statutory information" htmlFor="comp_statutory">
          <input
            id="comp_statutory"
            className="form-control"
            disabled={readOnly}
            value={comp.statutory_info ?? ''}
            onChange={(e) => setComp({ statutory_info: e.target.value })}
            placeholder="UAN, tax regime, etc."
          />
        </FormField>
      </FieldGrid>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 'var(--space-4)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface-elevated)',
        }}
      >
        {[
          ['Monthly gross', money(gross)],
          ['Total deductions', money(deductions)],
          ['Estimated net', money(net)],
        ].map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
              {label}
            </div>
            <div style={{ fontSize: '1.0625rem', marginTop: '0.25rem' }}>
              {comp.currency} {value}
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
        Statutory rules are not computed automatically; figures entered here are authoritative. Values
        are only visible to roles with compensation access.
      </p>
    </div>
  );
};
