import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { departmentApi } from '../api/departmentApi';
import { queryKeys } from '../../../core/api/queryClient';
import { DepartmentCard } from '../components/DepartmentCard';
import { CreateDepartmentModal } from '../components/CreateDepartmentModal';
import { useAuth } from '../../auth/context/AuthContext';
import { Building2, Plus } from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: departments = [], isLoading } = useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: departmentApi.list,
  });

  const canManage =
    user?.role === 'Admin' || user?.role === 'HR' || user?.role === 'SuperAdmin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">Organizational Departments</h1>
          <p className="section-subtitle">
            Configure business functional units, managerial structures, and workforce divisions.
          </p>
        </div>

        {canManage && (
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
          <div style={{ fontWeight: 600 }}>No Departments Configured</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Click "New Department" to set up your organization structure.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {departments.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </div>
      )}

      <CreateDepartmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
