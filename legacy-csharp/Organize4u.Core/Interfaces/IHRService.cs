using Organize4u.Core.Models;

namespace Organize4u.Core.Interfaces;

public interface IHRService
{
    // Employee Management
    Task<IEnumerable<Employee>> GetAllEmployeesAsync();
    Task<Employee?> GetEmployeeByIdAsync(int id);
    Task<(string Password, string EmployeeCode)> CreateEmployeeAsync(Employee employee, string role = "Employee");
    Task UpdateEmployeeAsync(Employee employee);
    Task DeactivateEmployeeAsync(int id);
    
    // Leave Management
    Task<IEnumerable<Leave>> GetPendingLeavesAsync();
    Task ApproveLeaveAsync(int leaveId);
    Task RejectLeaveAsync(int leaveId);
    
    // Salary Management
    Task UpdateSalaryAsync(int employeeId, decimal baseSalary, decimal allowance, decimal bonus, string reason);
    Task<IEnumerable<Salary>> GetEmployeeSalariesAsync(int employeeId);
    Task<PayrollStats> GetPayrollStatsAsync();
    Task<IEnumerable<Employee>> GetEmployeesWithSalaryAsync();
    
    // Documents
    Task UploadDocumentAsync(EmployeeDocument document);
    Task<IEnumerable<EmployeeDocument>> GetEmployeeDocumentsAsync(int employeeId);
    Task<Dictionary<string, List<EmployeeDocument>>> GetEmployeeDocumentsByCategoryAsync(int employeeId);
    
    // Leave History
    Task<IEnumerable<Leave>> GetEmployeeLeavesAsync(int employeeId);
    
    // Activity Timeline
    Task<IEnumerable<ActivityLog>> GetEmployeeActivitiesAsync(int employeeId);
    Task LogEmployeeActivityAsync(int employeeId, string action, string? details);
    
    // Lookups
    Task<IEnumerable<Department>> GetAllDepartmentsAsync();
    Task<IEnumerable<LeaveType>> GetAllLeaveTypesAsync();
    
    // Dashboard & Redirection
    Task<DashboardStats> GetDashboardStatsAsync();
    Task<string> GetRedirectionAsync(string userId);
    
    // Payslip
    Task<Organize4u.Core.ViewModels.PayslipViewModel?> GetPayslipDataAsync(int employeeId, int month, int year);
    
    // Payroll Periods
    Task<IEnumerable<Organize4u.Core.ViewModels.PayrollPeriodViewModel>> GetPayrollPeriodsAsync();
}
