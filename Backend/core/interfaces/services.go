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

type EmployeeOnboardingService interface {
	CreateDraft(ctx context.Context, actor models.Actor, req dto.CreateEmployeeDraftRequest) (*dto.EmployeeDraftResponse, error)
	GetDraft(ctx context.Context, actor models.Actor, id int) (*dto.EmployeeDraftResponse, error)
	ListDrafts(ctx context.Context, actor models.Actor, filter models.EmployeeDraftFilter) ([]*models.EmployeeDraftSummary, int, error)
	SaveSection(ctx context.Context, actor models.Actor, id int, section string, req dto.SaveDraftSectionRequest) (*dto.EmployeeDraftResponse, error)
	UpdateDraft(ctx context.Context, actor models.Actor, id int, req dto.UpdateDraftRequest) (*dto.EmployeeDraftResponse, error)
	DeleteDraft(ctx context.Context, actor models.Actor, id int) error
	ValidateDraft(ctx context.Context, actor models.Actor, id int) (*models.DraftValidation, error)
	SubmitDraft(ctx context.Context, actor models.Actor, id int, req models.SubmitDraftRequest) (*dto.DraftSubmitResult, error)
	ReferenceData(ctx context.Context, actor models.Actor) (*dto.OnboardingReferenceData, error)
	History(ctx context.Context, actor models.Actor, employeeID int) ([]*models.EmployeeAuditLog, error)
	Extras(ctx context.Context, actor models.Actor, employeeID int) (*models.EmployeeExtras, error)
	AuditEmployeeAction(ctx context.Context, actor models.Actor, employeeID int, action, section, summary string)
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

type AttendanceService interface {
	Punch(ctx context.Context, employeeID int, req dto.PunchRequest) (*models.Attendance, error)
	GetToday(ctx context.Context, employeeID int) (*dto.AttendanceTodayResponse, error)
	GetHeatmap(ctx context.Context, employeeID int, months int) ([]dto.HeatmapCell, error)
	GetSummary(ctx context.Context, employeeID int, days int) (*dto.AttendanceSummaryResponse, error)
	ListRecords(ctx context.Context, filter models.AttendanceFilter) ([]*models.Attendance, int, error)
	GetTodayOverview(ctx context.Context) (*dto.OrgAttendanceTodayOverview, error)
}
