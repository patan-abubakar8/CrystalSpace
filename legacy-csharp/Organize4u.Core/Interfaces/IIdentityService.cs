namespace Organize4u.Core.Interfaces;

public interface IIdentityService
{
    Task<(bool Succeeded, string UserId)> CreateUserAsync(string email, string password, string role);
    Task<bool> IsInRoleAsync(string userId, string role);
    Task<IEnumerable<string>> GetRolesForUserAsync(string userId);
    Task<IEnumerable<string>> GetAvailableRolesAsync(string currentUserRole);
    Task<bool> AuthorizeAsync(string userId, string policyName);
    Task<bool> SeedAdminUserAsync(string email, string password, string role);
}
