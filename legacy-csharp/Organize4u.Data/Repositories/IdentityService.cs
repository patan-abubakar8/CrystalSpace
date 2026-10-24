using Microsoft.AspNetCore.Identity;
using Organize4u.Core.Interfaces;

namespace Organize4u.Data.Repositories;

public class IdentityService : IIdentityService
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public IdentityService(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<(bool Succeeded, string UserId)> CreateUserAsync(string email, string password, string role)
    {
        var user = new IdentityUser { UserName = email, Email = email };
        var result = await _userManager.CreateAsync(user, password);

        if (result.Succeeded)
        {
            if (!await _roleManager.RoleExistsAsync(role))
            {
                await _roleManager.CreateAsync(new IdentityRole(role));
            }
            await _userManager.AddToRoleAsync(user, role);
            return (true, user.Id);
        }

        return (false, string.Empty);
    }

    public async Task<bool> IsInRoleAsync(string userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId);
        return user != null && await _userManager.IsInRoleAsync(user, role);
    }

    public async Task<IEnumerable<string>> GetRolesForUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return Enumerable.Empty<string>();
        return await _userManager.GetRolesAsync(user);
    }

    public async Task<IEnumerable<string>> GetAvailableRolesAsync(string currentUserRole)
    {
        var allRoles = new[] { "SuperAdmin", "HR", "Manager", "Team Leader", "Employee", "HR Assistant" };
        
        if (currentUserRole == "SuperAdmin")
        {
            return allRoles;
        }
        else if (currentUserRole == "HR")
        {
            return new[] { "Manager", "Team Leader", "Employee", "HR Assistant" };
        }
        
        return new[] { "Employee" };
    }

    public async Task<bool> AuthorizeAsync(string userId, string policyName)
    {
        // For simplicity, we can extend this for policy-based authorization later
        return true; 
    }

    public async Task<bool> SeedAdminUserAsync(string email, string password, string role)
    {
        if (!await _roleManager.RoleExistsAsync(role))
        {
            await _roleManager.CreateAsync(new IdentityRole(role));
        }

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new IdentityUser { UserName = email, Email = email, EmailConfirmed = true };
            var result = await _userManager.CreateAsync(user, password);
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, role);
                return true;
            }
        }
        return false;
    }
}
