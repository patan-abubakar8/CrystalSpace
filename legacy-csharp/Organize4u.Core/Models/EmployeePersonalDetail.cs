using System.ComponentModel.DataAnnotations;

namespace Organize4u.Core.Models;

public class EmployeePersonalDetail
{
    [Key]
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public DateTime DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Nationality { get; set; }
    public string? MaritalStatus { get; set; }
    
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? ZIPCode { get; set; }
}
