import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendanceApi';
import { employeeApi } from '../../employees/api/employeeApi';
import { queryKeys } from '../../../core/api/queryClient';
import { useAuth } from '../../auth/context/AuthContext';
import { Flame, User } from 'lucide-react';
import type { HeatmapCell, Employee } from '../../../types';

interface MonthlyHeatmapProps {
  selectedEmployeeId?: number;
  onSelectEmployee?: (id: number | undefined) => void;
  showAdminControls?: boolean;
  compact?: boolean;
  initialMonths?: number;
}

export const MonthlyHeatmap: React.FC<MonthlyHeatmapProps> = ({
  selectedEmployeeId: externalEmpId,
  onSelectEmployee: externalSetEmpId,
  showAdminControls = true,
  compact = false,
  initialMonths,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin' || user?.role === 'HR';

  const [internalEmpId, setInternalEmpId] = useState<number | undefined>(undefined);
  const activeEmpId = externalEmpId !== undefined ? externalEmpId : internalEmpId;
  const setEmpId = externalSetEmpId || setInternalEmpId;

  const [monthsRange, setMonthsRange] = useState<number>(initialMonths ?? (compact ? 1 : 3)); // 1 = current month, 3 = quarterly, 6 = half year
  const [hoveredCell, setHoveredCell] = useState<{
    cell: HeatmapCell;
    x: number;
    y: number;
  } | null>(null);

  // Fetch employees list for Admin dropdown
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: queryKeys.employees.list(),
    queryFn: () => employeeApi.list(),
    enabled: isAdmin && showAdminControls,
  });

  // Fetch heatmap data
  const { data: cells = [], isLoading } = useQuery({
    queryKey: queryKeys.attendance.heatmap(activeEmpId, monthsRange),
    queryFn: () => attendanceApi.getHeatmap(activeEmpId, monthsRange),
  });

  // Fetch summary for stats
  const { data: summary } = useQuery({
    queryKey: queryKeys.attendance.summary(activeEmpId, monthsRange * 30),
    queryFn: () => attendanceApi.getSummary(activeEmpId, monthsRange * 30),
  });

  // Safe array normalization
  const cellList: HeatmapCell[] = Array.isArray(cells)
    ? cells
    : (cells as { data?: HeatmapCell[] })?.data && Array.isArray((cells as { data?: HeatmapCell[] }).data)
    ? (cells as { data?: HeatmapCell[] }).data!
    : [];

  const employeeList: Employee[] = Array.isArray(employees)
    ? employees
    : (employees as { data?: Employee[] })?.data && Array.isArray((employees as { data?: Employee[] }).data)
    ? (employees as { data?: Employee[] }).data!
    : [];

  // Group cells into columns (weeks) of 7 days (Mon -> Sun)
  const weeks: HeatmapCell[][] = [];
  let currentWeek: HeatmapCell[] = [];

  cellList.forEach((cell, idx) => {
    currentWeek.push(cell);
    if (currentWeek.length === 7 || idx === cellList.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Intensity color resolver matching CrystalSpace theme
  const getCellBackground = (cell: HeatmapCell) => {
    if (cell.status === 'OnLeave') {
      return '#F59E0B'; // Amber warm indicator
    }
    switch (cell.level) {
      case 4:
        return 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)'; // Overtime glowing
      case 3:
        return '#10B981'; // 8h Full Day target
      case 2:
        return 'rgba(16, 185, 129, 0.55)'; // 4h - 7.5h
      case 1:
        return 'rgba(16, 185, 129, 0.25)'; // <4h / HalfDay
      case 0:
      default:
        return cell.status === 'Weekend'
          ? 'var(--bg-surface-elevated)'
          : 'rgba(255, 255, 255, 0.03)';
    }
  };

  const getCellBorder = (cell: HeatmapCell) => {
    if (cell.level > 0 || cell.status === 'OnLeave') {
      return '1px solid rgba(255, 255, 255, 0.15)';
    }
    return '1px solid var(--border-subtle)';
  };

  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  return (
    <div
      className="card"
      id="attendance-monthly-heatmap"
      style={{
        padding: compact ? '1.25rem 1.4rem' : '1.5rem',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? '0.85rem' : '1.25rem',
        position: 'relative',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Top Header: Title, Controls, Employee Dropdown */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <Flame size={15} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h2 style={{ fontSize: compact ? '0.9375rem' : '1rem', fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>
                {compact ? 'Attendance Heatmap' : 'Activity & Attendance Pulse'}
              </h2>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 400,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10B981',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                {compact ? '30 Days' : 'GitHub Matrix'}
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', margin: '0.1rem 0 0 0' }}>
              {compact ? '1-Month personal presence intensity' : 'Workforce presence & logged hours intensity calendar'}
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Admin Employee Selector (hidden in compact employee mode) */}
          {isAdmin && showAdminControls && !compact && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={13} style={{ color: 'var(--text-tertiary)' }} />
              <select
                id="select-heatmap-employee"
                value={activeEmpId ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmpId(val ? Number(val) : undefined);
                }}
                className="input"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.6rem',
                  height: '30px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  maxWidth: '180px',
                }}
              >
                <option value="">👤 My Attendance</option>
                {employeeList.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_code || emp.designation})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Range Toggle: 1 Month vs 3 Months vs 6 Months */}
          {!compact && (
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-surface-elevated)',
                padding: '0.2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {[
                { label: '1M', value: 1 },
                { label: '3M', value: 3 },
                { label: '6M', value: 6 },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setMonthsRange(tab.value)}
                  style={{
                    background: monthsRange === tab.value ? 'var(--bg-surface)' : 'transparent',
                    border: 'none',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.72rem',
                    fontWeight: 400,
                    color: monthsRange === tab.value ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Summary Chips */}
      {summary && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: compact ? '0.65rem' : '1rem',
            flexWrap: 'wrap',
            padding: compact ? '0.45rem 0.75rem' : '0.625rem 1rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.72rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-tertiary)' }}>Attendance: </span>
            <span style={{ color: 'var(--color-success)', fontWeight: 400 }}>{summary.attendance_rate ?? 0}%</span>
          </div>
          <span style={{ color: 'var(--border-subtle)' }}>•</span>
          <div>
            <span style={{ color: 'var(--text-tertiary)' }}>Avg Daily: </span>
            <span style={{ fontWeight: 400, color: 'var(--text-primary)' }}>{summary.avg_daily_hours ?? 0}h</span>
          </div>
          <span style={{ color: 'var(--border-subtle)' }}>•</span>
          <div>
            <span style={{ color: 'var(--text-tertiary)' }}>On-Time: </span>
            <span style={{ fontWeight: 400, color: 'var(--text-primary)' }}>{summary.on_time_arrival_rate ?? 0}%</span>
          </div>
          <span style={{ color: 'var(--border-subtle)' }}>•</span>
          <div>
            <span style={{ color: 'var(--text-tertiary)' }}>Logged: </span>
            <span style={{ fontWeight: 400, color: 'var(--text-primary)' }}>{summary.total_hours ?? 0}h</span>
          </div>
          {(summary.total_overtime_hours ?? 0) > 0 && (
            <>
              <span style={{ color: 'var(--border-subtle)' }}>•</span>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Overtime: </span>
                <span style={{ color: 'var(--color-accent-cyan)', fontWeight: 400 }}>
                  +{summary.total_overtime_hours ?? 0}h
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Heatmap Grid Visual */}
      <div
        style={{
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {isLoading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
            Rendering contribution matrix...
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', minWidth: 'max-content' }}>
            {/* Days of week labels column */}
            <div
              style={{
                display: 'grid',
                gridTemplateRows: 'repeat(7, 14px)',
                rowGap: '4px',
                fontSize: '0.65rem',
                color: 'var(--text-tertiary)',
                alignItems: 'center',
                userSelect: 'none',
              }}
            >
              {dayLabels.map((lbl, idx) => (
                <span key={idx} style={{ height: '14px', lineHeight: '14px' }}>
                  {lbl}
                </span>
              ))}
            </div>

            {/* Weeks Columns */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {weeks.map((week, wIdx) => (
                <div
                  key={wIdx}
                  style={{
                    display: 'grid',
                    gridTemplateRows: 'repeat(7, 14px)',
                    rowGap: '4px',
                  }}
                >
                  {week.map((cell, dIdx) => (
                    <div
                      key={dIdx}
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '3px',
                        background: getCellBackground(cell),
                        border: getCellBorder(cell),
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, filter 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          cell,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                        e.currentTarget.style.transform = 'scale(1.35)';
                        e.currentTarget.style.zIndex = '10';
                      }}
                      onMouseLeave={(e) => {
                        setHoveredCell(null);
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.zIndex = '1';
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Tooltip */}
      {hoveredCell && (
        <div
          style={{
            position: 'fixed',
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y - 10}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 9999,
            backgroundColor: 'var(--bg-surface-elevated, #1A1A24)',
            border: '1px solid var(--border-default, rgba(255, 255, 255, 0.15))',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '0.625rem 0.85rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            fontSize: '0.75rem',
            minWidth: '170px',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ fontWeight: 400, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {new Date(hoveredCell.cell.date).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span>Status:</span>
              <span
                style={{
                  fontWeight: 400,
                  color:
                    hoveredCell.cell.status === 'Present'
                      ? 'var(--color-success)'
                      : hoveredCell.cell.status === 'Late'
                      ? 'var(--color-warning)'
                      : hoveredCell.cell.status === 'OnLeave'
                      ? '#F59E0B'
                      : 'var(--text-tertiary)',
                }}
              >
                {hoveredCell.cell.status}
              </span>
            </div>

            {hoveredCell.cell.total_hours > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span>Duration:</span>
                <span style={{ fontWeight: 400, color: 'var(--text-primary)' }}>{hoveredCell.cell.total_hours} hrs</span>
              </div>
            )}

            {hoveredCell.cell.clock_in && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span>In / Out:</span>
                <span>
                  {hoveredCell.cell.clock_in}
                  {hoveredCell.cell.clock_out ? ` - ${hoveredCell.cell.clock_out}` : ' (active)'}
                </span>
              </div>
            )}

            {hoveredCell.cell.work_mode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span>Mode:</span>
                <span>{hoveredCell.cell.work_mode}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.7rem',
          color: 'var(--text-tertiary)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Intensity:</span>
          <span>Less</span>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            <div style={{ width: '11px', height: '11px', borderRadius: '2px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.25)' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.55)' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '2px', background: '#10B981' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '2px', background: 'linear-gradient(135deg, #10B981, #06B6D4)' }} />
          </div>
          <span>More</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#F59E0B', display: 'inline-block' }} />
            On Leave
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10B981', display: 'inline-block' }} />
            Full Day (8h)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'linear-gradient(135deg, #10B981, #06B6D4)', display: 'inline-block' }} />
            Overtime
          </span>
        </div>
      </div>
    </div>
  );
};
