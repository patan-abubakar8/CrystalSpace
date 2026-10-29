package dto

import (
	"encoding/json"
	"time"

	"crystalspace/backend/core/models"
)

// Auth DTOs
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	AccessToken string       `json:"access_token"`
	TokenType   string       `json:"token_type"`
	ExpiresIn   int64        `json:"expires_in"`
	User        *models.User `json:"user"`
}

type UserProfileResponse struct {
	User     *models.User     `json:"user"`
	Employee *models.Employee `json:"employee,omitempty"`
}

// Employee DTOs
type CreateEmployeeRequest struct {
	UserID               string     `json:"user_id,omitempty"`
	FirstName            string     `json:"first_name"`
	LastName             string     `json:"last_name"`
	Email                string     `json:"email"`
	PhoneNumber          string     `json:"phone_number"`
	Designation          string     `json:"designation"`
	DepartmentID         int        `json:"department_id"`
	ManagerID            *int       `json:"manager_id,omitempty"`
	EmployeeCode         string     `json:"employee_code"`
	OfficeLocation       string     `json:"office_location"`
	DateOfJoining        time.Time  `json:"date_of_joining"`
	Status               string     `json:"status"`
	CreateUserAccount    bool       `json:"create_user_account"`
	InitialPassword      string     `json:"initial_password,omitempty"`
	Role                 string     `json:"role,omitempty"`
	DateOfBirth          *time.Time `json:"date_of_birth,omitempty"`
	Gender               string     `json:"gender,omitempty"`
	MaritalStatus        string     `json:"marital_status,omitempty"`
	BloodGroup           string     `json:"blood_group,omitempty"`
	Address              string     `json:"address,omitempty"`
	City                 string     `json:"city,omitempty"`
	State                string     `json:"state,omitempty"`
	PostalCode           string     `json:"postal_code,omitempty"`
	Country              string     `json:"country,omitempty"`
	EmergencyContactName string     `json:"emergency_contact_name,omitempty"`
	EmergencyRelation    string     `json:"emergency_relationship,omitempty"`
	EmergencyPhone       string     `json:"emergency_phone,omitempty"`
	EmploymentType       string     `json:"employment_type,omitempty"`
	WorkMode             string     `json:"work_mode,omitempty"`
	TotalExperience      float64    `json:"total_experience_years,omitempty"`
	PreviousEmployer     string     `json:"previous_employer,omitempty"`
	Skills               string     `json:"skills,omitempty"`
}

type UpdateEmployeeRequest struct {
	FirstName      string `json:"first_name"`
	LastName       string `json:"last_name"`
	PhoneNumber    string `json:"phone_number"`
	Designation    string `json:"designation"`
	DepartmentID   int    `json:"department_id"`
	ManagerID      *int   `json:"manager_id,omitempty"`
	OfficeLocation string `json:"office_location"`
	Status         string `json:"status"`
	Skills         string `json:"skills,omitempty"`
}

// Employee onboarding DTOs
type CreateEmployeeDraftRequest struct {
	CurrentStep int `json:"current_step"`
}

type SaveDraftSectionRequest struct {
	Version     int             `json:"version"`
	CurrentStep int             `json:"current_step"`
	Data        json.RawMessage `json:"data"`
}

type UpdateDraftRequest struct {
	Version     int    `json:"version"`
	CurrentStep int    `json:"current_step"`
	Status      string `json:"status,omitempty"`
}

// EmployeeDraftPermissions tells the client which sections and actions to expose.
// It is advisory only; every operation is re-checked on the server.
type EmployeeDraftPermissions struct {
	CanUpdate        bool `json:"can_update"`
	CanDelete        bool `json:"can_delete"`
	CanSubmit        bool `json:"can_submit"`
	CompensationView bool `json:"compensation_view"`
	CompensationEdit bool `json:"compensation_edit"`
	DocumentsView    bool `json:"documents_view"`
	DocumentsUpload  bool `json:"documents_upload"`
	DocumentsVerify  bool `json:"documents_verify"`
	AssetsView       bool `json:"assets_view"`
	AssetsAssign     bool `json:"assets_assign"`
	AccessView       bool `json:"access_view"`
	AccessManage     bool `json:"access_manage"`
	HistoryView      bool `json:"history_view"`
	IsOwner          bool `json:"is_owner"`
}

type EmployeeDraftResponse struct {
	Draft       *models.EmployeeDraft    `json:"draft"`
	Permissions EmployeeDraftPermissions `json:"permissions"`
	Validation  *models.DraftValidation  `json:"validation,omitempty"`
}

type OnboardingReferenceData struct {
	DocumentTypes      []*models.DocumentType `json:"document_types"`
	WorkSchedules      []*models.WorkSchedule `json:"work_schedules"`
	LeavePolicies      []*models.LeavePolicy  `json:"leave_policies"`
	LeaveTypes         []*models.LeaveType    `json:"leave_types"`
	Roles              []string               `json:"roles"`
	Assets             []*models.Asset        `json:"assets"`
	EmploymentTypes    []string               `json:"employment_types"`
	WorkModes          []string               `json:"work_modes"`
	EmploymentStatuses []string               `json:"employment_statuses"`
}

type DraftSubmitResult struct {
	EmployeeID         int    `json:"employee_id"`
	EmployeeCode       string `json:"employee_code"`
	DraftID            int    `json:"draft_id"`
	AccountProvisioned bool   `json:"account_provisioned"`
	// TemporaryPassword is returned exactly once when the server generated one.
	TemporaryPassword string `json:"temporary_password,omitempty"`
}

// Department DTOs
type CreateDepartmentRequest struct {
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	Code        string `json:"code"`
	ManagerID   *int   `json:"manager_id,omitempty"`
}

type UpdateDepartmentRequest struct {
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	Code        string `json:"code"`
	ManagerID   *int   `json:"manager_id,omitempty"`
}

// Leave DTOs
type ApplyLeaveRequest struct {
	LeaveTypeID int       `json:"leave_type_id"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	TotalDays   float64   `json:"total_days"`
	Reason      string    `json:"reason"`
}

type ReviewLeaveRequest struct {
	Status          models.LeaveStatus `json:"status"` // Approved, Rejected
	RejectionReason string             `json:"rejection_reason,omitempty"`
}

// Salary DTOs
type SalaryRequest struct {
	BasicSalary      float64 `json:"basic_salary"`
	HRA              float64 `json:"hra"`
	Conveyance       float64 `json:"conveyance"`
	MedicalAllowance float64 `json:"medical_allowance"`
	SpecialAllowance float64 `json:"special_allowance"`
	ProvidentFund    float64 `json:"provident_fund"`
	ProfessionalTax  float64 `json:"professional_tax"`
	TDS              float64 `json:"tds"`
	EffectiveDate    string  `json:"effective_date"`
	RevisionReason   string  `json:"revision_reason,omitempty"`
}

// Project DTOs
type CreateProjectRequest struct {
	Name        string     `json:"name"`
	Description string     `json:"description,omitempty"`
	StartDate   time.Time  `json:"start_date"`
	EndDate     *time.Time `json:"end_date,omitempty"`
	Status      string     `json:"status"`
}

type CreateTaskRequest struct {
	ProjectID            int        `json:"project_id"`
	Title                string     `json:"title"`
	Description          string     `json:"description,omitempty"`
	Priority             string     `json:"priority"`
	AssignedToEmployeeID *int       `json:"assigned_to_employee_id,omitempty"`
	DueDate              *time.Time `json:"due_date,omitempty"`
}

// Dashboard DTO
type DashboardStats struct {
	TotalEmployees   int `json:"total_employees"`
	ActiveLeaves     int `json:"active_leaves"`
	TotalDepartments int `json:"total_departments"`
	TotalProjects    int `json:"total_projects"`
}

// Role & Permission DTOs
type CreateRoleRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type PagePermissionDTO struct {
	Page      string `json:"page"`
	CanView   bool   `json:"can_view"`
	CanCreate bool   `json:"can_create"`
	CanUpdate bool   `json:"can_update"`
	CanDelete bool   `json:"can_delete"`
}

type UpdateRolePermissionsRequest struct {
	Role        string              `json:"role"`
	Permissions []PagePermissionDTO `json:"permissions"`
}

// Attendance DTOs
type PunchRequest struct {
	Action   string `json:"action"`              // "in", "out", "toggle"
	WorkMode string `json:"work_mode,omitempty"` // "Office", "Remote", "Field"
	Notes    string `json:"notes,omitempty"`
}

type AttendanceTodayResponse struct {
	Attendance    *models.Attendance `json:"attendance,omitempty"`
	IsClockedIn   bool               `json:"is_clocked_in"`
	ActiveSeconds int64              `json:"active_seconds"`
	TodayDate     string             `json:"today_date"`
	CanPunch      bool               `json:"can_punch"`
}

type HeatmapCell struct {
	Date       string  `json:"date"`        // YYYY-MM-DD
	TotalHours float64 `json:"total_hours"` // 8.25
	Level      int     `json:"level"`       // 0 to 4
	Status     string  `json:"status"`      // Present, Late, HalfDay, Absent, OnLeave
	ClockIn    string  `json:"clock_in"`
	ClockOut   string  `json:"clock_out"`
	WorkMode   string  `json:"work_mode"`
}

type AttendanceSummaryResponse struct {
	AttendanceRate     float64       `json:"attendance_rate"`
	AvgDailyHours      float64       `json:"avg_daily_hours"`
	OnTimeArrivalRate  float64       `json:"on_time_arrival_rate"`
	TotalWorkDays      int           `json:"total_work_days"`
	TotalPresentDays   int           `json:"total_present_days"`
	TotalLateDays      int           `json:"total_late_days"`
	TotalLeaveDays     int           `json:"total_leave_days"`
	TotalHours         float64       `json:"total_hours"`
	TotalOvertimeHours float64       `json:"total_overtime_hours"`
	DailyTrends        []HeatmapCell `json:"daily_trends"`
}

type OrgAttendanceTodayOverview struct {
	TotalEmployees int `json:"total_employees"`
	PresentCount   int `json:"present_count"`
	LateCount      int `json:"late_count"`
	OnLeaveCount   int `json:"on_leave_count"`
	AbsentCount    int `json:"absent_count"`
}
