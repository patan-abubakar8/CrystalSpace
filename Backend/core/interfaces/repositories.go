package interfaces

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/models"
)

// ErrVersionConflict signals optimistic-concurrency failure on a draft.
var ErrVersionConflict = errors.New("record was modified by another session")

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id string) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
}

type DepartmentRepository interface {
	Create(ctx context.Context, dept *models.Department) error
	GetByID(ctx context.Context, id int) (*models.Department, error)
	List(ctx context.Context) ([]*models.Department, error)
	Update(ctx context.Context, dept *models.Department) error
	Delete(ctx context.Context, id int) error
}

type EmployeeRepository interface {
	Create(ctx context.Context, emp *models.Employee) error
	GetByID(ctx context.Context, id int) (*models.Employee, error)
	GetByUserID(ctx context.Context, userID string) (*models.Employee, error)
	List(ctx context.Context, filter models.EmployeeFilter) ([]*models.Employee, int, error)
	Update(ctx context.Context, emp *models.Employee) error
	Delete(ctx context.Context, id int) error
	Count(ctx context.Context) (int, error)
}

type LeaveRepository interface {
	Create(ctx context.Context, leave *models.Leave) error
	GetByID(ctx context.Context, id int) (*models.Leave, error)
	ListByEmployeeID(ctx context.Context, employeeID int) ([]*models.Leave, error)
	ListPending(ctx context.Context) ([]*models.Leave, error)
	UpdateStatus(ctx context.Context, id int, status models.LeaveStatus, reviewerID string, rejectionReason string) error
	ListLeaveTypes(ctx context.Context) ([]*models.LeaveType, error)
	GetBalances(ctx context.Context, employeeID int) ([]*models.LeaveBalance, error)
	CountActive(ctx context.Context) (int, error)
}

type SalaryRepository interface {
	GetByEmployeeID(ctx context.Context, employeeID int) (*models.Salary, error)
	Upsert(ctx context.Context, salary *models.Salary) error
	RecordHistory(ctx context.Context, history *models.SalaryHistory) error
	GetHistory(ctx context.Context, employeeID int) ([]*models.SalaryHistory, error)
}

type ProjectRepository interface {
	CreateProject(ctx context.Context, p *models.Project) error
	GetProjectByID(ctx context.Context, id int) (*models.Project, error)
	ListProjects(ctx context.Context) ([]*models.Project, error)
	CreateTask(ctx context.Context, t *models.TaskItem) error
	ListTasksByProject(ctx context.Context, projectID int) ([]*models.TaskItem, error)
	UpdateTaskStatus(ctx context.Context, taskID int, status models.TaskStatus) error
}

type DocumentRepository interface {
	Upload(ctx context.Context, doc *models.EmployeeDocument) error
	GetByID(ctx context.Context, id int) (*models.EmployeeDocument, error)
	ListByEmployeeID(ctx context.Context, employeeID int) ([]*models.EmployeeDocument, error)
	Delete(ctx context.Context, id int) error
}

// SubmitOptions carries server-side only submission settings (never sent by the client).
type SubmitOptions struct {
	CreateAccount bool
	PasswordHash  string
	Roles         []string
	Actor         models.Actor
}

type EmployeeOnboardingRepository interface {
	CreateDraft(ctx context.Context, draft *models.EmployeeDraft) error
	GetDraft(ctx context.Context, id int) (*models.EmployeeDraft, error)
	ListDrafts(ctx context.Context, filter models.EmployeeDraftFilter) ([]*models.EmployeeDraftSummary, int, error)
	SaveDraft(ctx context.Context, id int, payload json.RawMessage, completedSections []string, currentStep int, version int, displayName string, employeeCode string) (*models.EmployeeDraft, error)
	UpdateDraftMeta(ctx context.Context, id int, status string, currentStep int, version int) (*models.EmployeeDraft, error)
	DeleteDraft(ctx context.Context, id int) error
	SubmitDraft(ctx context.Context, draft *models.EmployeeDraft, payload *models.EmployeeDraftPayload, opts SubmitOptions) (int, error)

	Audit(ctx context.Context, log *models.EmployeeAuditLog) error
	ListAudit(ctx context.Context, employeeID int) ([]*models.EmployeeAuditLog, error)
	ListDocuments(ctx context.Context, employeeID int) ([]*models.EmployeeDocumentRecord, error)
	ListAssetAssignments(ctx context.Context, employeeID int) ([]*models.EmployeeAssetAssignment, error)
	ListLeaveAllocations(ctx context.Context, employeeID int) ([]*models.EmployeeLeaveAllocation, error)
	GetAccess(ctx context.Context, employeeID int) (*models.EmployeeAccessInfo, error)

	ListDocumentTypes(ctx context.Context) ([]*models.DocumentType, error)
	ListWorkSchedules(ctx context.Context) ([]*models.WorkSchedule, error)
	ListLeavePolicies(ctx context.Context) ([]*models.LeavePolicy, error)
	ListAssets(ctx context.Context) ([]*models.Asset, error)

	EmployeeEmailTaken(ctx context.Context, email string, excludeID int) (bool, error)
	EmployeeCodeTaken(ctx context.Context, code string) (bool, error)
	NextEmployeeCode(ctx context.Context) (string, error)
	RoleExists(ctx context.Context, role string) (bool, error)
}

type PermissionRepository interface {
	ListRoles(ctx context.Context) ([]*models.Role, error)
	CreateRole(ctx context.Context, role *models.Role) error
	DeleteRole(ctx context.Context, roleName string) error
	GetRolePermissions(ctx context.Context, role string) ([]*models.PagePermission, error)
	GetAllPermissions(ctx context.Context) ([]*models.PagePermission, error)
	UpdateRolePermissions(ctx context.Context, role string, perms []models.PagePermission) error
	HasPermission(ctx context.Context, role string, page string, action string) (bool, error)
	InvalidateCache()
}

type AttendanceRepository interface {
	PunchIn(ctx context.Context, att *models.Attendance) error
	PunchOut(ctx context.Context, id int, clockOut time.Time, totalMinutes int, status models.AttendanceStatus, notes string) error
	GetTodayByEmployeeID(ctx context.Context, employeeID int, date time.Time) (*models.Attendance, error)
	GetByID(ctx context.Context, id int) (*models.Attendance, error)
	List(ctx context.Context, filter models.AttendanceFilter) ([]*models.Attendance, int, error)
	GetRangeByEmployee(ctx context.Context, employeeID int, startDate, endDate time.Time) ([]*models.Attendance, error)
	GetTodayOverview(ctx context.Context, date time.Time) (*dto.OrgAttendanceTodayOverview, error)
}
