using Organize4u.Core.Models;

namespace Organize4u.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<Employee> Employees { get; }
    IRepository<Department> Departments { get; }
    IRepository<Leave> Leaves { get; }
    IRepository<LeaveType> LeaveTypes { get; }
    IRepository<Salary> Salaries { get; }
    IRepository<SalaryHistory> SalaryHistories { get; }
    IRepository<EmployeeDocument> Documents { get; }
    IRepository<ActivityLog> ActivityLogs { get; }
    IRepository<Project> Projects { get; }
    IRepository<TaskItem> TaskItems { get; }
    
    IRepository<T> Repository<T>() where T : class;
    
    Task<int> CompleteAsync();
}
