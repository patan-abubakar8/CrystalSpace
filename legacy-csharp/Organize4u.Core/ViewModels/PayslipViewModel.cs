using System;

namespace Organize4u.Core.ViewModels;

public class PayslipViewModel
{
    public int EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public string? EmployeeCode { get; set; }
    public string? Designation { get; set; }
    public string? Department { get; set; }
    public string? Email { get; set; }
    
    public int Month { get; set; }
    public int Year { get; set; }
    public string MonthName => new DateTime(Year, Month, 1).ToString("MMMM");
    
    public decimal BaseSalary { get; set; }
    public decimal Allowance { get; set; }
    public decimal Bonus { get; set; }
    public decimal TotalEarnings => BaseSalary + Allowance + Bonus;
    
    public decimal TaxRate { get; set; } = 0.05m; // Mock 5% tax
    public decimal TaxAmount => TotalEarnings * TaxRate;
    
    public decimal NetSalary => TotalEarnings - TaxAmount;
    
    public DateTime GeneratedDate { get; set; } = DateTime.Now;
}
