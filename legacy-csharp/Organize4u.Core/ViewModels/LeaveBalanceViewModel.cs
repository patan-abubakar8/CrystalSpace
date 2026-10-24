namespace Organize4u.Core.ViewModels;

public class LeaveBalanceViewModel
{
    public int TotalEntitled { get; set; }
    public int Used { get; set; }
    public int Pending { get; set; }
    public int Remaining => TotalEntitled - Used;
    
    public int SickLeaveBalance { get; set; }
    public int CasualLeaveBalance { get; set; }
    public int PaidLeaveBalance { get; set; }
}
