import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaveApi } from '../api/leaveApi';
import { queryKeys } from '../../../core/api/queryClient';
import { useAuth } from '../../auth/context/AuthContext';
import { ApplyLeaveModal } from '../components/ApplyLeaveModal';
import { LeaveApprovalQueue } from '../components/LeaveApprovalQueue';
import {
  CalendarCheck,
  CalendarPlus,
  FileText
} from 'lucide-react';

interface LeavesPageProps {
  isApplyModalOpen?: boolean;
  onCloseApplyModal?: () => void;
}

export const LeavesPage: React.FC<LeavesPageProps> = ({
  isApplyModalOpen: controlledApplyOpen,
  onCloseApplyModal: controlledCloseApply,
}) => {
  const { user } = useAuth();
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'my' | 'approvals'>('my');

  const isModalOpen = controlledApplyOpen ?? internalModalOpen;
  const handleCloseModal = controlledCloseApply ?? (() => setInternalModalOpen(false));

  const canApprove =
    user?.role === 'Admin' ||
    user?.role === 'HR' ||
    user?.role === 'Manager' ||
    user?.role === 'SuperAdmin';

  // TanStack Queries
  const { data: leaveTypes = [] } = useQuery({
    queryKey: queryKeys.leaves.types,
    queryFn: leaveApi.listLeaveTypes,
  });

  const { data: myLeaves = [], isLoading: isMyLeavesLoading } = useQuery({
    queryKey: queryKeys.leaves.my,
    queryFn: leaveApi.listMyLeaves,
  });

  const { data: pendingLeaves = [], isLoading: isPendingLoading } = useQuery({
    queryKey: queryKeys.leaves.pending,
    queryFn: leaveApi.listPending,
    enabled: canApprove,
    refetchInterval: 10000,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">Leave & Absence Operations</h1>
          <p className="section-subtitle">
            Submit time-off requests, monitor leave quotas, and manage managerial approval workflows.
          </p>
        </div>

        <button
          id="btn-apply-leave-trigger"
          className="btn btn-primary"
          onClick={() => setInternalModalOpen(true)}
        >
          <CalendarPlus size={16} /> Request Time Off
        </button>
      </div>

      {/* Quota Distribution Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {leaveTypes.map((type) => (
          <div
            key={type.id}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {type.name} Quota
              </div>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 500,
                  fontFamily: 'var(--font-heading)',
                  marginTop: '0.25rem',
                }}
              >
                {type.default_days}{' '}
                <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>
                  Days
                </span>
              </div>
            </div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-success)',
              }}
            >
              <CalendarCheck size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Sub Tabs for Employees vs Approvers */}
      {canApprove && (
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
          <button
            id="tab-my-leaves"
            className={`btn btn-sm ${activeSubTab === 'my' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('my')}
          >
            My Submitted Leaves ({myLeaves.length})
          </button>
          <button
            id="tab-pending-leaves"
            className={`btn btn-sm ${activeSubTab === 'approvals' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('approvals')}
          >
            Pending Approvals Queue ({pendingLeaves.length})
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      {activeSubTab === 'approvals' && canApprove ? (
        <LeaveApprovalQueue pendingLeaves={pendingLeaves} isLoading={isPendingLoading} />
      ) : (
        <div className="table-container">
          {isMyLeavesLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading leave records...
            </div>
          ) : myLeaves.length === 0 ? (
            <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
              <FileText size={40} color="var(--text-tertiary)" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 400 }}>No Leave Records Yet</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                You have not filed any leave requests for the current calendar cycle.
              </p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      <span className="badge badge-primary">
                        {leave.leave_type_name || `Type #${leave.leave_type_id}`}
                      </span>
                    </td>
                    <td>
                      <span>{leave.total_days} Day(s)</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem' }}>
                        {new Date(leave.start_date).toLocaleDateString()} —{' '}
                        {new Date(leave.end_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {leave.reason}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          leave.status === 'Approved'
                            ? 'badge badge-success'
                            : leave.status === 'Pending'
                            ? 'badge badge-warning'
                            : 'badge badge-danger'
                        }
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {new Date(leave.applied_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        leaveTypes={leaveTypes}
      />
    </div>
  );
};
