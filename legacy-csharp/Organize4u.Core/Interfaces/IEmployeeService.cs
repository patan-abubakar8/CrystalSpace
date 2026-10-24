using System.Collections.Generic;
using System.Threading.Tasks;
using Organize4u.Core.Models;
using Organize4u.Core.ViewModels;

namespace Organize4u.Core.Interfaces;

public interface IEmployeeService
{
    // Dashboard
    Task<EmployeeDashboardViewModel> GetDashboardStatsAsync(int employeeId);
    Task<IEnumerable<TaskItem>> GetTodayTasksAsync(int employeeId);
    Task<IEnumerable<Leave>> GetUpcomingLeavesAsync(int employeeId);
    Task<IEnumerable<ActivityLog>> GetRecentActivitiesAsync(int employeeId);
    
    // Profile
    Task<Employee> GetProfileAsync(int employeeId);
    Task<bool> UpdateProfileAsync(int employeeId, EmployeeUpdateViewModel model);
    
    // Tasks
    Task<IEnumerable<TaskItem>> GetTasksAsync(int employeeId);
    Task<bool> UpdateTaskStatusAsync(int taskId, string status, int employeeId);
    
    // Leave Management
    Task<LeaveBalanceViewModel> GetLeaveBalanceAsync(int employeeId);
    Task<IEnumerable<Leave>> GetLeaveHistoryAsync(int employeeId);
    Task<bool> ApplyLeaveAsync(int employeeId, LeaveApplicationViewModel model);
    
    // Salary & Payslips
    Task<SalaryDetailsViewModel> GetSalaryDetailsAsync(int employeeId);
    Task<IEnumerable<PayslipViewModel>> GetSalaryHistoryAsync(int employeeId);
    
    // Documents
    Task<IEnumerable<EmployeeDocument>> GetDocumentsAsync(int employeeId);
    Task<bool> UploadDocumentAsync(int employeeId, EmployeeDocumentUploadViewModel model);
}
