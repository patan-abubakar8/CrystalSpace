import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  span?: 1 | 2 | 3;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  span = 1,
}) => (
  <div
    className="form-group"
    style={{ marginBottom: 0, gridColumn: `span ${span}`, minWidth: 0 }}
  >
    <label className="form-label" htmlFor={htmlFor}>
      {label}
      {required && <span style={{ color: 'var(--color-danger)' }}> *</span>}
    </label>
    {children}
    {error ? (
      <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }} role="alert">
        {error}
      </span>
    ) : hint ? (
      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{hint}</span>
    ) : null}
  </div>
);

interface GridProps {
  children: React.ReactNode;
  columns?: number;
}

export const FieldGrid: React.FC<GridProps> = ({ children, columns = 2 }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap: 'var(--space-4)',
      marginBottom: '1rem',
    }}
  >
    {children}
  </div>
);

interface SectionHeadingProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const StepHeading: React.FC<SectionHeadingProps> = ({ title, description, children }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      marginBottom: '1.25rem',
      flexWrap: 'wrap',
    }}
  >
    <div>
      <h2 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{title}</h2>
      {description && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{description}</p>
      )}
    </div>
    {children}
  </div>
);

export const GroupLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontSize: '0.6875rem',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--text-tertiary)',
      marginBottom: '0.65rem',
      marginTop: '0.25rem',
    }}
  >
    {children}
  </div>
);
