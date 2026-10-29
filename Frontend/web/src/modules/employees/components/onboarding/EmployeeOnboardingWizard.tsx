import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeDraftApi } from '../../api/employeeDraftApi';
import { employeeApi } from '../../api/employeeApi';
import { departmentApi } from '../../../departments/api/departmentApi';
import { queryKeys } from '../../../../core/api/queryClient';
import { ApiError } from '../../../../core/api/client';
import { useNotification } from '../../../../core/context/NotificationContext';
import type {
  DraftSection,
  DraftSubmitResult,
  DraftValidation,
} from '../../../../types';
import { WIZARD_STEPS, SECTION_LABELS } from './wizardConfig';
import { useEmployeeDraft } from './useEmployeeDraft';
import { validateStep } from './validation';
import { StepPersonal } from './StepPersonal';
import { StepEmployment } from './StepEmployment';
import { StepCompensation } from './StepCompensation';
import { StepSchedule } from './StepSchedule';
import { StepDocuments } from './StepDocuments';
import { StepDevices } from './StepDevices';
import { StepReview } from './StepReview';
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Loader2, Save, X } from 'lucide-react';

interface Props {
  draftId: number;
  onExit: () => void;
  onSubmitted: (result: DraftSubmitResult) => void;
}

export const EmployeeOnboardingWizard: React.FC<Props> = ({ draftId, onExit, onSubmitted }) => {
  const { success, error: notifyError } = useNotification();
  const {
    draft,
    permissions,
    validation,
    payload,
    loading,
    loadError,
    saveStatus,
    saveError,
    conflict,
    lastSavedAt,
    currentStep,
    setCurrentStep,
    setSectionValue,
    patchSection,
    saveNow,
    getVersion,
    discardLocalChanges,
    setValidation,
  } = useEmployeeDraft(draftId);

  const { data: reference, isLoading: referenceLoading } = useQuery({
    queryKey: queryKeys.employeeDrafts.reference,
    queryFn: employeeDraftApi.reference,
  });
  const { data: departments = [] } = useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: departmentApi.list,
  });
  const { data: employees = [] } = useQuery({
    queryKey: queryKeys.employees.list({ scope: 'managers' }),
    queryFn: () => employeeApi.list(),
  });

  const [step, setStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitIssues, setSubmitIssues] = useState<DraftValidation | null>(null);

  useEffect(() => {
    setStep(currentStep);
  }, [currentStep]);

  const activeStep = WIZARD_STEPS[Math.min(Math.max(step, 1), WIZARD_STEPS.length) - 1];
  const section = activeStep.section;
  const isReview = section === 'review';

  const clientErrors = useMemo(() => {
    if (!reference || !permissions || section === 'review') return {} as Record<string, string>;
    if (section === 'compensation' && !permissions.compensation_view)
      return {} as Record<string, string>;
    return validateStep(section as DraftSection, payload, permissions, reference);
  }, [reference, permissions, section, payload]);

  const serverErrors = useMemo(() => {
    const out: Record<string, string> = {};
    (validation?.issues ?? [])
      .filter((issue) => issue.section === section)
      .forEach((issue) => {
        const key = issue.field.includes('.') ? issue.field.split('.').pop()! : issue.field;
        out[key] = issue.message;
      });
    return out;
  }, [validation, section]);

  const errors = showErrors ? { ...serverErrors, ...clientErrors } : serverErrors;

  const handleNext = async () => {
    if (!reference) return;
    const stepErrors = validateStep(section as DraftSection, payload, permissions!, reference);
    if (Object.keys(stepErrors).length > 0) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    const ok = await setCurrentStep(Math.min(step + 1, 7));
    if (!ok) notifyError('Not saved', saveError ?? 'The current section could not be saved.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = async () => {
    setShowErrors(false);
    await setCurrentStep(Math.max(step - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDraft = async () => {
    const ok = await saveNow();
    if (ok) success('Draft saved', 'Your progress is stored on the server.');
    else notifyError('Save failed', saveError ?? 'Changes could not be saved.');
  };

  const openSubmit = async () => {
    setSubmitError('');
    setSubmitIssues(null);
    const ok = await saveNow();
    if (!ok) {
      notifyError('Save failed', saveError ?? 'Save the draft before submitting.');
      return;
    }
    setCreateAccount(false);
    setSubmitOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await employeeDraftApi.submit(draftId, {
        version: getVersion(),
        create_account: createAccount,
        roles: payload.employment.roles,
      });
      setSubmitOpen(false);
      onSubmitted(result);
    } catch (err) {
      const apiError = err as ApiError;
      const details = apiError.details as { data?: DraftValidation } | undefined;
      if (apiError.statusCode === 422 && details?.data) {
        setValidation(details.data);
        setSubmitIssues(details.data);
      }
      setSubmitError(apiError.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || referenceLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Loader2 size={22} className="spin-icon" style={{ marginBottom: '0.5rem' }} />
        <div>Loading onboarding draft…</div>
      </div>
    );
  }

  if (loadError || !draft || !permissions || !reference) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={26} color="var(--color-warning)" />
        <h2 style={{ fontSize: '1.0625rem', margin: '0.5rem 0' }}>Draft unavailable</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {loadError ?? 'This draft could not be loaded or you do not have access to it.'}
        </p>
        <button className="btn btn-secondary" onClick={onExit}>
          Back to employees
        </button>
      </div>
    );
  }

  const completed = validation?.completed_sections ?? draft.completed_sections ?? [];
  const progress = Math.round((completed.length / 6) * 100);

  const sharedStepProps = {
    payload,
    errors,
    reference,
    permissions,
    departments,
    employees,
    patch: patchSection,
    setSection: setSectionValue,
  };

  return (
    <div>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-ghost btn-icon" onClick={onExit} aria-label="Back to employees">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.375rem' }}>
              {draft.display_name ? `Onboarding ${draft.display_name}` : 'New Employee Onboarding'}
            </h1>
            <p className="section-subtitle" style={{ fontSize: '0.8125rem' }}>
              Draft {draft.draft_ref} · Step {step} of 7 · {progress}% complete
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <SaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} error={saveError} onRetry={handleSaveDraft} />
          <button className="btn btn-secondary" onClick={handleSaveDraft} disabled={saveStatus === 'saving'}>
            <Save size={15} /> Save draft
          </button>
        </div>
      </div>

      {conflict && (
        <div
          className="card"
          style={{
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            borderColor: 'var(--color-warning)',
            background: 'var(--color-warning-bg)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.8125rem' }}>
            This draft was changed in another session. Reload to continue from the latest version.
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => void discardLocalChanges()}>
            Reload draft
          </button>
        </div>
      )}

      <div className="wizard-layout">
        {/* Stepper */}
        <aside className="wizard-stepper" aria-label="Onboarding steps">
          <div style={{ marginBottom: '0.85rem' }}>
            <div
              style={{
                height: '4px',
                borderRadius: '2px',
                background: 'var(--border-subtle)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'var(--color-primary-gradient)',
                  transition: 'width 250ms ease',
                }}
              />
            </div>
          </div>
          {WIZARD_STEPS.map((s) => {
            const isDone = completed.includes(s.section);
            const hidden = s.section === 'compensation' && !permissions.compensation_view;
            if (hidden) return null;
            const issues = (validation?.issues ?? []).filter((i) => i.section === s.section).length;
            const isActive = s.step === step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => void setCurrentStep(s.step)}
                aria-current={isActive ? 'step' : undefined}
                className={`wizard-step ${isActive ? 'active' : ''}`}
              >
                <span className={`wizard-step-marker ${isDone ? 'done' : issues ? 'error' : ''}`}>
                  {isDone ? <Check size={12} /> : issues ? <AlertTriangle size={11} /> : s.step}
                </span>
                <span style={{ flex: 1, textAlign: 'left' }}>
                  <span style={{ display: 'block', fontSize: '0.8125rem' }}>{s.title}</span>
                  {issues > 0 && (
                    <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--color-danger)' }}>
                      {issues} issue{issues > 1 ? 's' : ''}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Form */}
        <div>
          <div className="card" style={{ padding: '1.5rem' }}>
            {section === 'personal' && <StepPersonal {...sharedStepProps} />}
            {section === 'employment' && <StepEmployment {...sharedStepProps} />}
            {section === 'compensation' && <StepCompensation {...sharedStepProps} />}
            {section === 'schedule' && <StepSchedule {...sharedStepProps} />}
            {section === 'documents' && <StepDocuments {...sharedStepProps} />}
            {section === 'devices' && <StepDevices {...sharedStepProps} />}
            {isReview && (
              <StepReview
                {...sharedStepProps}
                validation={validation}
                onJump={(target) => void setCurrentStep(target)}
              />
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginTop: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={step === 1}
            >
              <ChevronLeft size={15} /> Previous
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {step < 7 ? (
                <button className="btn btn-primary" onClick={handleNext} disabled={saveStatus === 'saving'}>
                  Next <ChevronRight size={15} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={openSubmit}>
                  Review &amp; Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation */}
      {submitOpen && (
        <div className="modal-overlay" onClick={() => (submitting ? null : setSubmitOpen(false))}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.0625rem' }}>Submit employee record</h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSubmitOpen(false)} disabled={submitting}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                This creates an employee record for{' '}
                <strong style={{ fontWeight: 500 }}>{draft.display_name || 'this draft'}</strong> with{' '}
                {payload.employment.employment_status} employment status. Employee IDs and emails are
                checked for duplicates on the server.
              </p>

              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                }}
              >
                <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.8125rem' }}>
                  <input
                    type="checkbox"
                    checked={createAccount}
                    disabled={!permissions.access_manage}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    style={{ marginTop: '0.15rem', accentColor: 'var(--color-accent-magenta)' }}
                  />
                  <span>
                    Provision an application login account
                    <span style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                      {permissions.access_manage
                        ? 'A temporary password is generated and shown once. The profile itself never activates an account automatically.'
                        : 'You do not have permission to provision accounts; an administrator must do it later.'}
                    </span>
                  </span>
                </label>
              </div>

              {payload.employment.roles.length > 0 && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Roles to assign: {payload.employment.roles.join(', ')}
                </div>
              )}

              {submitIssues && submitIssues.issues.length > 0 && (
                <div
                  style={{
                    border: '1px solid var(--color-danger)',
                    background: 'var(--color-danger-bg)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ marginBottom: '0.35rem' }}>The server rejected this submission:</div>
                  <ul style={{ margin: '0 0 0 1rem', color: 'var(--text-secondary)' }}>
                    {submitIssues.issues.slice(0, 6).map((issue, i) => (
                      <li key={`${issue.field}-${i}`}>
                        <button
                          type="button"
                          className="btn-link"
                          style={{ fontSize: '0.8125rem' }}
                          onClick={() => {
                            const target = WIZARD_STEPS.find((s) => s.section === issue.section);
                            setSubmitOpen(false);
                            if (target) void setCurrentStep(target.step);
                          }}
                        >
                          {SECTION_LABELS[issue.section] ?? issue.section}
                        </button>
                        {' — '}
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {submitError && !submitIssues && (
                <div
                  style={{
                    border: '1px solid var(--color-danger)',
                    background: 'var(--color-danger-bg)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    fontSize: '0.8125rem',
                  }}
                >
                  {submitError}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSubmitOpen(false)} disabled={submitting}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SaveIndicator: React.FC<{
  status: string;
  lastSavedAt: Date | null;
  error: string | null;
  onRetry: () => void;
}> = ({ status, lastSavedAt, error, onRetry }) => {
  if (status === 'saving')
    return (
      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <Loader2 size={13} className="spin-icon" /> Saving…
      </span>
    );
  if (status === 'error')
    return (
      <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        {error ?? 'Save failed'}
        <button className="btn-link" style={{ fontSize: '0.75rem' }} onClick={onRetry}>
          Retry
        </button>
      </span>
    );
  if (status === 'dirty')
    return <span style={{ fontSize: '0.75rem', color: 'var(--color-warning)' }}>Unsaved changes</span>;
  if (status === 'saved' && lastSavedAt)
    return (
      <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Check size={13} /> Saved {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    );
  return null;
};
