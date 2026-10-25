package interfaces

import (
	"context"

	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/models"
)

type AuthService interface {
	Register(ctx context.Context, req dto.RegisterRequest) (*dto.AuthResponse, error)
	Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error)
	GetProfile(ctx context.Context, userID string) (*dto.UserProfileResponse, error)
}

type EmployeeService interface {
	Create(ctx context.Context, req dto.CreateEmployeeRequest) (*models.Employee, error)
	GetByID(ctx context.Context, id int) (*models.Employee, error)
	List(ctx context.Context, filter models.EmployeeFilter) ([]*models.Employee, int, error)
	Update(ctx context.Context, id int, req dto.UpdateEmployeeRequest) (*models.Employee, error)
	Delete(ctx context.Context, id int) error
}

type DepartmentService interface {
	Create(ctx context.Context, req dto.CreateDepartmentRequest) (*models.Department, error)
	GetByID(ctx context.Context, id int) (*models.Department, error)
	List(ctx context.Context) ([]*models.Department, error)
	Update(ctx context.Context, id int, req dto.UpdateDepartmentRequest) (*models.Department, error)
	Delete(ctx context.Context, id int) error
}

type LeaveService interface {
	Apply(ctx context.Context, employeeID int, req dto.ApplyLeaveRequest) (*models.Leave, error)
	ListMyLeaves(ctx context.Context, employeeID int) ([]*models.Leave, error)
	ListPending(ctx context.Context) ([]*models.Leave, error)
	ReviewLeave(ctx context.Context, id int, reviewerID string, req dto.ReviewLeaveRequest) error
	ListLeaveTypes(ctx context.Context) ([]*models.LeaveType, error)
	GetBalances(ctx context.Context, employeeID int) ([]*models.LeaveBalance, error)
}

type SalaryService interface {
	GetByEmployeeID(ctx context.Context, employeeID int) (*models.Salary, error)
	CalculateAndSave(ctx context.Context, employeeID int, req dto.SalaryRequest, revisedBy string) (*models.Salary, error)
	GetHistory(ctx context.Context, employeeID int) ([]*models.SalaryHistory, error)
}

type ProjectService interface {
	CreateProject(ctx context.Context, req dto.CreateProjectRequest) (*models.Project, error)
	ListProjects(ctx context.Context) ([]*models.Project, error)
	CreateTask(ctx context.Context, req dto.CreateTaskRequest) (*models.TaskItem, error)
	ListTasks(ctx context.Context, projectID int) ([]*models.TaskItem, error)
	UpdateTaskStatus(ctx context.Context, taskID int, status models.TaskStatus) error
}

type DashboardService interface {
	GetStats(ctx context.Context) (*dto.DashboardStats, error)
}

type PermissionService interface {
	GetMyPermissions(ctx context.Context, role string) (map[string]*models.PagePermission, error)
	ListRolesWithPermissions(ctx context.Context) ([]*models.RolePermissionsMatrix, error)
	UpdateRolePermissions(ctx context.Context, req dto.UpdateRolePermissionsRequest) error
	CreateRole(ctx context.Context, req dto.CreateRoleRequest) (*models.Role, error)
	DeleteRole(ctx context.Context, roleName string) error
}
