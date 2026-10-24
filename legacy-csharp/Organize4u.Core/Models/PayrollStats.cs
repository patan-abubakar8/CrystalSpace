namespace Organize4u.Core.Models;

public class PayrollStats
{
    public decimal TotalPayroll { get; set; }
    public double TotalPayrollChange { get; set; }
    public decimal AvgIncrement { get; set; }
    public double AvgIncrementChange { get; set; }
    public int PendingPayrolls { get; set; }
    public bool RequiresApproval { get; set; }
}
