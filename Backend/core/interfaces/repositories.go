package interfaces

import (
	"context"

	"crystalspace/backend/core/models"
)

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
