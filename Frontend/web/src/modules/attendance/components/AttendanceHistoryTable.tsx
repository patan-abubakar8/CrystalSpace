import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendanceApi';
import { queryKeys } from '../../../core/api/queryClient';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Clock,
  Search,
  Filter,
  Download,
  Building2,
  Laptop,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { AttendanceStatus } from '../../../types';

interface AttendanceHistoryTableProps {
  selectedEmployeeId?: number;
}

export const AttendanceHistoryTable: React.FC<AttendanceHistoryTableProps> = ({
  selectedEmployeeId,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin' || user?.role === 'HR';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.attendance.list({
      employee_id: selectedEmployeeId,
      status: statusFilter,
      from: fromDate,
      to: toDate,
      query: searchQuery,
      page: currentPage,
      page_size: pageSize,
    }),
    queryFn: () =>
      attendanceApi.list({
        employee_id: selectedEmployeeId,
        status: statusFilter,
        from: fromDate,
        to: toDate,
        query: searchQuery,
        page: currentPage,
        page_size: pageSize,
      }),
  });

  const rawList = data?.data ?? (Array.isArray(data) ? data : []);
  const records = Array.isArray(rawList) ? rawList : [];
  const meta = data?.meta || { page: 1, page_size: pageSize, total: records.length, total_page: 1 };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return <span className="badge badge-success">Present</span>;
      case 'Late':
        return <span className="badge badge-warning">Late Arrival</span>;
      case 'HalfDay':
        return <span className="badge badge-secondary">Half Day</span>;
      case 'OnLeave':
        return <span className="badge badge-secondary" style={{ color: '#F59E0B' }}>On Leave</span>;
      case 'Absent':
        return <span className="badge badge-danger">Absent</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const formatHours = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0 && mins === 0) return '0h';
    return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  // CSV Export
  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Date', 'Employee', 'Employee Code', 'Clock In', 'Clock Out', 'Hours', 'Status', 'Work Mode', 'Notes'];
    const rows = records.map((r) => [
      r.date ? r.date.split('T')[0] : '',
      `"${r.employee_name || ''}"`,
      `"${r.employee_code || ''}"`,
      r.clock_in ? new Date(r.clock_in).toLocaleTimeString() : '',
      r.clock_out ? new Date(r.clock_out).toLocaleTimeString() : '',
      (r.total_minutes / 60).toFixed(2),
      r.status,
      r.work_mode,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crystalspace_attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="card"
      id="attendance-history-table-container"
      style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Title & Action Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Attendance Audit & History</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {isAdmin
              ? 'Organization-wide daily clock-in/out timestamps and work hours'
              : 'Your personal attendance records and punch-in timeline'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={records.length === 0}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.35rem', fontSize: '0.75rem' }}
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder={isAdmin ? 'Search employee, code, or notes...' : 'Search notes...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{
              paddingLeft: '2.2rem',
              height: '34px',
              fontSize: '0.8125rem',
              width: '100%',
              backgroundColor: 'var(--bg-surface)',
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Filter size={13} style={{ color: 'var(--text-tertiary)' }} />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="input"
            style={{
              height: '34px',
              fontSize: '0.75rem',
              padding: '0 0.6rem',
              backgroundColor: 'var(--bg-surface)',
              cursor: 'pointer',
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late Arrival</option>
            <option value="HalfDay">Half Day</option>
            <option value="OnLeave">On Leave</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>From:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setCurrentPage(1);
            }}
            className="input"
            style={{
              height: '34px',
              fontSize: '0.75rem',
              padding: '0 0.5rem',
              backgroundColor: 'var(--bg-surface)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>To:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setCurrentPage(1);
            }}
            className="input"
            style={{
              height: '34px',
              fontSize: '0.75rem',
              padding: '0 0.5rem',
              backgroundColor: 'var(--bg-surface)',
            }}
          />
        </div>

        {(searchQuery || statusFilter !== 'All' || fromDate || toDate) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
              setFromDate('');
              setToDate('');
              setCurrentPage(1);
            }}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Table Data */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
          <thead>
            <tr>
              <th>Date</th>
              {isAdmin && <th>Employee</th>}
              {isAdmin && <th>Department</th>}
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Total Logged</th>
              <th>Status</th>
              <th>Work Mode</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={isAdmin ? 9 : 7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-tertiary)' }}>
                  Loading attendance records...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 9 : 7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-tertiary)' }}>
                  No attendance records found matching the filter criteria.
                </td>
              </tr>
            ) : (
              records.map((r) => {
                const dateStr = r.date
                  ? new Date(r.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A';

                const inTime = r.clock_in
                  ? new Date(r.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--';

                const outTime = r.clock_out
                  ? new Date(r.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--';

                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{dateStr}</td>

                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 500 }}>{r.employee_name || `Employee #${r.employee_id}`}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                            {r.employee_code || '--'}
                          </span>
                        </div>
                      </td>
                    )}

                    {isAdmin && (
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {r.department_name || 'General'}
                        </span>
                      </td>
                    )}

                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-primary)' }}>
                        <Clock size={12} style={{ color: 'var(--color-success)' }} />
                        {inTime}
                      </span>
                    </td>

                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                        {outTime !== '--' && <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />}
                        {outTime}
                      </span>
                    </td>

                    <td style={{ fontWeight: 600 }}>{formatHours(r.total_minutes)}</td>

                    <td>{getStatusBadge(r.status)}</td>

                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {r.work_mode === 'Remote' ? <Laptop size={12} /> : <Building2 size={12} />}
                        {r.work_mode}
                      </span>
                    </td>

                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>
                      {r.notes || '--'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {meta.total_page > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.75rem',
          }}
        >
          <span>
            Showing Page <strong>{meta.page}</strong> of <strong>{meta.total_page}</strong> ({meta.total} total records)
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={meta.page <= 1}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(meta.total_page, p + 1))}
              disabled={meta.page >= meta.total_page}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
