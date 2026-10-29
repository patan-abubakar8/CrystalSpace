package models

import "time"

// Employee represents an organization member profile.
type Employee struct {
	ID                 int                 `json:"id"`
	UserID             string              `json:"user_id"`
	FirstName          string              `json:"first_name"`
	MiddleName         string              `json:"middle_name,omitempty"`
	LastName           string              `json:"last_name"`
	Email              string              `json:"email"`
	PersonalEmail      string              `json:"personal_email,omitempty"`
	PhoneNumber        string              `json:"phone_number"`
	AlternatePhone     string              `json:"alternate_phone,omitempty"`
	Designation        string              `json:"designation"`
	JobTitle           string              `json:"job_title,omitempty"`
	DepartmentID       int                 `json:"department_id"`
	DepartmentName     string              `json:"department_name,omitempty"`
	ManagerID          *int                `json:"manager_id,omitempty"`
	EmployeeCode       string              `json:"employee_code"`
	OfficeLocation     string              `json:"office_location"`
	WorkLocation       string              `json:"work_location,omitempty"`
	DateOfJoining      time.Time           `json:"date_of_joining"`
	Status             string              `json:"status"` // Active, OnLeave, Resigned, Terminated
	OnboardingStatus   string              `json:"onboarding_status,omitempty"`
	PersonalDetail     *PersonalDetail     `json:"personal_detail,omitempty"`
	EmergencyContact   *EmergencyContact   `json:"emergency_contact,omitempty"`
	ProfessionalDetail *ProfessionalDetail `json:"professional_detail,omitempty"`
	CreatedAt          time.Time           `json:"created_at"`
	UpdatedAt          time.Time           `json:"updated_at"`
}

type PersonalDetail struct {
	ID               int        `json:"id"`
	EmployeeID       int        `json:"employee_id"`
	DateOfBirth      *time.Time `json:"date_of_birth,omitempty"`
	Gender           string     `json:"gender"`
	MaritalStatus    string     `json:"marital_status"`
	BloodGroup       string     `json:"blood_group"`
	Address          string     `json:"address"`
	PermanentAddress string     `json:"permanent_address,omitempty"`
	City             string     `json:"city"`
	State            string     `json:"state"`
	PostalCode       string     `json:"postal_code"`
	Country          string     `json:"country"`
	PersonalEmail    string     `json:"personal_email,omitempty"`
	AlternatePhone   string     `json:"alternate_phone,omitempty"`
}

type EmergencyContact struct {
	ID             int    `json:"id"`
	EmployeeID     int    `json:"employee_id"`
	ContactName    string `json:"contact_name"`
	Relationship   string `json:"relationship"`
	Phone          string `json:"phone"`
	AlternatePhone string `json:"alternate_phone,omitempty"`
}

type ProfessionalDetail struct {
	ID                   int     `json:"id"`
	EmployeeID           int     `json:"employee_id"`
	EmploymentType       string  `json:"employment_type"` // FullTime, PartTime, Contractor, Intern
	WorkMode             string  `json:"work_mode"`       // Remote, Hybrid, Onsite
	TotalExperienceYears float64 `json:"total_experience_years"`
	PreviousEmployer     string  `json:"previous_employer,omitempty"`
	Skills               string  `json:"skills,omitempty"`
}

// EmployeeFilter defines search, filtering, sorting and pagination parameters.
type EmployeeFilter struct {
	DepartmentID   *int   `json:"department_id,omitempty"`
	Status         string `json:"status,omitempty"`
	Designation    string `json:"designation,omitempty"`
	SearchQuery    string `json:"search_query,omitempty"`
	OfficeLocation string `json:"office_location,omitempty"`
	SortBy         string `json:"sort_by,omitempty"`
	SortDir        string `json:"sort_dir,omitempty"`
	Page           int    `json:"page"`
	PageSize       int    `json:"page_size"`
}
