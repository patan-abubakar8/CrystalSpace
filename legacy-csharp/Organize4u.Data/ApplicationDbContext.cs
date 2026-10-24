using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Organize4u.Core.Models;

namespace Organize4u.Data;

public class ApplicationDbContext : IdentityDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Employee> Employees { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<Leave> Leaves { get; set; }
    public DbSet<LeaveType> LeaveTypes { get; set; }
    public DbSet<Salary> Salaries { get; set; }
    public DbSet<SalaryHistory> SalaryHistories { get; set; }
    public DbSet<EmployeeDocument> EmployeeDocuments { get; set; }
    public DbSet<ActivityLog> ActivityLogs { get; set; }
    public DbSet<EmployeePersonalDetail> EmployeePersonalDetails { get; set; }
    public DbSet<EmergencyContact> EmergencyContacts { get; set; }
    public DbSet<EmployeeProfessionalDetail> EmployeeProfessionalDetails { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<TaskItem> TaskItems { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure relationships
        builder.Entity<Employee>()
            .HasOne(e => e.Department)
            .WithMany(d => d.Employees)
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Employee>()
            .HasOne(e => e.Manager)
            .WithMany()
            .HasForeignKey(e => e.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Leave>()
            .HasOne(l => l.Employee)
            .WithMany(e => e.Leaves)
            .HasForeignKey(l => l.EmployeeId);

        builder.Entity<Salary>()
            .HasOne(s => s.Employee)
            .WithMany(e => e.Salaries)
            .HasForeignKey(s => s.EmployeeId);
            
        builder.Entity<EmployeeDocument>()
            .HasOne(d => d.Employee)
            .WithMany(e => e.Documents)
            .HasForeignKey(d => d.EmployeeId);

        // One-to-One Relationships
        builder.Entity<Employee>()
            .HasOne(e => e.PersonalDetail)
            .WithOne(pd => pd.Employee)
            .HasForeignKey<EmployeePersonalDetail>(pd => pd.EmployeeId);

        builder.Entity<Employee>()
            .HasOne(e => e.EmergencyContact)
            .WithOne(ec => ec.Employee)
            .HasForeignKey<EmergencyContact>(ec => ec.EmployeeId);

        builder.Entity<Employee>()
            .HasOne(e => e.ProfessionalDetail)
            .WithOne(prd => prd.Employee)
            .HasForeignKey<EmployeeProfessionalDetail>(prd => prd.EmployeeId);
    }
}
