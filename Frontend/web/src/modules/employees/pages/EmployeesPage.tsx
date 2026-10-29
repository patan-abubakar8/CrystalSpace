import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employeeApi';
import { employeeDraftApi } from '../api/employeeDraftApi';
import { departmentApi } from '../../departments/api/departmentApi';
import { queryKeys } from '../../../core/api/queryClient';
import { useNotification } from '../../../core/context/NotificationContext';
import { usePermissions } from '../../../core/context/PermissionContext';
import type { DraftSubmitResult, Employee } from '../../../types';
import { EmployeeDetailDrawer } from '../components/EmployeeDetailDrawer';
import { DraftsPanel } from '../components/DraftsPanel';
import { EmployeeOnboardingWizard } from '../components/onboarding/EmployeeOnboardingWizard';
import {
  Users,
  Search,
  Plus,
  Eye,
  Trash2,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Copy,
} from 'lucide-react';

interface EmployeesPageProps {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

type View = 'directory' | 'drafts' | 'wizard';

export const EmployeesPage: React.FC<EmployeesPageProps> = ({
  isAddModalOpen,
  onCloseAddModal,
}) => {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();
  const { can } = usePermissions();

  const [view, setView] = useState<View>('directory');
  const [activeDraftId, setActiveDraftId] = useState<number | null>(null);
  const [submitResult, setSubmitResult] = useState<DraftSubmitResult | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [sort, setSort] = useState('name-asc');
  const [page, setPage] = useState(1);

  const canStartOnboarding =
    can('employees', 'create') || can('employees-drafts', 'create');
  const canViewDrafts = can('employees-drafts', 'view') || can('employees', 'create');

  const { data: departments = [] } = useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: departmentApi.list,
  });

  const { data: allEmployees = [] } = useQuery({
    queryKey: queryKeys.employees.list({ scope: 'filter-options' }),
    queryFn: () => employeeApi.list({ page_size: 100 }),
  });

  const designations = Array.from(new Set(allEmployees.map((e) => e.designation).filter(Boolean))).sort();

  const [sortBy, sortDir] = sort.split('-') as [
    'name' | 'employee_code' | 'joining_date' | 'department',
    'asc' | 'desc',
  ];

  const { data: employeePage, isLoading } = useQuery({
    queryKey: queryKeys.employees.list({
      department_id: selectedDeptId,
      search_query: searchQuery,
      status: statusFilter,
      designation: designationFilter,
      sort_by: sortBy,
      sort_dir: sortDir,
      page,
    }),
    queryFn: () =>
      employeeApi.listPaged({
        department_id: selectedDeptId,
        search_query: searchQuery || undefined,
        status: statusFilter || undefined,
        designation: designationFilter || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
        page,
        page_size: 10,
      }),
    enabled: view === 'directory',
  });

  const employees = employeePage?.items ?? [];
  const totalPages = employeePage?.total_page ?? 1;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedDeptId, statusFilter, designationFilter, sort]);

  // Starting from the dashboard button opens a fresh draft
  const startMutation = useMutation({
    mutationFn: () => employeeDraftApi.create(),
    onSuccess: (res) => {
      setActiveDraftId(res.draft.id);
      setSubmitResult(null);
      setView('wizard');
      queryClient.invalidateQueries({ queryKey: queryKeys.employeeDrafts.all });
      onCloseAddModal?.();
    },
    onError: (err: { message?: string }) =>
      error('Could not start onboarding', err.message ?? 'Please try again.'),
  });

  useEffect(() => {
    if (isAddModalOpen) {
      if (canStartOnboarding) startMutation.mutate();
      else onCloseAddModal?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddModalOpen]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      success('Employee archived', 'The employee record was removed from the directory.');
    },
    onError: (err: { message?: string }) => error('Delete error', err.message ?? 'Failed to delete employee'),
  });

  const handleDelete = (emp: Employee) => {
    if (confirm(`Remove ${emp.first_name} ${emp.last_name} from the directory? This cannot be undone.`)) {
      deleteMutation.mutate(emp.id);
    }
  };

  const handleSubmitted = (result: DraftSubmitResult) => {
    setSubmitResult(result);
    setActiveDraftId(null);
    setView('directory');
    setPage(1);
    queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.employeeDrafts.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    success('Employee created', `${result.employee_code} was created successfully.`);
  };

  if (view === 'wizard' && activeDraftId) {
    return (
      <EmployeeOnboardingWizard
        draftId={activeDraftId}
        onExit={() => {
          setActiveDraftId(null);
          setView('drafts');
          queryClient.invalidateQueries({ queryKey: queryKeys.employeeDrafts.all });
        }}
        onSubmitted={handleSubmitted}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">Workforce Directory</h1>
          <p className="section-subtitle">
            Manage organization personnel, department assignments, and employment records.
          </p>
        </div>

        {canStartOnboarding && (
          <button
            id="btn-add-employee-trigger"
            className="btn btn-primary"
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
          >
            <Plus size={16} /> {startMutation.isPending ? 'Starting…' : 'Onboard Employee'}
          </button>
        )}
      </div>

      {submitResult && (
        <div
          className="card"
          style={{
            padding: '0.9rem 1.1rem',
            borderColor: 'var(--color-success)',
            background: 'var(--color-success-bg)',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}
        >
          <CheckCircle2 size={18} color="var(--color-success)" />
          <div style={{ flex: 1, fontSize: '0.8125rem' }}>
            <div>
              Employee <strong style={{ fontWeight: 500 }}>{submitResult.employee_code}</strong> created
              {submitResult.account_provisioned ? ' with an application account.' : '.'}
            </div>
            {submitResult.temporary_password && (
              <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                Temporary password (shown once):{' '}
                <code style={{ fontFamily: 'monospace' }}>{submitResult.temporary_password}</code>{' '}
                <button
                  className="btn-link"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => navigator.clipboard?.writeText(submitResult.temporary_password!)}
                >
                  <Copy size={11} /> copy
                </button>
              </div>
            )}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setSubmitResult(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid var(--border-subtle)' }}>
        {[
          { id: 'directory' as View, label: 'Directory' },
          ...(canViewDrafts ? [{ id: 'drafts' as View, label: 'Onboarding Drafts' }] : []),
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              padding: '0.55rem 0.9rem',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${view === tab.id ? 'var(--color-accent-magenta)' : 'transparent'}`,
              color: view === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontFamily: 'inherit',
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'drafts' ? (
        <DraftsPanel
          onResume={(id) => {
            setActiveDraftId(id);
            setSubmitResult(null);
            setView('wizard');
          }}
        />
      ) : (
        <>
          {/* Filters */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              padding: '1rem 1.25rem',
            }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <input
                id="input-employee-search"
                type="text"
                className="form-control"
                placeholder="Search by name, email, or employee code…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
              />
            </div>

            <select
              className="form-control"
              style={{ width: '170px' }}
              value={selectedDeptId ?? ''}
              onChange={(e) => setSelectedDeptId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ width: '170px' }}
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
            >
              <option value="">All Designations</option>
              {designations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ width: '140px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {['Active', 'Probation', 'OnLeave', 'Suspended', 'Resigned', 'Terminated'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ width: '160px' }}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
              <option value="joining_date-desc">Newest joiners</option>
              <option value="employee_code-asc">Employee code</option>
              <option value="department-asc">Department</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
              <UserCheck size={16} />
              <span>{employeePage?.total ?? 0} members</span>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            {isLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading workforce directory…
              </div>
            ) : employees.length === 0 ? (
              <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                <Users size={40} color="var(--text-tertiary)" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '1rem' }}>No employees found</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {searchQuery || selectedDeptId || statusFilter || designationFilter
                    ? 'Try adjusting the filters or search keywords.'
                    : 'Click “Onboard Employee” to add the first team member.'}
                </p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Code</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Manager</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const manager = emp.manager_id
                      ? allEmployees.find((m) => m.id === emp.manager_id)
                      : undefined;
                    return (
                      <tr key={emp.id} id={`employee-row-${emp.id}`}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--color-primary-gradient)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '0.8125rem',
                                flexShrink: 0,
                              }}
                            >
                              {emp.first_name.charAt(0)}
                              {emp.last_name.charAt(0)}
                            </div>
                            <div>
                              <div>
                                {emp.first_name} {emp.last_name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {emp.employee_code}
                        </td>
                        <td>
                          <span className="badge badge-primary">
                            {emp.department_name || `Dept #${emp.department_id}`}
                          </span>
                        </td>
                        <td>{emp.designation}</td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {manager ? `${manager.first_name} ${manager.last_name}` : '—'}
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <span
                            className={
                              emp.status === 'Active'
                                ? 'badge badge-success'
                                : emp.status === 'Probation' || emp.status === 'OnLeave'
                                  ? 'badge badge-warning'
                                  : 'badge badge-danger'
                            }
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSelectedEmployeeId(emp.id)}
                              title="View profile"
                            >
                              <Eye size={14} /> View
                            </button>
                            {can('employees', 'delete') && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(emp)}
                                title="Archive employee"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}

          {!canStartOnboarding && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              <AlertCircle size={13} /> You have read-only access to the employee directory.
            </div>
          )}
        </>
      )}

      <EmployeeDetailDrawer
        employeeId={selectedEmployeeId}
        onClose={() => setSelectedEmployeeId(null)}
      />
    </div>
  );
};
