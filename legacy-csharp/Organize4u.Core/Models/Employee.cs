using Microsoft.AspNetCore.Identity;

namespace Organize4u.Core.Models;

public class Employee
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    
    public int DepartmentId { get; set; }
    public Department? Department { get; set; }
    
    public string Designation { get; set; } = string.Empty;
    public DateTime JoiningDate { get; set; }
    public string EmploymentType { get; set; } = "Full Time"; 
    public string? OfficeLocation { get; set; }
    public string? Skills { get; set; }
    
    public int? ManagerId { get; set; }
    public Employee? Manager { get; set; }
    
    public bool IsActive { get; set; } = true;

    // Normalized Components
    public EmployeePersonalDetail? PersonalDetail { get; set; }
    public EmergencyContact? EmergencyContact { get; set; }
    public EmployeeProfessionalDetail? ProfessionalDetail { get; set; }
    
    public ICollection<Leave> Leaves { get; set; } = new List<Leave>();
    public ICollection<Salary> Salaries { get; set; } = new List<Salary>();
    public ICollection<EmployeeDocument> Documents { get; set; } = new List<EmployeeDocument>();
    
    public string? IdentityUserId { get; set; }
}
