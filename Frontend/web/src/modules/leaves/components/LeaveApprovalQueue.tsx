import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../api/leaveApi';
import { queryKeys } from '../../../core/api/queryClient';
import { useNotification } from '../../../core/context/NotificationContext';
import type { Leave } from '../../../types';
import { CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';

interface LeaveApprovalQueueProps {
  pendingLeaves: Leave[];
  isLoading: boolean;
}

export const LeaveApprovalQueue: React.FC<LeaveApprovalQueueProps> = ({
  pendingLeaves,
  isLoading,
}) => {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'Approved' | 'Rejected' }) =>
      leaveApi.review(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.pending });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.my });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      success(
        'Leave Application Reviewed',
        `Request #${variables.id} marked as ${variables.status}.`
      );
    },
    onError: (err: { message?: string }) => {
      error('Review Error', err.message || 'Failed to update leave status');
    },
  });

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading pending approval requests...
      </div>
    );
  }

  if (pendingLeaves.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '2.5rem 1rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-surface-elevated)',
        }}
      >
        <CheckCircle2
          size={36}
          color="var(--color-success)"
          style={{ marginBottom: '0.75rem' }}
        />
        <div style={{ fontWeight: 400 }}>Zero Pending Approvals</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
          All employee absence requests in your queue have been processed.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {pendingLeaves.map((leave) => (
        <div
          key={leave.id}
          id={`pending-leave-${leave.id}`}
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1.25rem',
            borderLeft: '4px solid var(--color-warning)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                {leave.employee_name || `Employee #${leave.employee_id}`}
              </span>
              <span className="badge badge-warning">
                <Clock size={12} /> Pending Review
              </span>
              <span className="badge badge-primary">{leave.leave_type_name || 'Leave'}</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} />
                {new Date(leave.start_date).toLocaleDateString()} —{' '}
                {new Date(leave.end_date).toLocaleDateString()}
              </span>
              <span>•</span>
              <span>{leave.total_days} Day(s)</span>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
              "{leave.reason}"
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              id={`btn-approve-leave-${leave.id}`}
              className="btn btn-primary btn-sm"
              disabled={reviewMutation.isPending}
              onClick={() => reviewMutation.mutate({ id: leave.id, status: 'Approved' })}
            >
              <CheckCircle2 size={14} /> Approve
            </button>
            <button
              id={`btn-reject-leave-${leave.id}`}
              className="btn btn-danger btn-sm"
              disabled={reviewMutation.isPending}
              onClick={() => reviewMutation.mutate({ id: leave.id, status: 'Rejected' })}
            >
              <XCircle size={14} /> Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
