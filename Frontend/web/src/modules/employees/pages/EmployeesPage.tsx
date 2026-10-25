import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employeeApi';
import { departmentApi } from '../../departments/api/departmentApi';
import { queryKeys } from '../../../core/api/queryClient';
import { useAuth } from '../../auth/context/AuthContext';
import { useNotification } from '../../../core/context/NotificationContext';
import type { Employee } from '../../../types';
import { AddEmployeeModal } from '../components/AddEmployeeModal';
import { EmployeeDetailDrawer } from '../components/EmployeeDetailDrawer';
import {
  Users,
  Search,
  Plus,
  Eye,
  Trash2,
  UserCheck
} from 'lucide-react';

interface EmployeesPageProps {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({
  isAddModalOpen: controlledAddModalOpen,
  onCloseAddModal: controlledCloseAddModal,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { success, error } = useNotification();

  const [internalAddModalOpen, setInternalAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>(undefined);

  const isModalOpen = controlledAddModalOpen ?? internalAddModalOpen;
  const handleCloseModal = controlledCloseAddModal ?? (() => setInternalAddModalOpen(false));

  // TanStack Queries
  const { data: departments = [] } = useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: departmentApi.list,
  });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: queryKeys.employees.list({
      department_id: selectedDeptId,
      search_query: searchQuery,
    }),
    queryFn: () =>
      employeeApi.list({
        department_id: selectedDeptId,
        search_query: searchQuery || undefined,
      }),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      success('Employee Removed', 'Employee record was successfully archived.');
    },
    onError: (err: { message?: string }) => {
      error('Delete Error', err.message || 'Failed to delete employee');
    },
  });

  const handleDelete = (emp: Employee) => {
    if (confirm(`Are you sure you want to delete ${emp.first_name} ${emp.last_name}?`)) {
      deleteMutation.mutate(emp.id);
    }
  };

  const canManageEmployees =
    user?.role === 'Admin' || user?.role === 'HR' || user?.role === 'SuperAdmin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Workforce Directory</h1>
          <p className="section-subtitle">
            Manage organization personnel, department assignments, and employment records.
          </p>
        </div>

        {canManageEmployees && (
          <button
            id="btn-add-employee-trigger"
            className="btn btn-primary"
            onClick={() => setInternalAddModalOpen(true)}
          >
            <Plus size={16} /> Onboard Employee
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          padding: '1rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              id="input-employee-search"
              type="text"
              className="form-control"
              placeholder="Search by name, email, or employee code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
              }}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              id="select-dept-filter"
              className="form-control"
              value={selectedDeptId || ''}
              onChange={(e) =>
                setSelectedDeptId(e.target.value ? Number(e.target.value) : undefined)
              }
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
          <UserCheck size={16} />
          <span>{employees.length} Members Listed</span>
        </div>
      </div>

      {/* Employees Data Table */}
      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading workforce directory...
          </div>
        ) : employees.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
            <Users size={40} color="var(--text-tertiary)" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 600, fontSize: '1rem' }}>No Employees Found</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {searchQuery || selectedDeptId
                ? 'Try adjusting your filters or search keywords.'
                : 'Click "Onboard Employee" to add the first team member.'}
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
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} id={`employee-row-${emp.id}`}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: 'var(--radius-full)',
                          background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          flexShrink: 0,
                        }}
                      >
                        {emp.first_name.charAt(0)}
                        {emp.last_name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {emp.first_name} {emp.last_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {emp.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {emp.employee_code}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-primary">
                      {emp.department_name || `Dept #${emp.department_id}`}
                    </span>
                  </td>
                  <td>{emp.designation}</td>
                  <td>
                    <span
                      className={
                        emp.status === 'Active'
                          ? 'badge badge-success'
                          : emp.status === 'OnLeave'
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
                        id={`btn-view-emp-${emp.id}`}
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedEmployee(emp)}
                        title="View Full Profile"
                      >
                        <Eye size={14} /> View
                      </button>

                      {canManageEmployees && (
                        <button
                          id={`btn-delete-emp-${emp.id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(emp)}
                          title="Archive Employee"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Onboard Employee Modal */}
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        departments={departments}
      />

      {/* Employee Detail Drawer */}
      <EmployeeDetailDrawer
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />
    </div>
  );
};
