import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeeDraftApi } from '../api/employeeDraftApi';
import { queryKeys } from '../../../core/api/queryClient';
import { useNotification } from '../../../core/context/NotificationContext';
import { usePermissions } from '../../../core/context/PermissionContext';
import { useAuth } from '../../auth/context/AuthContext';
import type { EmployeeDraftSummary } from '../../../types';
import { FileEdit, Play, Search, Trash2, AlertCircle } from 'lucide-react';
import { WIZARD_STEPS } from './onboarding/wizardConfig';

interface Props {
  onResume: (id: number) => void;
}

const stepTitle = (currentStep: number) =>
  WIZARD_STEPS[Math.min(Math.max(currentStep, 1), 7) - 1]?.title ?? 'Personal Details';

const statusBadge = (status: string) => {
  switch (status) {
    case 'ReadyForReview':
      return <span className="badge badge-info">Ready for review</span>;
    case 'PendingApproval':
      return <span className="badge badge-warning">Pending approval</span>;
    case 'Converted':
      return <span className="badge badge-success">Submitted</span>;
    default:
      return <span className="badge badge-primary">Draft</span>;
  }
};

export const DraftsPanel: React.FC<Props> = ({ onResume }) => {
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotification();
  const { can } = usePermissions();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.employeeDrafts.list({ search, page }),
    queryFn: () => employeeDraftApi.list({ search: search || undefined, page, page_size: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeDraftApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeDrafts.all });
      success('Draft discarded', 'The onboarding draft was deleted. No employee record was affected.');
    },
    onError: (err: { message?: string }) => notifyError('Could not discard draft', err.message ?? ''),
  });

  const handleDelete = (draft: EmployeeDraftSummary) => {
    if (
      confirm(
        `Discard draft ${draft.draft_ref}? Any entered onboarding information will be permanently removed.`
      )
    ) {
      deleteMutation.mutate(draft.id);
    }
  };

  const canDelete = (draft: EmployeeDraftSummary) =>
    can('employees-drafts', 'delete') || (draft.owner_user_id === user?.id && can('employees', 'create'));

  if (isLoading) {
    return <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading drafts…</div>;
  }

  if (isError) {
    return (
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <AlertCircle size={26} color="var(--color-danger)" />
        <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
          {(error as Error)?.message ?? 'Could not load drafts.'}
        </p>
      </div>
    );
  }

  const drafts = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageSize = data?.page_size ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            className="form-control"
            placeholder="Search drafts by name, code, or owner…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        </div>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{total} draft(s)</span>
      </div>

      {drafts.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <FileEdit size={34} color="var(--text-tertiary)" />
          <div style={{ marginTop: '0.5rem', fontSize: '0.9375rem' }}>No onboarding drafts</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {search
              ? 'No drafts match this search.'
              : 'Start an onboarding wizard and use “Save draft” to keep your progress here.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Draft</th>
                <th>Employee ID</th>
                <th>Current step</th>
                <th>Progress</th>
                <th>Owner</th>
                <th>Last saved</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((draft) => {
                const completed = draft.completed_sections?.length ?? 0;
                return (
                  <tr key={draft.id}>
                    <td>
                      <div>{draft.display_name || 'Untitled draft'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                        {draft.draft_ref}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                      {draft.employee_code || '—'}
                    </td>
                    <td>{stepTitle(draft.current_step)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '120px' }}>
                        <div style={{ flex: 1, height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.round((completed / 6) * 100)}%`,
                              height: '100%',
                              background: 'var(--color-primary-gradient)',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{completed}/6</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>{draft.owner_email}</div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {new Date(draft.last_saved_at).toLocaleString()}
                    </td>
                    <td>{statusBadge(draft.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => onResume(draft.id)}>
                          <Play size={13} /> Resume
                        </button>
                        {canDelete(draft) && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(draft)}
                            title="Discard draft"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
            Page {page} of {totalPages}
          </span>
          <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};
