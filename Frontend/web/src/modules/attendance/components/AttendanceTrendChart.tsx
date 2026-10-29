import React, { useState } from 'react';
import type { HeatmapCell } from '../../../types';
import { BarChart3 } from 'lucide-react';

interface AttendanceTrendChartProps {
  dailyTrends: HeatmapCell[];
  isLoading?: boolean;
}

export const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({
  dailyTrends = [],
  isLoading = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const safeTrends: HeatmapCell[] = Array.isArray(dailyTrends)
    ? dailyTrends
    : (dailyTrends as { data?: HeatmapCell[] })?.data && Array.isArray((dailyTrends as { data?: HeatmapCell[] }).data)
    ? (dailyTrends as { data?: HeatmapCell[] }).data!
    : [];

  // Take the last 14 working/calendar days
  const recentDays = safeTrends.slice(-14);

  const maxHours = Math.max(10, ...recentDays.map((d) => d.total_hours));
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 35;
  const paddingY = 25;

  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const barWidth = Math.max(8, Math.min(22, (innerWidth / (recentDays.length || 1)) * 0.65));
  const slotWidth = innerWidth / (recentDays.length || 1);

  // Target 8 hours line Y coordinate
  const targetY = paddingY + innerHeight - (8.0 / maxHours) * innerHeight;

  return (
    <div
      className="card"
      id="attendance-trend-chart"
      style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent-cyan)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Daily Hours vs 8h Target</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              14-Day rolling work duration trend
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Normal / Target</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '2px', borderTop: '2px dashed var(--color-accent-magenta)' }} />
            <span style={{ color: 'var(--text-tertiary)' }}>8h Benchmark</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
          Loading trend graph...
        </div>
      ) : recentDays.length === 0 ? (
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
          No work logs recorded in the selected period.
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ width: '100%', height: 'auto', minWidth: '400px' }}
          >
            {/* Grid Lines */}
            <line
              x1={paddingX}
              y1={paddingY}
              x2={chartWidth - paddingX}
              y2={paddingY}
              stroke="var(--border-subtle)"
              strokeDasharray="2,2"
            />
            <line
              x1={paddingX}
              y1={paddingY + innerHeight / 2}
              x2={chartWidth - paddingX}
              y2={paddingY + innerHeight / 2}
              stroke="var(--border-subtle)"
              strokeDasharray="2,2"
            />
            <line
              x1={paddingX}
              y1={paddingY + innerHeight}
              x2={chartWidth - paddingX}
              y2={paddingY + innerHeight}
              stroke="var(--border-subtle)"
            />

            {/* Target 8 hours benchmark line */}
            <line
              x1={paddingX}
              y1={targetY}
              x2={chartWidth - paddingX}
              y2={targetY}
              stroke="var(--color-accent-magenta)"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.85"
            />
            <text
              x={paddingX - 6}
              y={targetY + 3}
              textAnchor="end"
              fill="var(--color-accent-magenta)"
              fontSize="9"
              fontWeight="600"
            >
              8h
            </text>

            {/* Bars for each day */}
            {recentDays.map((day, idx) => {
              const barHeight = (day.total_hours / maxHours) * innerHeight;
              const x = paddingX + idx * slotWidth + (slotWidth - barWidth) / 2;
              const y = paddingY + innerHeight - barHeight;
              const isHovered = hoveredIndex === idx;

              const isOvertime = day.total_hours > 8.0;
              const isHalfDay = day.total_hours > 0 && day.total_hours < 4.0;
              const barColor = isOvertime
                ? 'url(#grad-overtime)'
                : isHalfDay
                ? 'rgba(16, 185, 129, 0.45)'
                : day.total_hours > 0
                ? '#10B981'
                : 'transparent';

              const dateObj = new Date(day.date);
              const dayStr = dateObj.toLocaleDateString(undefined, { weekday: 'narrow' });
              const dayNum = dateObj.getDate();

              return (
                <g
                  key={day.date}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Background slot hover highlight */}
                  {isHovered && (
                    <rect
                      x={paddingX + idx * slotWidth}
                      y={paddingY}
                      width={slotWidth}
                      height={innerHeight}
                      fill="rgba(255, 255, 255, 0.04)"
                      rx="4"
                    />
                  )}

                  {/* The bar */}
                  {day.total_hours > 0 && (
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barHeight, 3)}
                      fill={barColor}
                      rx="3"
                      opacity={isHovered ? 1 : 0.9}
                      filter={isHovered ? 'brightness(1.2)' : 'none'}
                    />
                  )}

                  {/* Day label */}
                  <text
                    x={x + barWidth / 2}
                    y={paddingY + innerHeight + 14}
                    textAnchor="middle"
                    fill={isHovered ? 'var(--text-primary)' : 'var(--text-tertiary)'}
                    fontSize="9"
                    fontWeight={isHovered ? '600' : '400'}
                  >
                    {dayStr} {dayNum}
                  </text>
                </g>
              );
            })}

            {/* Gradients */}
            <defs>
              <linearGradient id="grad-overtime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Interactive Tooltip Callout */}
          {hoveredIndex !== null && recentDays[hoveredIndex] && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem 0.65rem',
                fontSize: '0.75rem',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <strong>
                {new Date(recentDays[hoveredIndex].date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
                :
              </strong>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                {recentDays[hoveredIndex].total_hours} hrs
              </span>
              <span style={{ color: 'var(--text-tertiary)' }}>
                ({recentDays[hoveredIndex].status})
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
