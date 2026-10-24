package dto

import (
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
