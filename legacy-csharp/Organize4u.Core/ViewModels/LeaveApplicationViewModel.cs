using System;

namespace Organize4u.Core.ViewModels;

public class LeaveApplicationViewModel
{
    public string LeaveType { get; set; } = string.Empty; // Sick, Casual, Paid, WFH
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
}
