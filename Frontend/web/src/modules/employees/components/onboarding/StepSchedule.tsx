import React from 'react';
import type { DraftScheduleSection } from '../../../../types';
import type { OnboardingStepProps } from './stepProps';
import { FieldGrid, FormField, GroupLabel, StepHeading } from './FormField';

export const StepSchedule: React.FC<OnboardingStepProps> = ({
  payload,
  errors,
  reference,
  setSection,
}) => {
  const s = payload.schedule;

  const setSchedule = (patch: Partial<DraftScheduleSection>) =>
    setSection('schedule', { ...s, ...patch });

  const applyWorkSchedule = (id: number) => {
    const schedule = reference.work_schedules.find((w) => w.id === id);
    if (!schedule) {
      setSchedule({ work_schedule_id: 0 });
      return;
    }
    setSchedule({
      work_schedule_id: schedule.id,
      working_days: schedule.work_days,
      weekly_off_days: schedule.weekly_off_days,
      expected_hours: schedule.expected_hours,
      shift_start: schedule.shift_start ?? '',
      shift_end: schedule.shift_end ?? '',
      attendance_policy: schedule.attendance_policy ?? '',
    });
  };

  return (
    <div>
      <StepHeading
        title="Leave & Work Schedule"
        description="Policies are configured centrally. Only the employee's allocation or override is stored here."
      />

      <GroupLabel>Leave policy</GroupLabel>
      <FieldGrid columns={2}>
        <FormField label="Assigned leave policy" htmlFor="leave_policy">
          <select
            id="leave_policy"
            className="form-control"
            value={s.leave_policy ?? ''}
            onChange={(e) => setSchedule({ leave_policy: e.target.value })}
          >
            <option value="">Select policy</option>
            {reference.leave_policies.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </FormField>
      </FieldGrid>

      <div style={{ marginBottom: '0.75rem' }}>
        <GroupLabel>Initial allocations</GroupLabel>
        {s.allocations.length === 0 && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            No allocations added yet. Add the leave types this employee is entitled to.
          </p>
        )}
        {s.allocations.map((alloc, index) => (
          <div
            key={`${alloc.leave_type_id}-${index}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1.3fr auto',
              gap: 'var(--space-3)',
              alignItems: 'end',
              marginBottom: '0.75rem',
            }}
          >
            <FormField label="Leave type" htmlFor={`alloc_type_${index}`}>
              <select
                id={`alloc_type_${index}`}
                className="form-control"
                value={alloc.leave_type_id || ''}
                onChange={(e) => {
                  const next = [...s.allocations];
                  next[index] = { ...alloc, leave_type_id: Number(e.target.value) };
                  setSchedule({ allocations: next });
                }}
              >
                <option value="">Select type</option>
                {reference.leave_types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Days" htmlFor={`alloc_days_${index}`}>
              <input
                id={`alloc_days_${index}`}
                type="number"
                min={0}
                step="0.5"
                className="form-control"
                value={alloc.days}
                onChange={(e) => {
                  const next = [...s.allocations];
                  next[index] = { ...alloc, days: Number(e.target.value) };
                  setSchedule({ allocations: next });
                }}
              />
            </FormField>
            <FormField label="Effective from" htmlFor={`alloc_date_${index}`}>
              <input
                id={`alloc_date_${index}`}
                type="date"
                className="form-control"
                value={alloc.effective_from ?? ''}
                onChange={(e) => {
                  const next = [...s.allocations];
                  next[index] = { ...alloc, effective_from: e.target.value };
                  setSchedule({ allocations: next });
                }}
              />
            </FormField>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              aria-label="Remove allocation"
              onClick={() => setSchedule({ allocations: s.allocations.filter((_, i) => i !== index) })}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() =>
            setSchedule({
              allocations: [...s.allocations, { leave_type_id: 0, days: 0, effective_from: '' }],
            })
          }
        >
          + Add leave type
        </button>
      </div>

      <GroupLabel>Work schedule</GroupLabel>
      <FieldGrid columns={2}>
        <FormField
          label="Schedule template"
          htmlFor="work_schedule_id"
          error={errors.work_schedule_id}
          hint="Fills the fields below; you can still adjust them."
        >
          <select
            id="work_schedule_id"
            className="form-control"
            value={s.work_schedule_id ?? ''}
            onChange={(e) => applyWorkSchedule(Number(e.target.value))}
          >
            <option value="">Select schedule</option>
            {reference.work_schedules.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Expected hours / day" htmlFor="expected_hours" error={errors.expected_hours}>
          <input
            id="expected_hours"
            type="number"
            min={0}
            max={24}
            step="0.5"
            className="form-control"
            value={s.expected_hours}
            onChange={(e) => setSchedule({ expected_hours: Number(e.target.value) })}
          />
        </FormField>
      </FieldGrid>

      <FieldGrid columns={2}>
        <FormField label="Working days" htmlFor="working_days">
          <input
            id="working_days"
            className="form-control"
            value={s.working_days ?? ''}
            onChange={(e) => setSchedule({ working_days: e.target.value })}
          />
        </FormField>
        <FormField label="Weekly off days" htmlFor="weekly_off_days">
          <input
            id="weekly_off_days"
            className="form-control"
            value={s.weekly_off_days ?? ''}
            onChange={(e) => setSchedule({ weekly_off_days: e.target.value })}
          />
        </FormField>
        <FormField label="Shift start" htmlFor="shift_start">
          <input
            id="shift_start"
            type="time"
            className="form-control"
            value={s.shift_start ?? ''}
            onChange={(e) => setSchedule({ shift_start: e.target.value })}
          />
        </FormField>
        <FormField label="Shift end" htmlFor="shift_end">
          <input
            id="shift_end"
            type="time"
            className="form-control"
            value={s.shift_end ?? ''}
            onChange={(e) => setSchedule({ shift_end: e.target.value })}
          />
        </FormField>
        <FormField label="Attendance policy" htmlFor="attendance_policy">
          <input
            id="attendance_policy"
            className="form-control"
            value={s.attendance_policy ?? ''}
            onChange={(e) => setSchedule({ attendance_policy: e.target.value })}
          />
        </FormField>
        <FormField label="Holiday calendar" htmlFor="holiday_calendar">
          <input
            id="holiday_calendar"
            className="form-control"
            value={s.holiday_calendar ?? ''}
            onChange={(e) => setSchedule({ holiday_calendar: e.target.value })}
            placeholder="e.g. India 2026"
          />
        </FormField>
      </FieldGrid>
    </div>
  );
};
