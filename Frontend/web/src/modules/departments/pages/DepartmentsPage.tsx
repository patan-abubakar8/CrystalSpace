import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { departmentApi } from '../api/departmentApi';
import { queryKeys } from '../../../core/api/queryClient';
import { DepartmentCard } from '../components/DepartmentCard';
import { CreateDepartmentModal } from '../components/CreateDepartmentModal';
import { usePermissions } from '../../../core/context/PermissionContext';
import { Building2, Plus, Grid, ListChecks } from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const { can } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'card' | 'list'>('card');

  const { data: departments = [], isLoading } = useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: departmentApi.list,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">Organizational Departments</h1>
          <p className="section-subtitle">
            Configure business functional units, managerial structures, and workforce divisions.
          </p>
        </div>

        {can('departments', 'create') && (
          <button
            id="btn-create-dept-trigger"
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} /> New Department
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading departments...
        </div>
      ) : departments.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <Building2 size={40} color="var(--text-tertiary)" style={{ marginBottom: '0.75rem' }} />
          <div style={{ fontWeight: 400 }}>No Departments Configured</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Click "New Department" to set up your organization structure.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              className={`btn btn-icon ${view === 'card' ? 'active' : ''}`}
              onClick={() => setView('card')}
              title="Card view"
              aria-pressed={view === 'card'}
            >
              <Grid size={18} />
            </button>
            <button
              className={`btn btn-icon ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
              title="List view"
              aria-pressed={view === 'list'}
            >
              <ListChecks size={18} />
            </button>
          </div>

          {/* Card view — 3 cards per row on desktop, 2 on tablet, 1 on mobile */}
          {view === 'card' && (
            <div className="card-grid">
              {departments.map((dept) => (
                <DepartmentCard key={dept.id} department={dept} />
              ))}
            </div>
          )}

          {/* List view */}
          {view === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {departments.map((dept) => (
                <DepartmentCard key={dept.id} department={dept} />
              ))}
            </div>
          )}
        </>
      )}

      <CreateDepartmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};