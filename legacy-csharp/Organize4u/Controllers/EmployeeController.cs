using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Organize4u.Core.Interfaces;
using Organize4u.Core.ViewModels;

namespace Organize4u.Controllers;

[Authorize(Roles = "Employee")]
public class EmployeeController : Controller
{
    private readonly IEmployeeService _employeeService;
    private readonly IHRService _hrService;

    public EmployeeController(IEmployeeService employeeService, IHRService hrService)
    {
        _employeeService = employeeService;
        _hrService = hrService;
    }

    private int GetCurrentEmployeeId()
    {
        var idClaim = User.FindFirstValue("EmployeeId");
        if (idClaim != null && int.TryParse(idClaim, out int id))
        {
            return id;
        }
        // Fallback or handle error - in a real app this should be structured
        return 1; // Default for demo/mock
    }

    public async Task<IActionResult> Index()
    {
        var employeeId = GetCurrentEmployeeId();
        var stats = await _employeeService.GetDashboardStatsAsync(employeeId);
        return View(stats);
    }

    public async Task<IActionResult> Profile()
    {
        var employeeId = GetCurrentEmployeeId();
        var employee = await _employeeService.GetProfileAsync(employeeId);
        return View(employee);
    }

    public async Task<IActionResult> Tasks()
    {
        var employeeId = GetCurrentEmployeeId();
        var tasks = await _employeeService.GetTasksAsync(employeeId);
        return View(tasks);
    }

    public async Task<IActionResult> Leaves()
    {
        var employeeId = GetCurrentEmployeeId();
        ViewBag.Balance = await _employeeService.GetLeaveBalanceAsync(employeeId);
        var history = await _employeeService.GetLeaveHistoryAsync(employeeId);
        return View(history);
    }

    [HttpPost]
    public async Task<IActionResult> ApplyLeave(LeaveApplicationViewModel model)
    {
        var employeeId = GetCurrentEmployeeId();
        if (ModelState.IsValid)
        {
            await _employeeService.ApplyLeaveAsync(employeeId, model);
            return RedirectToAction(nameof(Leaves));
        }
        return View("Leaves", await _employeeService.GetLeaveHistoryAsync(employeeId));
    }

    public async Task<IActionResult> Salary()
    {
        var employeeId = GetCurrentEmployeeId();
        ViewBag.Details = await _employeeService.GetSalaryDetailsAsync(employeeId);
        var history = await _employeeService.GetSalaryHistoryAsync(employeeId);
        return View(history);
    }

    public async Task<IActionResult> Documents()
    {
        var employeeId = GetCurrentEmployeeId();
        var docs = await _employeeService.GetDocumentsAsync(employeeId);
        return View(docs);
    }

    public async Task<IActionResult> Activity()
    {
        var employeeId = GetCurrentEmployeeId();
        var logs = await _employeeService.GetRecentActivitiesAsync(employeeId);
        return View(logs);
    }
}
