namespace Organize4u.Core.Models;

public class LeaveType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DefaultAllocation { get; set; }
}

public enum LeaveStatus
{
    Pending,
    Approved,
    Rejected
}

public class Leave
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    
    public int LeaveTypeId { get; set; }
    public LeaveType? LeaveType { get; set; }
    
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
    public LeaveStatus Status { get; set; } = LeaveStatus.Pending;
    public DateTime AppliedOn { get; set; } = DateTime.UtcNow;
}
