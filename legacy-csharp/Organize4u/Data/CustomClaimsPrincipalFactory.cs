using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Organize4u.Core.Models;

namespace Organize4u.Data;

public class CustomClaimsPrincipalFactory : UserClaimsPrincipalFactory<IdentityUser, IdentityRole>
{
    private readonly ApplicationDbContext _context;

    public CustomClaimsPrincipalFactory(
        UserManager<IdentityUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IOptions<IdentityOptions> options,
        ApplicationDbContext context)
        : base(userManager, roleManager, options)
    {
        _context = context;
    }

    protected override async Task<ClaimsIdentity> GenerateClaimsAsync(IdentityUser user)
    {
        var identity = await base.GenerateClaimsAsync(user);

        // Find the employee record associated with this user
        var employee = _context.Employees.FirstOrDefault(e => e.IdentityUserId == user.Id);
        
        if (employee != null)
        {
            // Add EmployeeId claim
            identity.AddClaim(new Claim("EmployeeId", employee.Id.ToString()));
            
            // Optionally add other useful claims
            identity.AddClaim(new Claim("EmployeeCode", employee.EmployeeCode ?? ""));
            identity.AddClaim(new Claim("FullName", $"{employee.FirstName} {employee.LastName}"));
        }

        return identity;
    }
}
