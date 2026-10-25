import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employeeApi';
import { queryKeys } from '../../../core/api/queryClient';
import { useNotification } from '../../../core/context/NotificationContext';
import type { Department, CreateEmployeePayload } from '../../../types';
import { X, UserPlus, AlertCircle } from 'lucide-react';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  departments,
}) => {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  const [formData, setFormData] = useState<CreateEmployeePayload>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    designation: '',
    department_id: departments[0]?.id || 1,
    employee_code: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    office_location: 'Hyderabad',
    date_of_joining: new Date().toISOString().split('T')[0],
    status: 'Active',
    create_user_account: true,
    initial_password: 'Password@123',
    role: 'Employee',
    gender: 'Male',
    employment_type: 'FullTime',
    work_mode: 'Hybrid',
    total_experience_years: 2.0,
    skills: 'Go, React, TypeScript',
  });

  const [formError, setFormError] = useState('');

  const createMutation = useMutation({
    mutationFn: (payload: CreateEmployeePayload) => employeeApi.create(payload),
    onSuccess: (newEmp) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      success(
        'Employee Created',
        `Successfully onboarded ${newEmp.first_name} ${newEmp.last_name} (${newEmp.employee_code})`
      );
      onClose();
    },
    onError: (err: { message?: string }) => {
      const msg = err.message || 'Failed to create employee';
      setFormError(msg);
      error('Creation Error', msg);
    },
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'department_id' || name === 'total_experience_years') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.designation) {
      setFormError('Please fill in all required fields (Name, Email, Designation).');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} color="var(--color-primary-400)" />
            <h2 style={{ fontSize: '1.25rem' }}>Onboard New Employee</h2>
          </div>
          <button
            id="btn-close-add-employee-modal"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {formError && (
              <div
                className="badge-danger"
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="first_name">
                  First Name *
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  className="form-control"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="e.g. Sarah"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="last_name">
                  Last Name *
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  className="form-control"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="e.g. Jenkins"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Corporate Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="s.jenkins@organize.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone_number">
                  Phone Number
                </label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  className="form-control"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="designation">
                  Designation / Title *
                </label>
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  required
                  className="form-control"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Senior Software Architect"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="department_id">
                  Department *
                </label>
                <select
                  id="department_id"
                  name="department_id"
                  className="form-control"
                  value={formData.department_id}
                  onChange={handleChange}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="employee_code">
                  Employee Code
                </label>
                <input
                  id="employee_code"
                  name="employee_code"
                  type="text"
                  className="form-control"
                  value={formData.employee_code}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="work_mode">
                  Work Mode
                </label>
                <select
                  id="work_mode"
                  name="work_mode"
                  className="form-control"
                  value={formData.work_mode}
                  onChange={handleChange}
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="office_location">
                  Office Location
                </label>
                <input
                  id="office_location"
                  name="office_location"
                  type="text"
                  className="form-control"
                  value={formData.office_location}
                  onChange={handleChange}
                  placeholder="e.g. Hyderabad"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="skills">
                Skills & Tech Stack
              </label>
              <input
                id="skills"
                name="skills"
                type="text"
                className="form-control"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. Go, React, PostgreSQL, Docker"
              />
            </div>

            {/* Checkbox for user account */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <input
                id="create_user_account"
                name="create_user_account"
                type="checkbox"
                checked={formData.create_user_account}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent-magenta)' }}
              />
              <label
                htmlFor="create_user_account"
                style={{ fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none', fontWeight: 400 }}
              >
                <span>Provision CrystalSpace Login Account</span>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 400 }}>
                  Auto-generates user account with credentials (Password: Password@123)
                </div>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              id="btn-cancel-add-employee"
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </button>
            <button
              id="btn-submit-add-employee"
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Onboarding...' : 'Create Employee Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
