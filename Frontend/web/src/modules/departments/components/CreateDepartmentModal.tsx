import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi, type CreateDepartmentPayload } from '../api/departmentApi';
import { queryKeys } from '../../../core/api/queryClient';
import { useNotification } from '../../../core/context/NotificationContext';
import { X, Building2, AlertCircle } from 'lucide-react';

interface CreateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDepartmentModal: React.FC<CreateDepartmentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const createMutation = useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => departmentApi.create(payload),
    onSuccess: (newDept) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      success('Department Created', `Added ${newDept.name} (${newDept.code}) to organization`);
      setName('');
      setCode('');
      setDescription('');
      onClose();
    },
    onError: (err: { message?: string }) => {
      const msg = err.message || 'Failed to create department';
      setFormError(msg);
      error('Creation Error', msg);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name || !code) {
      setFormError('Department name and code are required.');
      return;
    }
    createMutation.mutate({
      name,
      code: code.toUpperCase().trim(),
      description,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={20} color="var(--color-primary-400)" />
            <h2 style={{ fontSize: '1.25rem' }}>Create Department</h2>
          </div>
          <button
            id="btn-close-dept-modal"
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

            <div className="form-group">
              <label className="form-label" htmlFor="dept-name">
                Department Name *
              </label>
              <input
                id="dept-name"
                type="text"
                required
                className="form-control"
                placeholder="e.g. Product Design"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dept-code">
                Unique Department Code *
              </label>
              <input
                id="dept-code"
                type="text"
                required
                className="form-control"
                placeholder="e.g. PRD"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={10}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dept-description">
                Description / Purpose
              </label>
              <textarea
                id="dept-description"
                className="form-control"
                rows={3}
                placeholder="Brief summary of department operations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              id="btn-cancel-create-dept"
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </button>
            <button
              id="btn-submit-create-dept"
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Saving...' : 'Add Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
