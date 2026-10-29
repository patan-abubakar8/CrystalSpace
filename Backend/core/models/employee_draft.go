package models

import (
	"encoding/json"
	"time"
)

// Employee draft lifecycle. These are onboarding states and are deliberately
// independent from the employee's employment status.
const (
	DraftStatusDraft              = "Draft"
	DraftStatusReadyForReview     = "ReadyForReview"
	DraftStatusPendingApproval    = "PendingApproval"
	DraftStatusOnboardingProgress = "OnboardingInProgress"
	DraftStatusActive             = "Active"
	DraftStatusConverted          = "Converted"
	DraftStatusDiscarded          = "Discarded"
)

// Onboarding section identifiers used by the wizard, progress tracking and
// permission checks.
const (
	DraftSectionPersonal     = "personal"
	DraftSectionEmployment   = "employment"
	DraftSectionCompensation = "compensation"
	DraftSectionSchedule     = "schedule"
	DraftSectionDocuments    = "documents"
	DraftSectionDevices      = "devices"
	DraftSectionReview       = "review"
)

// EmployeeDraft is an in-progress employee record. Nothing is written to the
// employees table until the draft is submitted.
type EmployeeDraft struct {
	ID                  int             `json:"id"`
	DraftRef            string          `json:"draft_ref"`
	OwnerUserID         string          `json:"owner_user_id"`
	OwnerEmail          string          `json:"owner_email"`
	OwnerName           string          `json:"owner_name"`
	Status              string          `json:"status"`
	CurrentStep         int             `json:"current_step"`
	Version             int             `json:"version"`
	DisplayName         string          `json:"display_name"`
	EmployeeCode        string          `json:"employee_code,omitempty"`
	Payload             json.RawMessage `json:"payload"`
	CompletedSections   []string        `json:"completed_sections"`
	SubmittedEmployeeID *int            `json:"submitted_employee_id,omitempty"`
	LastSavedAt         time.Time       `json:"last_saved_at"`
	CreatedAt           time.Time       `json:"created_at"`
	UpdatedAt           time.Time       `json:"updated_at"`
}

// EmployeeDraftSummary is the lightweight list projection used by the drafts view.
type EmployeeDraftSummary struct {
	ID                int       `json:"id"`
	DraftRef          string    `json:"draft_ref"`
	DisplayName       string    `json:"display_name"`
	EmployeeCode      string    `json:"employee_code,omitempty"`
	Status            string    `json:"status"`
	CurrentStep       int       `json:"current_step"`
	CompletedSections []string  `json:"completed_sections"`
	OwnerEmail        string    `json:"owner_email"`
	OwnerName         string    `json:"owner_name"`
	OwnerUserID       string    `json:"owner_user_id"`
	LastSavedAt       time.Time `json:"last_saved_at"`
	CreatedAt         time.Time `json:"created_at"`
}

type EmployeeDraftFilter struct {
	Search   string
	Status   string
	OwnerID  string // when set, only drafts owned by this user
	Page     int
	PageSize int
}

// ---------------------------------------------------------------------------
// Draft payload sections
// ---------------------------------------------------------------------------

type EmployeeDraftPayload struct {
	Personal     PersonalSection      `json:"personal"`
	Employment   EmploymentSection    `json:"employment"`
	Compensation *CompensationSection `json:"compensation,omitempty"`
	Schedule     ScheduleSection      `json:"schedule"`
	Documents    []DraftDocument      `json:"documents"`
	Devices      DevicesSection       `json:"devices"`
}

type PersonalSection struct {
	FirstName             string `json:"first_name"`
	MiddleName            string `json:"middle_name,omitempty"`
	LastName              string `json:"last_name"`
	ProfilePhotoURL       string `json:"profile_photo_url,omitempty"`
	DateOfBirth           string `json:"date_of_birth,omitempty"`
	PersonalEmail         string `json:"personal_email"`
	PhoneNumber           string `json:"phone_number"`
	AlternatePhone        string `json:"alternate_phone,omitempty"`
	CurrentAddress        string `json:"current_address"`
	PermanentAddress      string `json:"permanent_address"`
	EmergencyContactName  string `json:"emergency_contact_name"`
	EmergencyRelationship string `json:"emergency_relationship"`
	EmergencyPhone        string `json:"emergency_phone"`
}

type EmploymentSection struct {
	EmployeeCode        string   `json:"employee_code,omitempty"`
	DepartmentID        int      `json:"department_id"`
	Designation         string   `json:"designation"`
	JobTitle            string   `json:"job_title,omitempty"`
	ManagerID           *int     `json:"manager_id,omitempty"`
	SecondaryApproverID *int     `json:"secondary_approver_id,omitempty"`
	EmploymentType      string   `json:"employment_type"`
	WorkLocation        string   `json:"work_location,omitempty"`
	WorkMode            string   `json:"work_mode"`
	DateOfJoining       string   `json:"date_of_joining"`
	ProbationMonths     int      `json:"probation_months"`
	ProbationEndDate    string   `json:"probation_end_date,omitempty"`
	ContractEndDate     string   `json:"contract_end_date,omitempty"`
	EmploymentStatus    string   `json:"employment_status"`
	WorkEmail           string   `json:"work_email,omitempty"`
	Roles               []string `json:"roles"`
}

type CompensationSection struct {
	AnnualCTC        float64 `json:"annual_ctc"`
	Currency         string  `json:"currency"`
	SalaryStructure  string  `json:"salary_structure"`
	BasicSalary      float64 `json:"basic_salary"`
	HRA              float64 `json:"hra"`
	Conveyance       float64 `json:"conveyance"`
	MedicalAllowance float64 `json:"medical_allowance"`
	SpecialAllowance float64 `json:"special_allowance"`
	VariablePay      float64 `json:"variable_pay"`
	EmployerPF       float64 `json:"employer_pf"`
	EmployeePF       float64 `json:"employee_pf"`
	ProfessionalTax  float64 `json:"professional_tax"`
	TDS              float64 `json:"tds"`
	HourlyRate       float64 `json:"hourly_rate"`
	PayFrequency     string  `json:"pay_frequency"`
	EffectiveDate    string  `json:"effective_date"`
	PayrollID        string  `json:"payroll_id,omitempty"`
	StatutoryInfo    string  `json:"statutory_info,omitempty"`
}

type LeaveAllocationInput struct {
	LeaveTypeID   int     `json:"leave_type_id"`
	Days          float64 `json:"days"`
	EffectiveFrom string  `json:"effective_from,omitempty"`
}

type ScheduleSection struct {
	LeavePolicy      string                 `json:"leave_policy,omitempty"`
	Allocations      []LeaveAllocationInput `json:"allocations"`
	WorkScheduleID   int                    `json:"work_schedule_id,omitempty"`
	WorkingDays      string                 `json:"working_days,omitempty"`
	WeeklyOffDays    string                 `json:"weekly_off_days,omitempty"`
	ShiftStart       string                 `json:"shift_start,omitempty"`
	ShiftEnd         string                 `json:"shift_end,omitempty"`
	ExpectedHours    float64                `json:"expected_hours"`
	AttendancePolicy string                 `json:"attendance_policy,omitempty"`
	HolidayCalendar  string                 `json:"holiday_calendar,omitempty"`
}

type DraftDocument struct {
	DocumentTypeCode   string `json:"document_type_code"`
	FileName           string `json:"file_name"`
	FileSize           int64  `json:"file_size"`
	MimeType           string `json:"mime_type,omitempty"`
	StorageKey         string `json:"storage_key,omitempty"`
	VerificationStatus string `json:"verification_status,omitempty"`
	UploadedAt         string `json:"uploaded_at,omitempty"`
	UploadedBy         string `json:"uploaded_by,omitempty"`
	ExpiryDate         string `json:"expiry_date,omitempty"`
	Notes              string `json:"notes,omitempty"`
	RejectionReason    string `json:"rejection_reason,omitempty"`
}

type AssetAssignmentInput struct {
	AssetTag         string `json:"asset_tag"`
	Category         string `json:"category"`
	Manufacturer     string `json:"manufacturer,omitempty"`
	Model            string `json:"model,omitempty"`
	SerialNumber     string `json:"serial_number,omitempty"`
	IssueDate        string `json:"issue_date,omitempty"`
	Condition        string `json:"condition,omitempty"`
	Accessories      string `json:"accessories,omitempty"`
	SoftwareLicenses string `json:"software_licenses,omitempty"`
	Acknowledgement  bool   `json:"acknowledgement"`
	Notes            string `json:"notes,omitempty"`
}

type AccountAccessSection struct {
	WorkEmail          string   `json:"work_email,omitempty"`
	ProvisioningStatus string   `json:"provisioning_status,omitempty"`
	Roles              []string `json:"roles"`
	AppAccess          []string `json:"app_access"`
	Checklist          []string `json:"checklist"`
}

type DevicesSection struct {
	Assets  []AssetAssignmentInput `json:"assets"`
	Account AccountAccessSection   `json:"account"`
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

type ValidationIssue struct {
	Section string `json:"section"`
	Field   string `json:"field"`
	Message string `json:"message"`
}

type DraftValidation struct {
	CanSubmit         bool              `json:"can_submit"`
	Issues            []ValidationIssue `json:"issues"`
	Warnings          []string          `json:"warnings"`
	CompletedSections []string          `json:"completed_sections"`
	MissingSections   []string          `json:"missing_sections"`
}

// SubmitDraftRequest carries the options chosen on the review screen.
type SubmitDraftRequest struct {
	Version         int      `json:"version"`
	CreateAccount   bool     `json:"create_account"`
	InitialPassword string   `json:"initial_password,omitempty"`
	Roles           []string `json:"roles"`
}

// ---------------------------------------------------------------------------
// Reference data, audit and filters
// ---------------------------------------------------------------------------

type DocumentType struct {
	ID                int    `json:"id"`
	Code              string `json:"code"`
	Name              string `json:"name"`
	Description       string `json:"description,omitempty"`
	IsRequired        bool   `json:"is_required"`
	AllowedExtensions string `json:"allowed_extensions"`
	MaxSizeBytes      int64  `json:"max_size_bytes"`
	SortOrder         int    `json:"sort_order"`
}

type WorkSchedule struct {
	ID               int     `json:"id"`
	Name             string  `json:"name"`
	WorkDays         string  `json:"work_days"`
	WeeklyOffDays    string  `json:"weekly_off_days"`
	ExpectedHours    float64 `json:"expected_hours"`
	ShiftStart       string  `json:"shift_start,omitempty"`
	ShiftEnd         string  `json:"shift_end,omitempty"`
	AttendancePolicy string  `json:"attendance_policy,omitempty"`
}

type LeavePolicy struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
}

type Asset struct {
	ID               int    `json:"id"`
	AssetTag         string `json:"asset_tag"`
	Category         string `json:"category"`
	Manufacturer     string `json:"manufacturer,omitempty"`
	Model            string `json:"model,omitempty"`
	SerialNumber     string `json:"serial_number,omitempty"`
	Condition        string `json:"condition"`
	Accessories      string `json:"accessories,omitempty"`
	SoftwareLicenses string `json:"software_licenses,omitempty"`
	Status           string `json:"status"`
	AssignedToName   string `json:"assigned_to_name,omitempty"`
	AssignedToID     *int   `json:"assigned_to_id,omitempty"`
}

type EmployeeAuditLog struct {
	ID          int             `json:"id"`
	EmployeeID  *int            `json:"employee_id,omitempty"`
	DraftID     *int            `json:"draft_id,omitempty"`
	ActorUserID string          `json:"actor_user_id,omitempty"`
	ActorEmail  string          `json:"actor_email"`
	ActorRole   string          `json:"actor_role"`
	Action      string          `json:"action"`
	Section     string          `json:"section,omitempty"`
	Summary     string          `json:"summary"`
	Details     json.RawMessage `json:"details,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
}

// Actor describes the authenticated user performing an operation.
type Actor struct {
	UserID string
	Email  string
	Role   string
}

// ---------------------------------------------------------------------------
// Employee profile extras (documents, assets, allocations, access, audit)
// ---------------------------------------------------------------------------

type EmployeeDocumentRecord struct {
	ID                 int        `json:"id"`
	DocumentType       string     `json:"document_type"`
	DocumentTypeName   string     `json:"document_type_name,omitempty"`
	FileName           string     `json:"file_name"`
	FileSize           int64      `json:"file_size"`
	VerificationStatus string     `json:"verification_status"`
	VerifiedBy         string     `json:"verified_by,omitempty"`
	VerifiedAt         *time.Time `json:"verified_at,omitempty"`
	ExpiryDate         *time.Time `json:"expiry_date,omitempty"`
	Notes              string     `json:"notes,omitempty"`
	RejectionReason    string     `json:"rejection_reason,omitempty"`
	UploadedAt         time.Time  `json:"uploaded_at"`
}

type EmployeeAssetAssignment struct {
	ID              int        `json:"id"`
	AssetTag        string     `json:"asset_tag"`
	Category        string     `json:"category"`
	Manufacturer    string     `json:"manufacturer,omitempty"`
	Model           string     `json:"model,omitempty"`
	SerialNumber    string     `json:"serial_number,omitempty"`
	AssignedAt      time.Time  `json:"assigned_at"`
	ReturnedAt      *time.Time `json:"returned_at,omitempty"`
	Acknowledgement bool       `json:"acknowledgement"`
	Notes           string     `json:"notes,omitempty"`
}

type EmployeeLeaveAllocation struct {
	ID            int       `json:"id"`
	LeaveTypeID   int       `json:"leave_type_id"`
	LeaveTypeName string    `json:"leave_type_name"`
	PolicyName    string    `json:"policy_name,omitempty"`
	AllocatedDays float64   `json:"allocated_days"`
	UsedDays      float64   `json:"used_days"`
	EffectiveFrom time.Time `json:"effective_from"`
}

type EmployeeAccessInfo struct {
	WorkEmail          string `json:"work_email"`
	Role               string `json:"role"`
	IsActive           bool   `json:"is_active"`
	ProvisioningStatus string `json:"provisioning_status"`
	AccountCreatedAt   string `json:"account_created_at,omitempty"`
}

// EmployeeExtras is returned section-by-section only when the caller holds the
// matching granular permission; a nil section means "not authorised".
type EmployeeExtras struct {
	Documents        []*EmployeeDocumentRecord  `json:"documents,omitempty"`
	Assets           []*EmployeeAssetAssignment `json:"assets,omitempty"`
	LeaveAllocations []*EmployeeLeaveAllocation `json:"leave_allocations,omitempty"`
	Access           *EmployeeAccessInfo        `json:"access,omitempty"`
	History          []*EmployeeAuditLog        `json:"history,omitempty"`
}
