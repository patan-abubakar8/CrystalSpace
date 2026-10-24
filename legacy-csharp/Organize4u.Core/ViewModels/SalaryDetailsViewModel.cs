namespace Organize4u.Core.ViewModels;

public class SalaryDetailsViewModel
{
    public decimal BaseSalary { get; set; }
    public decimal Allowance { get; set; }
    public decimal Bonus { get; set; }
    public decimal Deductions { get; set; }
    public decimal NetSalary => (BaseSalary + Allowance + Bonus) - Deductions;
}
