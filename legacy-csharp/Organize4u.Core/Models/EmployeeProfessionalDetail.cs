using System.ComponentModel.DataAnnotations;

namespace Organize4u.Core.Models;

public class EmployeeProfessionalDetail
{
    [Key]
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public double PerformanceScore { get; set; } = 0.0;
    public decimal BaseSalary { get; set; }
    public decimal HousingAllowance { get; set; }
    public decimal PerformanceBonusPercentage { get; set; }
}
