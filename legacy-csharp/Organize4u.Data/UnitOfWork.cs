using Organize4u.Core.Interfaces;
using Organize4u.Core.Models;
using Organize4u.Data.Repositories;

namespace Organize4u.Data;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
        Employees = new Repository<Employee>(_context);
        Departments = new Repository<Department>(_context);
        Leaves = new Repository<Leave>(_context);
        LeaveTypes = new Repository<LeaveType>(_context);
        Salaries = new Repository<Salary>(_context);
        SalaryHistories = new Repository<SalaryHistory>(_context);
        Documents = new Repository<EmployeeDocument>(_context);
        ActivityLogs = new Repository<ActivityLog>(_context);
        Projects = new Repository<Project>(_context);
        TaskItems = new Repository<TaskItem>(_context);
    }

    public IRepository<Employee> Employees { get; private set; }
    public IRepository<Department> Departments { get; private set; }
    public IRepository<Leave> Leaves { get; private set; }
    public IRepository<LeaveType> LeaveTypes { get; private set; }
    public IRepository<Salary> Salaries { get; private set; }
    public IRepository<SalaryHistory> SalaryHistories { get; private set; }
    public IRepository<EmployeeDocument> Documents { get; private set; }
    public IRepository<ActivityLog> ActivityLogs { get; private set; }
    public IRepository<Project> Projects { get; private set; }
    public IRepository<TaskItem> TaskItems { get; private set; }

    public IRepository<T> Repository<T>() where T : class
    {
        return new Repository<T>(_context);
    }

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
