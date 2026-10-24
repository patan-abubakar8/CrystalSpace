using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Organize4u.Core.Interfaces;
using Organize4u.Core.Models;
using Organize4u.Core.ViewModels;

namespace Organize4u.Service;

public class EmployeeService : IEmployeeService
{
    private readonly IUnitOfWork _unitOfWork;

    public EmployeeService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<EmployeeDashboardViewModel> GetDashboardStatsAsync(int employeeId)
    {
        var tasks = await _unitOfWork.TaskItems.FindListAsync(t => t.AssignedToId == employeeId, t => t.Project!);
        var leaves = await _unitOfWork.Leaves.FindListAsync(l => l.EmployeeId == employeeId);
        var logs = await _unitOfWork.ActivityLogs.FindAsync(a => a.UserId == employeeId.ToString());

        var balance = await GetLeaveBalanceAsync(employeeId);

        return new EmployeeDashboardViewModel
        {
            AssignedTasksCount = tasks.Count(t => t.Status != "Completed"),
            CompletedTasksCount = tasks.Count(t => t.Status == "Completed"),
            LeaveBalance = balance.Remaining,
            UpcomingHolidaysCount = 3, // Mock holidays until we have a Holiday model
            TodayTasks = tasks.Where(t => t.AssignedDate.Date == DateTime.Today).OrderByDescending(t => t.Id).Take(5),
            UpcomingLeaves = leaves.Where(l => l.StartDate > DateTime.Now && l.Status == LeaveStatus.Approved).OrderBy(l => l.StartDate).Take(3),
            RecentActivities = logs.OrderByDescending(l => l.Timestamp).Take(10)
        };
    }

    public async Task<IEnumerable<TaskItem>> GetTodayTasksAsync(int employeeId)
    {
        return await _unitOfWork.TaskItems.FindListAsync(t => t.AssignedToId == employeeId && t.AssignedDate.Date == DateTime.Today, t => t.Project!);
    }

    public async Task<IEnumerable<Leave>> GetUpcomingLeavesAsync(int employeeId)
    {
        return await _unitOfWork.Leaves.FindListAsync(l => l.EmployeeId == employeeId && l.StartDate > DateTime.Now);
    }

    public async Task<IEnumerable<ActivityLog>> GetRecentActivitiesAsync(int employeeId)
    {
        var logs = await _unitOfWork.ActivityLogs.FindAsync(a => a.UserId == employeeId.ToString());
        return logs.OrderByDescending(l => l.Timestamp).Take(10);
    }

    public async Task<Employee> GetProfileAsync(int employeeId)
    {
        var emp = await _unitOfWork.Repository<Employee>().FindAsync(e => e.Id == employeeId, 
            e => e.Department!, 
            e => e.Manager!, 
            e => e.PersonalDetail!, 
            e => e.ProfessionalDetail!, 
            e => e.EmergencyContact!);
            
        return emp ?? throw new Exception("Employee not found");
    }

    public async Task<bool> UpdateProfileAsync(int employeeId, EmployeeUpdateViewModel model)
    {
        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId);
        if (employee == null) return false;

        employee.FirstName = model.FirstName;
        employee.LastName = model.LastName;
        employee.Email = model.Email;
        employee.Phone = model.Phone;
        // Address and Skills would go to Personal/Professional detail models usually
        
        _unitOfWork.Employees.Update(employee);
        await _unitOfWork.CompleteAsync();

        await LogActivity(employeeId, "Profile Updated", "Updated personal information");
        return true;
    }

    public async Task<IEnumerable<TaskItem>> GetTasksAsync(int employeeId)
    {
        return await _unitOfWork.TaskItems.FindListAsync(t => t.AssignedToId == employeeId, t => t.Project!);
    }

    public async Task<bool> UpdateTaskStatusAsync(int taskId, string status, int employeeId)
    {
        var task = await _unitOfWork.TaskItems.GetByIdAsync(taskId);
        if (task == null || task.AssignedToId != employeeId) return false;

        task.Status = status;
        _unitOfWork.TaskItems.Update(task);
        await _unitOfWork.CompleteAsync();

        await LogActivity(employeeId, "Task Updated", $"Status changed to {status} for task: {task.Title}");
        return true;
    }

    public async Task<LeaveBalanceViewModel> GetLeaveBalanceAsync(int employeeId)
    {
        var leaves = await _unitOfWork.Leaves.FindListAsync(l => l.EmployeeId == employeeId);
        var leaveTypes = await _unitOfWork.LeaveTypes.GetAllAsync();
        
        int totalAllocated = 25; // Default for now
        int used = leaves.Where(l => l.Status == LeaveStatus.Approved).Sum(l => (l.EndDate - l.StartDate).Days + 1);
        int pending = leaves.Where(l => l.Status == LeaveStatus.Pending).Sum(l => (l.EndDate - l.StartDate).Days + 1);

        return new LeaveBalanceViewModel
        {
            TotalEntitled = totalAllocated,
            Used = used,
            Pending = pending,
            SickLeaveBalance = 10, // These would need specific mappings
            CasualLeaveBalance = 5,
            PaidLeaveBalance = 10
        };
    }

    public async Task<IEnumerable<Leave>> GetLeaveHistoryAsync(int employeeId)
    {
        return await _unitOfWork.Leaves.FindListAsync(l => l.EmployeeId == employeeId);
    }

    public async Task<bool> ApplyLeaveAsync(int employeeId, LeaveApplicationViewModel model)
    {
        var leaveTypes = await _unitOfWork.LeaveTypes.GetAllAsync();
        var leaveType = leaveTypes.FirstOrDefault(t => t.Name.Contains(model.LeaveType)) ?? leaveTypes.FirstOrDefault();

        var leave = new Leave
        {
            EmployeeId = employeeId,
            LeaveTypeId = leaveType?.Id ?? 1,
            StartDate = model.StartDate,
            EndDate = model.EndDate,
            Reason = model.Reason,
            Status = LeaveStatus.Pending,
            AppliedOn = DateTime.Now
        };

        await _unitOfWork.Leaves.AddAsync(leave);
        await _unitOfWork.CompleteAsync();

        await LogActivity(employeeId, "Leave Applied", $"Applied for {model.LeaveType} from {model.StartDate:d} to {model.EndDate:d}");
        return true;
    }

    public async Task<SalaryDetailsViewModel> GetSalaryDetailsAsync(int employeeId)
    {
        var salaries = await _unitOfWork.Salaries.FindAsync(s => s.EmployeeId == employeeId);
        var salary = salaries.FirstOrDefault() ?? new Salary();

        return new SalaryDetailsViewModel
        {
            BaseSalary = salary.BaseSalary,
            Allowance = salary.Allowance,
            Bonus = salary.Bonus,
            Deductions = salary.BaseSalary * 0.1m,
        };
    }

    public async Task<IEnumerable<PayslipViewModel>> GetSalaryHistoryAsync(int employeeId)
    {
        var result = new List<PayslipViewModel>();
        var salary = (await _unitOfWork.Salaries.FindAsync(s => s.EmployeeId == employeeId)).FirstOrDefault();
        
        for (int i = 0; i < 6; i++)
        {
            var date = DateTime.Now.AddMonths(-i);
            result.Add(new PayslipViewModel
            {
                EmployeeId = employeeId,
                Month = date.Month,
                Year = date.Year,
                BaseSalary = salary?.BaseSalary ?? 5000,
                Allowance = salary?.Allowance ?? 1000,
                Bonus = salary?.Bonus ?? 500,
                GeneratedDate = date
            });
        }
        return result;
    }

    public async Task<IEnumerable<EmployeeDocument>> GetDocumentsAsync(int employeeId)
    {
        return await _unitOfWork.Repository<EmployeeDocument>().FindAsync(d => d.EmployeeId == employeeId);
    }

    public async Task<bool> UploadDocumentAsync(int employeeId, EmployeeDocumentUploadViewModel model)
    {
        // Implementation for file upload logic would go here
        // Similar to what was done in HRController
        return true;
    }

    private async Task LogActivity(int employeeId, string action, string details)
    {
        var log = new ActivityLog
        {
            UserId = employeeId.ToString(),
            Action = action,
            Details = details,
            Timestamp = DateTime.Now
        };
        await _unitOfWork.Repository<ActivityLog>().AddAsync(log);
        await _unitOfWork.CompleteAsync();
    }
}
