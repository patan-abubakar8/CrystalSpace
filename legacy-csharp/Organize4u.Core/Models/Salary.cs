namespace Organize4u.Core.Models;

public class Salary
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    
    public decimal BaseSalary { get; set; }
    public decimal Allowance { get; set; }
    public decimal Bonus { get; set; }
    
    public decimal IncrementPercentage { get; set; }
    public DateTime? IncrementDate { get; set; }
    
    public DateTime LastUpdate { get; set; } = DateTime.UtcNow;
}

public class SalaryHistory
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    
    public decimal OldSalary { get; set; }
    public decimal NewSalary { get; set; }
    public DateTime ChangeDate { get; set; } = DateTime.UtcNow;
    public string? Reason { get; set; }
}
