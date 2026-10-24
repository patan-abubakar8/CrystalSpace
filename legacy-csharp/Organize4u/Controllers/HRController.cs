using Microsoft.AspNetCore.Mvc;
using Organize4u.Core.Interfaces;
using Organize4u.Core.Models;

using Microsoft.AspNetCore.Authorization;

namespace Organize4u.Controllers;

[Authorize(Roles = "HR,SuperAdmin")]
public class HRController : Controller
{
    private readonly IHRService _hrService;
    private readonly IIdentityService _identityService;

    public HRController(IHRService hrService, IIdentityService identityService)
    {
        _hrService = hrService;
        _identityService = identityService;
    }

    public async Task<IActionResult> Index()
    {
        var stats = await _hrService.GetDashboardStatsAsync();
        return View(stats);
    }

    public async Task<IActionResult> Employees()
    {
        var employees = await _hrService.GetAllEmployeesAsync();
        return View(employees);
    }

    public async Task<IActionResult> Details(int id)
    {
        var employee = await _hrService.GetEmployeeByIdAsync(id);
        if (employee == null) return NotFound();
        return View(employee);
    }

    public async Task<IActionResult> Create()
    {
        await LoadViewData();
        return View("Upsert", new Employee { JoiningDate = DateTime.Today });
    }

    public async Task<IActionResult> Edit(int id)
    {
        var employee = await _hrService.GetEmployeeByIdAsync(id);
        if (employee == null) return NotFound();
        await LoadViewData();
        return View("Upsert", employee);
    }

    private async Task LoadViewData()
    {
        ViewBag.Departments = await _hrService.GetAllDepartmentsAsync();
        ViewBag.LeaveTypes = await _hrService.GetAllLeaveTypesAsync();
        // Load all employees to act as potential managers
        ViewBag.Managers = await _hrService.GetAllEmployeesAsync();

        // Load roles for the dropdown based on current user's role
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var roles = await _identityService.GetRolesForUserAsync(userId ?? "");
        var primaryRole = roles.Contains("SuperAdmin") ? "SuperAdmin" : (roles.Contains("HR") ? "HR" : "Employee");
        ViewBag.AvailableRoles = await _identityService.GetAvailableRolesAsync(primaryRole);
    }

    [HttpPost]
    public async Task<IActionResult> Upsert(Employee employee, string selectedRole = "Employee")
    {
        if (ModelState.IsValid)
        {
            if (employee.Id == 0)
            {
                var (password, employeeCode) = await _hrService.CreateEmployeeAsync(employee, selectedRole);
                TempData["NewEmployeeCreds"] = $"{employee.FirstName} {employee.LastName}|{employeeCode}|{employee.Email}|{password}";
            }
            else
            {
                await _hrService.UpdateEmployeeAsync(employee);
            }
            
            return RedirectToAction(nameof(Employees));
        }
        await LoadViewData(); // Reload departments and leave types for the form
        return View(employee);
    }

    public async Task<IActionResult> Salaries(int? month, int? year)
    {
        var currentMonth = month ?? DateTime.Now.Month;
        var currentYear = year ?? DateTime.Now.Year;

        ViewBag.SelectedMonth = currentMonth;
        ViewBag.SelectedYear = currentYear;
        ViewBag.Periods = await _hrService.GetPayrollPeriodsAsync();
        ViewBag.Stats = await _hrService.GetPayrollStatsAsync();
        
        var employees = await _hrService.GetEmployeesWithSalaryAsync();
        return View(employees);
    }

    [HttpPost]
    public async Task<IActionResult> UpdateSalary(int employeeId, decimal baseSalary, decimal allowance, decimal bonus, string reason)
    {
        await _hrService.UpdateSalaryAsync(employeeId, baseSalary, allowance, bonus, reason);
        return Ok();
    }

    public IActionResult Reports()
    {
        return View();
    }

    public async Task<IActionResult> Documents(int employeeId = 0)
    {
        var employees = await _hrService.GetAllEmployeesAsync();
        ViewBag.Employees = employees;

        // If no employeeId is provided, default to the first employee if any exists
        if (employeeId == 0 && employees.Any())
        {
            employeeId = employees.First().Id;
        }

        var selectedEmployee = employees.FirstOrDefault(e => e.Id == employeeId);
        ViewBag.SelectedEmployee = selectedEmployee;

        var groupedDocuments = await _hrService.GetEmployeeDocumentsByCategoryAsync(employeeId);
        return View(groupedDocuments);
    }

    [HttpPost]
    public async Task<IActionResult> UploadDocument(int employeeId, IFormFile file, string documentType)
    {
        if (file == null || file.Length == 0) return BadRequest("No file uploaded");
        if (string.IsNullOrEmpty(documentType)) return BadRequest("Document type is required");

        // Create upload directory if it doesn't exist
        var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "documents", employeeId.ToString());
        if (!Directory.Exists(uploadsRoot))
        {
            Directory.CreateDirectory(uploadsRoot);
        }

        var fileName = Path.GetFileName(file.FileName);
        var filePath = Path.Combine(uploadsRoot, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var fileSize = (file.Length / 1024.0).ToString("N2") + " KB";
        if (file.Length > 1024 * 1024)
        {
            fileSize = (file.Length / (1024.0 * 1024.0)).ToString("N2") + " MB";
        }

        var document = new EmployeeDocument
        {
            EmployeeId = employeeId,
            DocumentName = fileName,
            FilePath = $"/uploads/documents/{employeeId}/{fileName}",
            DocumentType = documentType,
            FileSize = fileSize,
            UploadDate = DateTime.Now
        };

        await _hrService.UploadDocumentAsync(document);
        return Ok(new { fileName = fileName });
    }

    public async Task<IActionResult> Leaves()
    {
        var leaves = await _hrService.GetPendingLeavesAsync();
        return View(leaves);
    }

    [HttpPost]
    public async Task<IActionResult> ApproveLeave(int id)
    {
        await _hrService.ApproveLeaveAsync(id);
        return Ok();
    }

    [HttpPost]
    public async Task<IActionResult> RejectLeave(int id)
    {
        await _hrService.RejectLeaveAsync(id);
        return Ok();
    }

    public async Task<IActionResult> ExportPayslip(int employeeId, int month = 0, int year = 0)
    {
        if (month == 0) month = DateTime.Now.Month;
        if (year == 0) year = DateTime.Now.Year;

        var payslipData = await _hrService.GetPayslipDataAsync(employeeId, month, year);
        if (payslipData == null) return NotFound();

        return View("Payslip", payslipData);
    }
}
