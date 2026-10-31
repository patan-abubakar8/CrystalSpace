import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../api/leaveApi';
import { queryKeys } from '../../../core/api/queryClient';
import { useNotification } from '../../../core/context/NotificationContext';
import type { LeaveType, ApplyLeavePayload } from '../../../types';
import { X, CalendarPlus, AlertCircle } from 'lucide-react';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveTypes: LeaveType[];
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  leaveTypes,
}) => {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  const today = new Date().toISOString().split('T')[0];
  const [leaveTypeId, setLeaveTypeId] = useState<number>(leaveTypes[0]?.id || 1);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  // Calculate day difference
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const calculatedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const applyMutation = useMutation({
    mutationFn: (payload: ApplyLeavePayload) => leaveApi.apply(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.my });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.pending });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      success('Leave Application Submitted', `Applied for ${calculatedDays} day(s) leave.`);
      setReason('');
      onClose();
    },
    onError: (err: { message?: string }) => {
      const msg = err.message || 'Failed to submit leave application';
      setFormError(msg);
      error('Submission Failed', msg);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!reason.trim()) {
      setFormError('Please provide a reason for the leave.');
      return;
    }
    applyMutation.mutate({
      leave_type_id: Number(leaveTypeId),
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      total_days: calculatedDays,
      reason: reason.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <CalendarPlus size={20} color="var(--color-accent)" />
            <h2 style={{ fontSize: '1.25rem' }}>Apply for Leave</h2>
          </div>
          <button
            id="btn-close-leave-modal"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {formError && (
              <div
                className="badge-danger"
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="leave-type-select">
                Leave Category *
              </label>
              <select
                id="leave-type-select"
                className="form-control"
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(Number(e.target.value))}
              >
                {leaveTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Quota: {t.default_days} days)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="start-date">
                  Start Date *
                </label>
                <input
                  id="start-date"
                  type="date"
                  required
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="end-date">
                  End Date *
                </label>
                <input
                  id="end-date"
                  type="date"
                  required
                  min={startDate}
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8125rem',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Calculated Duration:</span>
              <span className="badge badge-primary">{calculatedDays} Day(s)</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="leave-reason">
                Reason / Note *
              </label>
              <textarea
                id="leave-reason"
                required
                className="form-control"
                rows={3}
                placeholder="Please state the reason for this absence..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              id="btn-cancel-apply-leave"
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={applyMutation.isPending}
            >
              Cancel
            </button>
            <button
              id="btn-submit-apply-leave"
              type="submit"
              className="btn btn-primary"
              disabled={applyMutation.isPending}
            >
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
