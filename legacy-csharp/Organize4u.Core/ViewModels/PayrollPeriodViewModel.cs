using System;

namespace Organize4u.Core.ViewModels;

public class PayrollPeriodViewModel
{
    public int Month { get; set; }
    public int Year { get; set; }
    public string MonthName => new DateTime(Year, Month, 1).ToString("MMMM");
    public string DisplayName => $"{MonthName} {Year}";
    public bool IsCurrent => Month == DateTime.Now.Month && Year == DateTime.Now.Year;
}
