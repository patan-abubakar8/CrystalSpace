using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Organize4u.Core.Models;
using Organize4u.Data;

namespace Organize4u.Web.Data;

public static class SeedData
{
    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        using (var context = new ApplicationDbContext(
            serviceProvider.GetRequiredService<DbContextOptions<ApplicationDbContext>>()))
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            // Seed Roles
            string[] roles = { "SuperAdmin", "HR", "Manager", "Employee" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // Seed SuperAdmin
            var superAdminEmail = "superadmin@organize.com";
            var superAdmin = await userManager.FindByEmailAsync(superAdminEmail);
            if (superAdmin == null)
            {
                superAdmin = new IdentityUser { UserName = superAdminEmail, Email = superAdminEmail, EmailConfirmed = true };
                await userManager.CreateAsync(superAdmin, "Admin@123");
                await userManager.AddToRoleAsync(superAdmin, "SuperAdmin");
                await userManager.AddToRoleAsync(superAdmin, "Employee");
            }

            // Seed HR User
            var hrEmail = "hr@organize.com";
            var hrUser = await userManager.FindByEmailAsync(hrEmail);
            if (hrUser == null)
            {
                hrUser = new IdentityUser { UserName = hrEmail, Email = hrEmail, EmailConfirmed = true };
                await userManager.CreateAsync(hrUser, "HR@123");
                await userManager.AddToRoleAsync(hrUser, "HR");
                await userManager.AddToRoleAsync(hrUser, "Employee");
            }

            // Seed Departments individually to ensure required ones exist
            var departmentNames = new[] { "Human Resources", "Engineering", "Sales", "Administration" };
            foreach (var name in departmentNames)
            {
                if (!await context.Departments.AnyAsync(d => d.Name == name))
                {
                    context.Departments.Add(new Department { Name = name, Description = $"{name} Department" });
                }
            }
            await context.SaveChangesAsync();

            var adminDept = await context.Departments.FirstAsync(d => d.Name == "Administration");
            var hrDept = await context.Departments.FirstAsync(d => d.Name == "Human Resources");

            // Ensure SuperAdmin is an employee
            if (!context.Employees.Any(e => e.Email == superAdminEmail))
            {
                context.Employees.Add(new Employee
                {
                    FirstName = "System", LastName = "Admin", Email = superAdminEmail,
                    Designation = "Super Administrator", DepartmentId = adminDept.Id,
                    EmployeeCode = "ADM-001", IdentityUserId = superAdmin.Id,
                    JoiningDate = DateTime.Today, IsActive = true
                });
            }

            // Ensure HR is an employee
            if (!context.Employees.Any(e => e.Email == hrEmail))
            {
                context.Employees.Add(new Employee
                {
                    FirstName = "Jane", LastName = "Doe", Email = hrEmail,
                    Designation = "HR Manager", DepartmentId = hrDept.Id,
                    EmployeeCode = "HR-001", IdentityUserId = hrUser.Id,
                    JoiningDate = DateTime.Today, IsActive = true
                });
            }
            await context.SaveChangesAsync();

            if (!context.LeaveTypes.Any())
            {
                context.LeaveTypes.AddRange(
                    new LeaveType { Name = "Sick Leave", DefaultAllocation = 10 },
                    new LeaveType { Name = "Annual Leave", DefaultAllocation = 20 },
                    new LeaveType { Name = "Casual Leave", DefaultAllocation = 5 }
                );
                await context.SaveChangesAsync();
            }

            if (!context.Employees.Any())
            {
                var engDept = await context.Departments.FirstAsync(d => d.Name == "Engineering");
                var salesDept = await context.Departments.FirstAsync(d => d.Name == "Sales");

                context.Employees.AddRange(
                    new Employee 
                    { 
                        FirstName = "Ahmed", LastName = "Khan", Email = "ahmed.k@organize.com", 
                        Designation = "Senior Software Engineer", DepartmentId = engDept.Id, 
                        EmployeeCode = "EMP-1024", Skills = "React.js, Node.js, TypeScript, PostgreSQL, AWS, Docker, System Architecture",
                        JoiningDate = new DateTime(2020, 1, 15),
                        OfficeLocation = "Karachi",
                        PersonalDetail = new EmployeePersonalDetail
                        {
                            DateOfBirth = new DateTime(1990, 5, 14), Gender = "Male", MaritalStatus = "Married",
                            Nationality = "Pakistani", Address = "House #123, Street 4, DHA Phase 5, Karachi",
                            City = "Karachi", Country = "Pakistan"
                        },
                        ProfessionalDetail = new EmployeeProfessionalDetail
                        {
                            PerformanceScore = 4.8, BaseSalary = 85000, HousingAllowance = 5000, PerformanceBonusPercentage = 10
                        }
                    },
                    new Employee 
                    { 
                        FirstName = "Alex", LastName = "Rivera", Email = "alex.rivera@organize.com", 
                        Designation = "Senior Software Engineer", DepartmentId = engDept.Id, 
                        EmployeeCode = "EMP-1025", Skills = "Java, Spring Boot, Microservices, Kubernetes",
                        JoiningDate = new DateTime(2019, 6, 10),
                        OfficeLocation = "San Francisco",
                        PersonalDetail = new EmployeePersonalDetail
                        {
                            DateOfBirth = new DateTime(1988, 3, 22), Gender = "Male", MaritalStatus = "Single",
                            Nationality = "American", Address = "123 Market St, SF",
                            City = "San Francisco", Country = "USA"
                        },
                        ProfessionalDetail = new EmployeeProfessionalDetail
                        {
                            PerformanceScore = 4.5, BaseSalary = 95000, HousingAllowance = 6000, PerformanceBonusPercentage = 8
                        }
                    },
                    new Employee 
                    { 
                        FirstName = "Sarah", LastName = "Chen", Email = "sarah.chen@organize.com", 
                        Designation = "Product Marketing Manager", DepartmentId = salesDept.Id, 
                        EmployeeCode = "EMP-1026", Skills = "SEO, Content Strategy, Brand Management",
                        JoiningDate = new DateTime(2021, 2, 1),
                        OfficeLocation = "New York",
                        PersonalDetail = new EmployeePersonalDetail
                        {
                            DateOfBirth = new DateTime(1992, 11, 5), Gender = "Female", MaritalStatus = "Married",
                            Nationality = "Chinese-American", Address = "456 Madison Ave, NY",
                            City = "New York", Country = "USA"
                        },
                        ProfessionalDetail = new EmployeeProfessionalDetail
                        {
                            PerformanceScore = 4.9, BaseSalary = 80000, HousingAllowance = 4000, PerformanceBonusPercentage = 12
                        }
                    }
                );

                await context.SaveChangesAsync();
            }
        }
    }
}
