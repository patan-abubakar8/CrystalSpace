using System.ComponentModel.DataAnnotations;

namespace Organize4u.Core.Models;

public class EmergencyContact
{
    [Key]
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public string ContactName { get; set; } = string.Empty;
    public string Relationship { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
}
