using Organize4u.Core.Interfaces;
using Organize4u.Core.Models;

namespace Organize4u.Service;

public class HRService : IHRService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IIdentityService _identityService;

    public HRService(IUnitOfWork unitOfWork, IIdentityService identityService)
    {
        _unitOfWork = unitOfWork;
        _identityService = identityService;
    }

    public async Task<IEnumerable<Employee>> GetAllEmployeesAsync()
    {
        return await _unitOfWork.Employees.FindListAsync(e => true, 
            e => e.PersonalDetail!, e => e.ProfessionalDetail!, e => e.Department!);
    }

    public async Task<Employee?> GetEmployeeByIdAsync(int id)
    {
        // We need to include related data for the normalized structure
        return await _unitOfWork.Employees.FindAsync(e => e.Id == id, 
            e => e.PersonalDetail!, e => e.ProfessionalDetail!, e => e.EmergencyContact!, e => e.Department!);
    }

    public async Task<(string Password, string EmployeeCode)> CreateEmployeeAsync(Employee employee, string role = "Employee")
    {
        // Ensure email follows @organize.com format if not already
        if (!employee.Email.EndsWith("@organize.com", StringComparison.OrdinalIgnoreCase))
        {
            var namePart = employee.FirstName.ToLower().Replace(" ", "");
            employee.Email = $"{namePart}@organize.com";
        }

        // Create Identity User
        var defaultPassword = "Employee@123"; // In a real app, generate a random one and email it
        var (succeeded, userId) = await _identityService.CreateUserAsync(employee.Email, defaultPassword, role);
        
        if (succeeded)
        {
            employee.IdentityUserId = userId;
        }

        // Ensure related entities are properly tracked
        if (employee.PersonalDetail != null)
        {
            employee.PersonalDetail.EmployeeId = 0;
        }
        
        if (employee.EmergencyContact != null)
        {
            employee.EmergencyContact.EmployeeId = 0;
        }
        
        if (employee.ProfessionalDetail != null)
        {
            employee.ProfessionalDetail.EmployeeId = 0;
        }
        
        await _unitOfWork.Employees.AddAsync(employee);
        await _unitOfWork.CompleteAsync();

        // If EmployeeCode wasn't set, generate a simple one
        if (string.IsNullOrEmpty(employee.EmployeeCode))
        {
            employee.EmployeeCode = $"EMP-{employee.Id:D4}";
            await _unitOfWork.CompleteAsync();
        }

        return (defaultPassword, employee.EmployeeCode);
    }

    public async Task UpdateEmployeeAsync(Employee employee)
    {
        // Get the existing employee from database
        var existingEmployee = await _unitOfWork.Employees.FindAsync(
            e => e.Id == employee.Id,
            e => e.PersonalDetail!, e => e.EmergencyContact!, e => e.ProfessionalDetail!);
        
        if (existingEmployee == null) return;

        // Update main employee properties
        existingEmployee.FirstName = employee.FirstName;
        existingEmployee.LastName = employee.LastName;
        existingEmployee.Email = employee.Email;
        existingEmployee.Phone = employee.Phone;
        existingEmployee.EmployeeCode = employee.EmployeeCode;
        existingEmployee.DepartmentId = employee.DepartmentId;
        existingEmployee.Designation = employee.Designation;
        existingEmployee.JoiningDate = employee.JoiningDate;
        existingEmployee.EmploymentType = employee.EmploymentType;
        existingEmployee.OfficeLocation = employee.OfficeLocation;
        existingEmployee.Skills = employee.Skills;
        existingEmployee.ManagerId = employee.ManagerId;
        existingEmployee.IsActive = employee.IsActive;

        // Update Personal Detail
        if (employee.PersonalDetail != null)
        {
            if (existingEmployee.PersonalDetail == null)
            {
                existingEmployee.PersonalDetail = employee.PersonalDetail;
                existingEmployee.PersonalDetail.EmployeeId = employee.Id;
            }
            else
            {
                existingEmployee.PersonalDetail.DateOfBirth = employee.PersonalDetail.DateOfBirth;
                existingEmployee.PersonalDetail.Gender = employee.PersonalDetail.Gender;
                existingEmployee.PersonalDetail.Nationality = employee.PersonalDetail.Nationality;
                existingEmployee.PersonalDetail.MaritalStatus = employee.PersonalDetail.MaritalStatus;
                existingEmployee.PersonalDetail.Address = employee.PersonalDetail.Address;
                existingEmployee.PersonalDetail.City = employee.PersonalDetail.City;
                existingEmployee.PersonalDetail.Country = employee.PersonalDetail.Country;
                existingEmployee.PersonalDetail.ZIPCode = employee.PersonalDetail.ZIPCode;
            }
        }

        // Update Emergency Contact
        if (employee.EmergencyContact != null)
        {
            if (existingEmployee.EmergencyContact == null)
            {
                existingEmployee.EmergencyContact = employee.EmergencyContact;
                existingEmployee.EmergencyContact.EmployeeId = employee.Id;
            }
            else
            {
                existingEmployee.EmergencyContact.ContactName = employee.EmergencyContact.ContactName;
                existingEmployee.EmergencyContact.Relationship = employee.EmergencyContact.Relationship;
                existingEmployee.EmergencyContact.ContactNumber = employee.EmergencyContact.ContactNumber;
            }
        }

        // Update Professional Detail
        if (employee.ProfessionalDetail != null)
        {
            if (existingEmployee.ProfessionalDetail == null)
            {
                existingEmployee.ProfessionalDetail = employee.ProfessionalDetail;
                existingEmployee.ProfessionalDetail.EmployeeId = employee.Id;
            }
            else
            {
                existingEmployee.ProfessionalDetail.PerformanceScore = employee.ProfessionalDetail.PerformanceScore;
                existingEmployee.ProfessionalDetail.BaseSalary = employee.ProfessionalDetail.BaseSalary;
                existingEmployee.ProfessionalDetail.HousingAllowance = employee.ProfessionalDetail.HousingAllowance;
                existingEmployee.ProfessionalDetail.PerformanceBonusPercentage = employee.ProfessionalDetail.PerformanceBonusPercentage;
            }
        }

        _unitOfWork.Employees.Update(existingEmployee);
        await _unitOfWork.CompleteAsync();
    }

    public async Task DeactivateEmployeeAsync(int id)
    {
        var employee = await _unitOfWork.Employees.GetByIdAsync(id);
        if (employee != null)
        {
            employee.IsActive = false;
            await _unitOfWork.CompleteAsync();
        }
    }

    public async Task<IEnumerable<Leave>> GetPendingLeavesAsync()
    {
        return await _unitOfWork.Leaves.FindListAsync(l => l.Status == LeaveStatus.Pending, 
            l => l.Employee!, l => l.LeaveType!);
    }

    public async Task<IEnumerable<Leave>> GetEmployeeLeavesAsync(int employeeId)
    {
        return await _unitOfWork.Leaves.FindListAsync(l => l.EmployeeId == employeeId,
            l => l.LeaveType!);
    }

    public async Task<IEnumerable<ActivityLog>> GetEmployeeActivitiesAsync(int employeeId)
    {
        // For now, return mock data - in real app, fetch from database
        return new List<ActivityLog>
        {
            new ActivityLog { Action = "Profile Updated", Details = "Personal information was updated", Timestamp = DateTime.UtcNow.AddDays(-1) },
            new ActivityLog { Action = "Salary Revised", Details = "Annual increment applied", Timestamp = DateTime.UtcNow.AddMonths(-1) },
            new ActivityLog { Action = "Leave Approved", Details = "Annual leave request approved", Timestamp = DateTime.UtcNow.AddDays(-5) }
        }.OrderBy(a => a.Timestamp).Reverse();
    }

    public async Task LogEmployeeActivityAsync(int employeeId, string action, string? details)
    {
        var activity = new ActivityLog
        {
            Action = action,
            Details = details,
            Timestamp = DateTime.UtcNow
        };
        // In real app, save to database
        await Task.CompletedTask;
    }

    public async Task ApproveLeaveAsync(int leaveId)
    {
        var leave = await _unitOfWork.Leaves.GetByIdAsync(leaveId);
        if (leave != null)
        {
            leave.Status = LeaveStatus.Approved;
            await _unitOfWork.CompleteAsync();
        }
    }

    public async Task RejectLeaveAsync(int leaveId)
    {
        var leave = await _unitOfWork.Leaves.GetByIdAsync(leaveId);
        if (leave != null)
        {
            leave.Status = LeaveStatus.Rejected;
            await _unitOfWork.CompleteAsync();
        }
    }

    public async Task UpdateSalaryAsync(int employeeId, decimal baseSalary, decimal allowance, decimal bonus, string reason)
    {
        var salaries = await _unitOfWork.Salaries.FindAsync(s => s.EmployeeId == employeeId);
        var salary = salaries.FirstOrDefault();

        if (salary == null)
        {
            salary = new Salary { EmployeeId = employeeId };
            await _unitOfWork.Salaries.AddAsync(salary);
        }

        decimal oldTotal = salary.BaseSalary + salary.Allowance + salary.Bonus;
        decimal newTotal = baseSalary + allowance + bonus;

        var history = new SalaryHistory
        {
            EmployeeId = employeeId,
            OldSalary = oldTotal,
            NewSalary = newTotal,
            Reason = reason,
            ChangeDate = DateTime.UtcNow
        };

        salary.BaseSalary = baseSalary;
        salary.Allowance = allowance;
        salary.Bonus = bonus;
        salary.LastUpdate = DateTime.UtcNow;

        await _unitOfWork.SalaryHistories.AddAsync(history);
        await _unitOfWork.CompleteAsync();
    }

    public async Task<IEnumerable<Salary>> GetEmployeeSalariesAsync(int employeeId)
    {
        return await _unitOfWork.Salaries.FindListAsync(s => s.EmployeeId == employeeId);
    }

    public async Task UploadDocumentAsync(EmployeeDocument document)
    {
        await _unitOfWork.Documents.AddAsync(document);
        await _unitOfWork.CompleteAsync();
    }

    public async Task<IEnumerable<EmployeeDocument>> GetEmployeeDocumentsAsync(int employeeId)
    {
        return await _unitOfWork.Documents.FindAsync(d => d.EmployeeId == employeeId);
    }

    public async Task<PayrollStats> GetPayrollStatsAsync()
    {
        var salaries = await _unitOfWork.Salaries.GetAllAsync();
        var totalPayroll = salaries.Sum(s => s.BaseSalary + s.Allowance + s.Bonus);
        
        return new PayrollStats
        {
            TotalPayroll = totalPayroll,
            TotalPayrollChange = 12.5, // Mock value as per image
            AvgIncrement = 6.5m,      // Mock value as per image
            AvgIncrementChange = 0.5,
            PendingPayrolls = 12,     // Mock value as per image
            RequiresApproval = true
        };
    }

    public async Task<IEnumerable<Employee>> GetEmployeesWithSalaryAsync()
    {
        return await _unitOfWork.Employees.FindListAsync(e => true, 
            e => e.Salaries, e => e.Department!);
    }

    public async Task<Dictionary<string, List<EmployeeDocument>>> GetEmployeeDocumentsByCategoryAsync(int employeeId)
    {
        // First check if any documents exist for this employee
        var documents = await _unitOfWork.Documents.FindAsync(d => d.EmployeeId == employeeId);
        
        // Ensure we handle categories even if empty for the UI sections
        var categories = new[] { "ONBOARDING DOCS", "EDUCATION", "EXPERIENCE", "PAYSLIPS" };
        var result = categories.ToDictionary(c => c, c => new List<EmployeeDocument>());

        foreach (var doc in documents)
        {
            var key = doc.DocumentType.ToUpper();
            if (result.ContainsKey(key))
            {
                result[key].Add(doc);
            }
            else
            {
                // Fallback for uncategorized
                if (!result.ContainsKey("OTHER")) result["OTHER"] = new List<EmployeeDocument>();
                result["OTHER"].Add(doc);
            }
        }

        return result;
    }

    public async Task<IEnumerable<Department>> GetAllDepartmentsAsync()
    {
        return await _unitOfWork.Departments.GetAllAsync();
    }

    public async Task<IEnumerable<LeaveType>> GetAllLeaveTypesAsync()
    {
        return await _unitOfWork.LeaveTypes.GetAllAsync();
    }

    public async Task<DashboardStats> GetDashboardStatsAsync()
    {
        var employees = await _unitOfWork.Employees.GetAllAsync();
        var leaves = await _unitOfWork.Leaves.GetAllAsync();
        
        // Detailed lists for the UI
        var pendingLeaves = leaves.Where(l => l.Status == LeaveStatus.Pending).ToList();
        var newJoinees = employees.OrderByDescending(e => e.JoiningDate).Take(3).ToList();

        return new DashboardStats
        {
            TotalEmployees = employees.Count(),
            TotalEmployeesChange = 2.5,
            
            ActiveEmployees = employees.Count(e => e.IsActive),
            
            PendingLeavesCount = pendingLeaves.Count,
            PendingLeavesChange = 5.0,
            
            EmployeesOnLeaveCount = leaves.Count(l => l.Status == LeaveStatus.Approved && l.StartDate <= DateTime.Today && l.EndDate >= DateTime.Today),
            EmployeesOnLeaveChange = -1.2,
            
            NewJoineesCount = employees.Count(e => e.JoiningDate >= DateTime.Today.AddDays(-30)),
            NewJoineesChange = -3.0,
            
            PendingLeaves = pendingLeaves,
            NewJoinees = newJoinees,
            
            RecentActivities = new List<ActivityItem>
            {
                new ActivityItem { UserName = "Sarah Jenkins", Action = "submitted a sick leave request", Timestamp = "10:30 AM", UserAvatarUrl = "https://i.pravatar.cc/150?u=sarah" },
                new ActivityItem { UserName = "David Chen", Action = "updated their payroll information", Timestamp = "08:15 AM", UserAvatarUrl = "https://i.pravatar.cc/150?u=david" },
                new ActivityItem { UserName = "Emma Wilson", Action = "joined the Design Team", Timestamp = "09:00 AM", UserAvatarUrl = "https://i.pravatar.cc/150?u=emma" }
            }
        };
    }

    public async Task<string> GetRedirectionAsync(string userId)
    {
        var roles = await _identityService.GetRolesForUserAsync(userId);
        
        if (roles.Contains("SuperAdmin") || roles.Contains("HR"))
            return "/HR/Index";

        if (roles.Contains("Employee"))
            return "/Employee/Index";

        return "/Home/Index"; // Default
    }

    public async Task<Core.ViewModels.PayslipViewModel?> GetPayslipDataAsync(int employeeId, int month, int year)
    {
        var employee = await _unitOfWork.Employees.FindAsync(e => e.Id == employeeId, 
            e => e.Department!, e => e.ProfessionalDetail!);
        
        if (employee == null) return null;

        var salaries = await _unitOfWork.Salaries.FindAsync(s => s.EmployeeId == employeeId);
        var salary = salaries.FirstOrDefault() ?? new Salary();

        return new Core.ViewModels.PayslipViewModel
        {
            EmployeeId = employee.Id,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            EmployeeCode = employee.EmployeeCode,
            Designation = employee.Designation,
            Department = employee.Department?.Name,
            Email = employee.Email,
            Month = month,
            Year = year,
            BaseSalary = salary.BaseSalary,
            Allowance = salary.Allowance,
            Bonus = salary.Bonus,
            GeneratedDate = DateTime.Now
        };
    }

    public async Task<IEnumerable<Core.ViewModels.PayrollPeriodViewModel>> GetPayrollPeriodsAsync()
    {
        var periods = new List<Core.ViewModels.PayrollPeriodViewModel>();
        var current = DateTime.Now;
        
        // Return last 12 months for selection
        for (int i = 0; i < 12; i++)
        {
            var date = current.AddMonths(-i);
            periods.Add(new Core.ViewModels.PayrollPeriodViewModel
            {
                Month = date.Month,
                Year = date.Year
            });
        }
        
        return await Task.FromResult(periods);
    }
}
