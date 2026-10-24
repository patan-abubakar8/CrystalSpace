namespace Organize4u.Core.Models;

public class DashboardStats
{
    public int TotalEmployees { get; set; }
    public double TotalEmployeesChange { get; set; } = 2.5; // Placeholder
    
    public int ActiveEmployees { get; set; }
    
    public int PendingLeavesCount { get; set; }
    public double PendingLeavesChange { get; set; } = 5.0; // Placeholder
    
    public int EmployeesOnLeaveCount { get; set; }
    public double EmployeesOnLeaveChange { get; set; } = -1.2; // Placeholder
    
    public int NewJoineesCount { get; set; }
    public double NewJoineesChange { get; set; } = -3.0; // Placeholder
    
    public List<ActivityItem> RecentActivities { get; set; } = new();
    public List<Leave> PendingLeaves { get; set; } = new();
    public List<Employee> NewJoinees { get; set; } = new();
}

public class ActivityItem
{
    public string UserName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty;
    public string UserAvatarUrl { get; set; } = string.Empty;
}
