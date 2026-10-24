using System.Collections.Generic;
using Organize4u.Core.Models;

namespace Organize4u.Core.ViewModels;

public class EmployeeDashboardViewModel
{
    public int AssignedTasksCount { get; set; }
    public int CompletedTasksCount { get; set; }
    public int LeaveBalance { get; set; }
    public int UpcomingHolidaysCount { get; set; }
    
    public IEnumerable<TaskItem> TodayTasks { get; set; } = new List<TaskItem>();
    public IEnumerable<Leave> UpcomingLeaves { get; set; } = new List<Leave>();
    public IEnumerable<ActivityLog> RecentActivities { get; set; } = new List<ActivityLog>();
}
