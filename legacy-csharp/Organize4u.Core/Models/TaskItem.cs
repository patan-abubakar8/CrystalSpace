using System;

namespace Organize4u.Core.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ProjectId { get; set; }
    public Project? Project { get; set; }
    public int AssignedToId { get; set; }
    public Employee? AssignedTo { get; set; }
    public DateTime AssignedDate { get; set; } = DateTime.Now;
    public DateTime Deadline { get; set; }
    public string Priority { get; set; } = "Medium"; // High, Medium, Low
    public string Status { get; set; } = "To Do"; // To Do, In Progress, In Review, Completed, Blocked
    public int Progress { get; set; } // 0-100
}
