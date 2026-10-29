import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '../api/employeeApi';
import { attendanceApi } from '../../attendance/api/attendanceApi';
import { leaveApi } from '../../leaves/api/leaveApi';
import { queryKeys } from '../../../core/api/queryClient';
import { usePermissions } from '../../../core/context/PermissionContext';
import { X, Mail, Phone, MapPin, Loader2 } from 'lucide-react';

interface EmployeeDetailDrawerProps {
  employeeId: number | null;
  onClose: () => void;
}

type TabId =
  | 'overview'
  | 'personal'
  | 'employment'
  | 'compensation'
  | 'attendance'
  | 'leaves'
  | 'documents'
  | 'devices'
  | 'access'
  | 'history';

const money = (v: number) => v.toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const EmployeeDetailDrawer: React.FC<EmployeeDetailDrawerProps> = ({
  employeeId,
  onClose,
}) => {
  const { can } = usePermissions();
  const [tab, setTab] = useState<TabId>('overview');

  const { data: employee, isLoading } = useQuery({
    queryKey: queryKeys.employees.detail(employeeId ?? 0),
    queryFn: () => employeeApi.getByID(employeeId as number),
    enabled: !!employeeId,
  });

  const { data: extras } = useQuery({
    queryKey: [...queryKeys.employees.detail(employeeId ?? 0), 'extras'],
    queryFn: () => employeeApi.extras(employeeId as number),
    enabled: !!employeeId,
  });

  const canViewCompensation = can('salaries', 'view') && can('employees-compensation', 'view');
  const canViewAttendance = can('attendance', 'view');
  const canViewLeaves = can('leaves', 'view');

  const { data: salary } = useQuery({
    queryKey: [...queryKeys.employees.detail(employeeId ?? 0), 'salary'],
    queryFn: () => employeeApi.salary(employeeId as number),
    enabled: !!employeeId && tab === 'compensation' && canViewCompensation,
    retry: false,
  });

  const { data: attendance } = useQuery({
    queryKey: [...queryKeys.employees.detail(employeeId ?? 0), 'attendance'],
    queryFn: () => attendanceApi.list({ employee_id: employeeId as number, page_size: 8 }),
    enabled: !!employeeId && tab === 'attendance' && canViewAttendance,
  });

  const { data: balances } = useQuery({
    queryKey: [...queryKeys.employees.detail(employeeId ?? 0), 'balances'],
    queryFn: () => leaveApi.getBalances(employeeId as number),
    enabled: !!employeeId && tab === 'leaves' && canViewLeaves,
  });

  const tabs = useMemo(() => {
    const list: { id: TabId; label: string }[] = [
      { id: 'overview', label: 'Overview' },
      { id: 'personal', label: 'Personal Details' },
      { id: 'employment', label: 'Employment' },
    ];
    if (canViewCompensation) list.push({ id: 'compensation', label: 'Compensation' });
    if (canViewAttendance) list.push({ id: 'attendance', label: 'Attendance' });
    if (canViewLeaves) list.push({ id: 'leaves', label: 'Leaves' });
    if (extras?.documents) list.push({ id: 'documents', label: 'Documents' });
    if (extras?.assets) list.push({ id: 'devices', label: 'Devices & Assets' });
    if (extras?.access) list.push({ id: 'access', label: 'Account & Access' });
    if (extras?.history) list.push({ id: 'history', label: 'Audit History' });
    return list;
  }, [canViewCompensation, canViewAttendance, canViewLeaves, extras]);

  if (!employeeId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px' }}
        role="dialog"
        aria-label="Employee profile"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '1rem',
              }}
            >
              {employee ? `${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}` : '··'}
            </div>
            <div>
              <div style={{ fontSize: '1.0625rem' }}>
                {employee ? `${employee.first_name} ${employee.last_name}` : 'Loading…'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {employee ? `${employee.employee_code} • ${employee.designation}` : ''}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close profile">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.25rem',
            padding: '0 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            overflowX: 'auto',
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '0.6rem 0.7rem',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${tab === t.id ? 'var(--color-accent-magenta)' : 'transparent'}`,
                color: tab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: 'inherit',
                fontSize: '0.8125rem',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="modal-body" style={{ minHeight: '220px' }}>
          {isLoading || !employee ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
              <Loader2 size={20} className="spin-icon" />
            </div>
          ) : (
            <>
              {tab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span
                      className={
                        employee.status === 'Active'
                          ? 'badge badge-success'
                          : employee.status === 'Probation' || employee.status === 'OnLeave'
                            ? 'badge badge-warning'
                            : 'badge badge-danger'
                      }
                    >
                      {employee.status}
                    </span>
                    <span className="badge badge-primary">
                      {employee.department_name || `Dept #${employee.department_id}`}
                    </span>
                    {employee.professional_detail?.work_mode && (
                      <span className="badge badge-info">{employee.professional_detail.work_mode}</span>
                    )}
                    {employee.professional_detail?.employment_type && (
                      <span className="badge">{employee.professional_detail.employment_type}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={15} color="var(--text-tertiary)" /> {employee.email}
                    </span>
                    {employee.phone_number && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={15} color="var(--text-tertiary)" /> {employee.phone_number}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={15} color="var(--text-tertiary)" />
                      {employee.work_location || employee.office_location || 'Not specified'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem' }}>
                    <Info label="Joining date" value={new Date(employee.date_of_joining).toLocaleDateString()} />
                    <Info label="Experience" value={employee.professional_detail?.total_experience_years ? `${employee.professional_detail.total_experience_years} years` : 'Not documented'} />
                    <Info label="Manager" value={employee.manager_id ? `Employee #${employee.manager_id}` : '—'} />
                  </div>
                  {employee.professional_detail?.skills && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {employee.professional_detail.skills.split(',').map((skill, idx) => (
                        <span key={idx} className="badge">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'personal' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                  <Info label="Full name" value={[employee.first_name, employee.middle_name, employee.last_name].filter(Boolean).join(' ')} />
                  <Info label="Personal email" value={employee.personal_email || '—'} />
                  <Info label="Phone" value={employee.phone_number || '—'} />
                  <Info label="Alternate phone" value={employee.alternate_phone || '—'} />
                  <Info label="Date of birth" value={employee.personal_detail?.date_of_birth ? new Date(employee.personal_detail.date_of_birth).toLocaleDateString() : '—'} />
                  <Info label="Current address" value={employee.personal_detail?.address || '—'} />
                  <Info
                    label="Permanent address"
                    value={(employee.personal_detail as { permanent_address?: string } | undefined)?.permanent_address || '—'}
                  />
                  <Info
                    label="Emergency contact"
                    value={
                      employee.emergency_contact
                        ? `${employee.emergency_contact.contact_name} (${employee.emergency_contact.relationship}) · ${employee.emergency_contact.phone}`
                        : '—'
                    }
                  />
                </div>
              )}

              {tab === 'employment' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                  <Info label="Employee ID" value={employee.employee_code} />
                  <Info label="Designation" value={employee.designation} />
                  <Info label="Job title" value={employee.job_title || employee.designation} />
                  <Info label="Department" value={employee.department_name || `Dept #${employee.department_id}`} />
                  <Info label="Employment type" value={employee.professional_detail?.employment_type || '—'} />
                  <Info label="Work mode" value={employee.professional_detail?.work_mode || '—'} />
                  <Info label="Work location" value={employee.work_location || employee.office_location || '—'} />
                  <Info label="Status" value={employee.status} />
                </div>
              )}

              {tab === 'compensation' && (
                salary ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                    <Info label="Basic salary" value={money(salary.basic_salary)} />
                    <Info label="HRA" value={money(salary.hra)} />
                    <Info label="Conveyance" value={money(salary.conveyance)} />
                    <Info label="Medical allowance" value={money(salary.medical_allowance)} />
                    <Info label="Special allowance" value={money(salary.special_allowance)} />
                    <Info label="Gross" value={money(salary.gross_salary)} />
                    <Info label="PF / PT / TDS" value={`${money(salary.provident_fund)} / ${money(salary.professional_tax)} / ${money(salary.tds)}`} />
                    <Info label="Net" value={money(salary.net_salary)} />
                    <Info label="Effective from" value={new Date(salary.effective_date).toLocaleDateString()} />
                  </div>
                ) : (
                  <Empty>No compensation record found for this employee.</Empty>
                )
              )}

              {tab === 'attendance' && (
                attendance?.data?.length ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Clock in</th>
                          <th>Clock out</th>
                          <th>Hours</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.data.map((rec) => (
                          <tr key={rec.id}>
                            <td>{new Date(rec.date).toLocaleDateString()}</td>
                            <td>{rec.clock_in ? new Date(rec.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                            <td>{rec.clock_out ? new Date(rec.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                            <td>{(rec.total_minutes / 60).toFixed(2)}</td>
                            <td>
                              <span className={`badge ${rec.status === 'Present' ? 'badge-success' : rec.status === 'Absent' ? 'badge-danger' : 'badge-warning'}`}>
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty>No attendance records available.</Empty>
                )
              )}

              {tab === 'leaves' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {extras?.leave_allocations?.length ? (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Leave type</th>
                            <th>Policy</th>
                            <th>Allocated</th>
                            <th>Used</th>
                            <th>Effective from</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extras.leave_allocations.map((a) => (
                            <tr key={a.id}>
                              <td>{a.leave_type_name}</td>
                              <td>{a.policy_name || '—'}</td>
                              <td>{a.allocated_days}</td>
                              <td>{a.used_days}</td>
                              <td>{new Date(a.effective_from).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Empty>No leave allocations recorded for this employee.</Empty>
                  )}
                  {balances?.length ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                      {balances.map((b) => (
                        <Info
                          key={b.leave_type_id}
                          label={b.type_name}
                          value={`${b.balance_days} of ${b.total_days} days left`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              {tab === 'documents' && (
                extras?.documents?.length ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>File</th>
                          <th>Status</th>
                          <th>Verified by</th>
                          <th>Expiry</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extras.documents.map((d) => (
                          <tr key={d.id}>
                            <td>{d.document_type_name || d.document_type}</td>
                            <td>{d.file_name}</td>
                            <td>
                              <span className={`badge ${d.verification_status === 'Verified' ? 'badge-success' : d.verification_status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                {d.verification_status}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                              {d.verified_by || '—'}
                            </td>
                            <td>{d.expiry_date ? new Date(d.expiry_date).toLocaleDateString() : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty>No documents on file.</Empty>
                )
              )}

              {tab === 'devices' && (
                extras?.assets?.length ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Asset</th>
                          <th>Category</th>
                          <th>Serial</th>
                          <th>Assigned</th>
                          <th>Returned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extras.assets.map((a) => (
                          <tr key={a.id}>
                            <td style={{ fontFamily: 'monospace' }}>{a.asset_tag}</td>
                            <td>{[a.category, a.manufacturer, a.model].filter(Boolean).join(' · ')}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{a.serial_number || '—'}</td>
                            <td>{new Date(a.assigned_at).toLocaleDateString()}</td>
                            <td>
                              {a.returned_at ? (
                                new Date(a.returned_at).toLocaleDateString()
                              ) : (
                                <span className="badge badge-success">In use</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty>No assets assigned.</Empty>
                )
              )}

              {tab === 'access' && extras?.access && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                  <Info label="Work email" value={extras.access.work_email} />
                  <Info label="Application role" value={extras.access.role || '—'} />
                  <Info label="Account active" value={extras.access.is_active ? 'Yes' : 'No'} />
                  <Info label="Provisioning" value={extras.access.provisioning_status} />
                  <Info
                    label="Created"
                    value={
                      extras.access.account_created_at
                        ? new Date(extras.access.account_created_at).toLocaleString()
                        : '—'
                    }
                  />
                </div>
              )}

              {tab === 'history' && (
                extras?.history?.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {extras.history.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.7rem 0.85rem',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                          <span>{log.summary}</span>
                          <span style={{ color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                          {log.action} · {log.actor_email} ({log.actor_role})
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty>No audit history recorded for this employee.</Empty>
                )
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>
      {label}
    </div>
    <div style={{ marginTop: '0.15rem' }}>{value}</div>
  </div>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', padding: '2rem 1rem' }}>
    {children}
  </div>
);
