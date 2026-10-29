package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/mail"
	"regexp"
	"strings"
	"time"

	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
	"crystalspace/backend/pkg/security"
)

var (
	ErrDraftForbidden = errors.New("you are not allowed to access this employee draft")
	ErrDraftConflict  = errors.New("this draft was updated in another session; reload before saving again")
)

// DraftValidationError carries the structured validation result to the handler.
type DraftValidationError struct {
	Validation *models.DraftValidation
}

func (e *DraftValidationError) Error() string {
	return "employee draft cannot be submitted until the highlighted fields are resolved"
}

type onboardingService struct {
	repo      interfaces.EmployeeOnboardingRepository
	empRepo   interfaces.EmployeeRepository
	permRepo  interfaces.PermissionRepository
	leaveRepo interfaces.LeaveRepository
}

func NewEmployeeOnboardingService(
	repo interfaces.EmployeeOnboardingRepository,
	empRepo interfaces.EmployeeRepository,
	permRepo interfaces.PermissionRepository,
	leaveRepo interfaces.LeaveRepository,
) interfaces.EmployeeOnboardingService {
	return &onboardingService{repo: repo, empRepo: empRepo, permRepo: permRepo, leaveRepo: leaveRepo}
}

// ---------------------------------------------------------------------------
// Authorisation helpers — always evaluated on the server.
// ---------------------------------------------------------------------------

func (s *onboardingService) can(ctx context.Context, actor models.Actor, page, action string) bool {
	if actor.Role == "SuperAdmin" {
		return true
	}
	if actor.Role == "" {
		return false
	}
	allowed, err := s.permRepo.HasPermission(ctx, actor.Role, page, action)
	if err != nil {
		return false
	}
	return allowed
}

func (s *onboardingService) permissionsFor(ctx context.Context, actor models.Actor, draft *models.EmployeeDraft) dto.EmployeeDraftPermissions {
	isOwner := actor.UserID != "" && draft != nil && draft.OwnerUserID == actor.UserID
	return dto.EmployeeDraftPermissions{
		IsOwner:          isOwner,
		CanUpdate:        isOwner || s.can(ctx, actor, "employees-drafts", "update"),
		CanDelete:        s.can(ctx, actor, "employees-drafts", "delete"),
		CanSubmit:        isOwner || s.can(ctx, actor, "employees-drafts", "create"),
		CompensationView: s.can(ctx, actor, "employees-compensation", "view"),
		CompensationEdit: s.can(ctx, actor, "employees-compensation", "update"),
		DocumentsView:    s.can(ctx, actor, "employees-documents", "view"),
		DocumentsUpload:  s.can(ctx, actor, "employees-documents", "create"),
		DocumentsVerify:  s.can(ctx, actor, "employees-documents", "update"),
		AssetsView:       s.can(ctx, actor, "employees-assets", "view"),
		AssetsAssign:     s.can(ctx, actor, "employees-assets", "create"),
		AccessView:       s.can(ctx, actor, "employees-access", "view"),
		AccessManage:     s.can(ctx, actor, "employees-access", "create"),
		HistoryView:      s.can(ctx, actor, "employees-history", "view"),
	}
}

// loadDraft fetches a draft and enforces record-level ownership/authorisation.
func (s *onboardingService) loadDraft(ctx context.Context, actor models.Actor, id int, write bool) (*models.EmployeeDraft, dto.EmployeeDraftPermissions, error) {
	draft, err := s.repo.GetDraft(ctx, id)
	if err != nil {
		return nil, dto.EmployeeDraftPermissions{}, err
	}
	perms := s.permissionsFor(ctx, actor, draft)
	isOwner := perms.IsOwner
	allowed := isOwner
	if write {
		allowed = isOwner || s.can(ctx, actor, "employees-drafts", "update")
	} else {
		allowed = isOwner || s.can(ctx, actor, "employees-drafts", "view")
	}
	if !allowed {
		return nil, perms, ErrDraftForbidden
	}
	if draft.Status == models.DraftStatusConverted {
		return nil, perms, errors.New("this draft has already been submitted")
	}
	return draft, perms, nil
}

func maskDraft(draft *models.EmployeeDraft, perms dto.EmployeeDraftPermissions) *models.EmployeeDraft {
	if draft == nil || perms.CompensationView {
		return draft
	}
	var payload map[string]json.RawMessage
	if err := json.Unmarshal(draft.Payload, &payload); err != nil {
		return draft
	}
	if _, ok := payload[models.DraftSectionCompensation]; ok {
		delete(payload, models.DraftSectionCompensation)
		stripped, _ := json.Marshal(payload)
		draft.Payload = stripped
	}
	return draft
}

// ---------------------------------------------------------------------------
// Draft CRUD
// ---------------------------------------------------------------------------

func (s *onboardingService) CreateDraft(ctx context.Context, actor models.Actor, req dto.CreateEmployeeDraftRequest) (*dto.EmployeeDraftResponse, error) {
	if !s.can(ctx, actor, "employees-drafts", "create") {
		return nil, ErrDraftForbidden
	}
	if actor.UserID == "" {
		return nil, errors.New("cannot create a draft without an authenticated user")
	}
	step := req.CurrentStep
	if step < 1 || step > 6 {
		step = 1
	}
	payload, _ := json.Marshal(models.EmployeeDraftPayload{})
	draft := &models.EmployeeDraft{
		DraftRef:          newDraftRef(),
		OwnerUserID:       actor.UserID,
		OwnerEmail:        actor.Email,
		OwnerName:         actor.Email,
		Status:            models.DraftStatusDraft,
		CurrentStep:       step,
		Payload:           payload,
		CompletedSections: []string{},
	}
	if err := s.repo.CreateDraft(ctx, draft); err != nil {
		return nil, err
	}
	_ = s.repo.Audit(ctx, &models.EmployeeAuditLog{
		DraftID:     &draft.ID,
		ActorUserID: actor.UserID,
		ActorEmail:  actor.Email,
		ActorRole:   actor.Role,
		Action:      "employee.draft.create",
		Summary:     "Employee onboarding draft started",
	})
	perms := s.permissionsFor(ctx, actor, draft)
	return &dto.EmployeeDraftResponse{Draft: draft, Permissions: perms}, nil
}

func (s *onboardingService) GetDraft(ctx context.Context, actor models.Actor, id int) (*dto.EmployeeDraftResponse, error) {
	draft, perms, err := s.loadDraft(ctx, actor, id, false)
	if err != nil {
		return nil, err
	}
	docTypes, _ := s.repo.ListDocumentTypes(ctx)
	payload := decodePayload(draft.Payload)
	validation := s.validate(ctx, actor, draft, payload, docTypes)
	draft = maskDraft(draft, perms)
	return &dto.EmployeeDraftResponse{Draft: draft, Permissions: perms, Validation: validation}, nil
}

func (s *onboardingService) ListDrafts(ctx context.Context, actor models.Actor, filter models.EmployeeDraftFilter) ([]*models.EmployeeDraftSummary, int, error) {
	canSeeAll := s.can(ctx, actor, "employees-drafts", "view")
	if !canSeeAll {
		filter.OwnerID = actor.UserID
	}
	return s.repo.ListDrafts(ctx, filter)
}

func (s *onboardingService) SaveSection(ctx context.Context, actor models.Actor, id int, section string, req dto.SaveDraftSectionRequest) (*dto.EmployeeDraftResponse, error) {
	if !validSection(section) || section == models.DraftSectionReview {
		return nil, errors.New("unknown onboarding section")
	}
	draft, perms, err := s.loadDraft(ctx, actor, id, true)
	if err != nil {
		return nil, err
	}
	if req.Version != draft.Version {
		return nil, ErrDraftConflict
	}
	if err := s.authorizeSectionWrite(ctx, actor, perms, section); err != nil {
		return nil, err
	}
	if len(req.Data) == 0 || string(req.Data) == "null" {
		return nil, errors.New("empty section payload")
	}

	raw := map[string]json.RawMessage{}
	if len(draft.Payload) > 0 {
		_ = json.Unmarshal(draft.Payload, &raw)
	}

	normalised, err := s.normaliseSection(ctx, actor, section, req.Data)
	if err != nil {
		return nil, err
	}
	raw[section] = normalised

	merged, err := json.Marshal(raw)
	if err != nil {
		return nil, err
	}
	payload := decodePayload(merged)
	completed := computeCompleted(payload, perms)

	step := req.CurrentStep
	if step < 1 || step > 7 {
		step = draft.CurrentStep
	}

	saved, err := s.repo.SaveDraft(ctx, draft.ID, merged, completed, step, req.Version, draftDisplayName(payload), payload.Employment.EmployeeCode)
	if err != nil {
		if errors.Is(err, interfaces.ErrVersionConflict) {
			return nil, ErrDraftConflict
		}
		return nil, err
	}

	if section == models.DraftSectionCompensation {
		_ = s.repo.Audit(ctx, &models.EmployeeAuditLog{
			DraftID:     &saved.ID,
			ActorUserID: actor.UserID,
			ActorEmail:  actor.Email,
			ActorRole:   actor.Role,
			Action:      "employee.draft.compensation.update",
			Section:     section,
			Summary:     "Compensation details updated on an onboarding draft",
		})
	}

	saved.Payload = merged
	saved.CompletedSections = completed
	docTypes, _ := s.repo.ListDocumentTypes(ctx)
	validation := s.validate(ctx, actor, saved, payload, docTypes)
	masked := maskDraft(saved, perms)
	return &dto.EmployeeDraftResponse{Draft: masked, Permissions: perms, Validation: validation}, nil
}

func (s *onboardingService) UpdateDraft(ctx context.Context, actor models.Actor, id int, req dto.UpdateDraftRequest) (*dto.EmployeeDraftResponse, error) {
	draft, perms, err := s.loadDraft(ctx, actor, id, true)
	if err != nil {
		return nil, err
	}
	if req.Version != draft.Version {
		return nil, ErrDraftConflict
	}
	status := models.DraftStatusDraft
	switch req.Status {
	case "", models.DraftStatusDraft:
		status = models.DraftStatusDraft
	case models.DraftStatusReadyForReview:
		status = models.DraftStatusReadyForReview
	default:
		return nil, errors.New("unsupported draft status")
	}
	step := req.CurrentStep
	if step < 1 || step > 7 {
		step = draft.CurrentStep
	}
	updated, err := s.repo.UpdateDraftMeta(ctx, draft.ID, status, step, req.Version)
	if err != nil {
		if errors.Is(err, interfaces.ErrVersionConflict) {
			return nil, ErrDraftConflict
		}
		return nil, err
	}
	updated = maskDraft(updated, perms)
	return &dto.EmployeeDraftResponse{Draft: updated, Permissions: perms}, nil
}

func (s *onboardingService) DeleteDraft(ctx context.Context, actor models.Actor, id int) error {
	draft, perms, err := s.loadDraft(ctx, actor, id, false)
	if err != nil {
		return err
	}
	if !perms.CanDelete {
		return ErrDraftForbidden
	}
	if err := s.repo.DeleteDraft(ctx, draft.ID); err != nil {
		return err
	}
	_ = s.repo.Audit(ctx, &models.EmployeeAuditLog{
		DraftID:     &draft.ID,
		ActorUserID: actor.UserID,
		ActorEmail:  actor.Email,
		ActorRole:   actor.Role,
		Action:      "employee.draft.delete",
		Summary:     fmt.Sprintf("Draft %s discarded by %s", draft.DraftRef, actor.Email),
	})
	return nil
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

func (s *onboardingService) ValidateDraft(ctx context.Context, actor models.Actor, id int) (*models.DraftValidation, error) {
	draft, _, err := s.loadDraft(ctx, actor, id, false)
	if err != nil {
		return nil, err
	}
	docTypes, _ := s.repo.ListDocumentTypes(ctx)
	return s.validate(ctx, actor, draft, decodePayload(draft.Payload), docTypes), nil
}

func (s *onboardingService) validate(ctx context.Context, actor models.Actor, draft *models.EmployeeDraft, p *models.EmployeeDraftPayload, docTypes []*models.DocumentType) *models.DraftValidation {
	issues := []models.ValidationIssue{}
	warnings := []string{}
	perms := s.permissionsFor(ctx, actor, draft)

	add := func(section, field, msg string) {
		issues = append(issues, models.ValidationIssue{Section: section, Field: field, Message: msg})
	}

	// --- Personal -----------------------------------------------------------
	p1 := p.Personal
	if strings.TrimSpace(p1.FirstName) == "" {
		add(models.DraftSectionPersonal, "first_name", "First name is required")
	}
	if strings.TrimSpace(p1.LastName) == "" {
		add(models.DraftSectionPersonal, "last_name", "Last name is required")
	}
	if !isEmail(p1.PersonalEmail) {
		add(models.DraftSectionPersonal, "personal_email", "Enter a valid personal email address")
	}
	if !isPhone(p1.PhoneNumber) {
		add(models.DraftSectionPersonal, "phone_number", "Enter a valid phone number")
	}
	if p1.AlternatePhone != "" && !isPhone(p1.AlternatePhone) {
		add(models.DraftSectionPersonal, "alternate_phone", "Enter a valid alternate phone number")
	}
	if strings.TrimSpace(p1.CurrentAddress) == "" {
		add(models.DraftSectionPersonal, "current_address", "Current address is required")
	}
	if strings.TrimSpace(p1.PermanentAddress) == "" {
		add(models.DraftSectionPersonal, "permanent_address", "Permanent address is required")
	}
	if strings.TrimSpace(p1.EmergencyContactName) == "" {
		add(models.DraftSectionPersonal, "emergency_contact_name", "Emergency contact name is required")
	}
	if strings.TrimSpace(p1.EmergencyRelationship) == "" {
		add(models.DraftSectionPersonal, "emergency_relationship", "Emergency contact relationship is required")
	}
	if !isPhone(p1.EmergencyPhone) {
		add(models.DraftSectionPersonal, "emergency_phone", "Enter a valid emergency contact phone number")
	}
	if p1.DateOfBirth != "" {
		if dob, err := time.Parse("2006-01-02", p1.DateOfBirth); err != nil {
			add(models.DraftSectionPersonal, "date_of_birth", "Date of birth must be a valid date")
		} else if dob.After(time.Now().AddDate(-16, 0, 0)) {
			add(models.DraftSectionPersonal, "date_of_birth", "Employee must be at least 16 years old")
		}
	}

	// --- Employment ---------------------------------------------------------
	e := p.Employment
	if e.DepartmentID <= 0 {
		add(models.DraftSectionEmployment, "department_id", "Select a department")
	}
	if strings.TrimSpace(e.Designation) == "" {
		add(models.DraftSectionEmployment, "designation", "Designation is required")
	}
	if strings.TrimSpace(e.DateOfJoining) == "" {
		add(models.DraftSectionEmployment, "date_of_joining", "Joining date is required")
	} else if _, err := time.Parse("2006-01-02", e.DateOfJoining); err != nil {
		add(models.DraftSectionEmployment, "date_of_joining", "Joining date must be a valid date")
	}
	if e.EmploymentType == "" {
		add(models.DraftSectionEmployment, "employment_type", "Select an employment type")
	}
	if e.WorkMode == "" {
		add(models.DraftSectionEmployment, "work_mode", "Select a work mode")
	}
	if e.EmploymentStatus == "" {
		add(models.DraftSectionEmployment, "employment_status", "Select an employment status")
	}
	if e.WorkEmail != "" && !isEmail(e.WorkEmail) {
		add(models.DraftSectionEmployment, "work_email", "Enter a valid work email address")
	}
	if e.ContractEndDate != "" && e.DateOfJoining != "" {
		end, err1 := time.Parse("2006-01-02", e.ContractEndDate)
		start, err2 := time.Parse("2006-01-02", e.DateOfJoining)
		if err1 == nil && err2 == nil && end.Before(start) {
			add(models.DraftSectionEmployment, "contract_end_date", "Contract end date cannot be before the joining date")
		}
	}
	if strings.EqualFold(e.EmploymentType, "Contract") && e.ContractEndDate == "" {
		warnings = append(warnings, "Contract employment usually needs an end date.")
	}
	if e.EmployeeCode != "" {
		if taken, err := s.repo.EmployeeCodeTaken(ctx, e.EmployeeCode); err == nil && taken {
			add(models.DraftSectionEmployment, "employee_code", "This employee code is already assigned")
		}
	}
	workEmail := e.WorkEmail
	if workEmail == "" {
		workEmail = p1.PersonalEmail
	}
	if isEmail(workEmail) {
		if taken, err := s.repo.EmployeeEmailTaken(ctx, workEmail, 0); err == nil && taken {
			add(models.DraftSectionEmployment, "work_email", "An employee with this email already exists")
		}
	}

	// --- Compensation -------------------------------------------------------
	if perms.CompensationView {
		if p.Compensation == nil {
			if perms.CompensationEdit {
				warnings = append(warnings, "Compensation has not been captured yet.")
			}
		} else {
			c := p.Compensation
			for field, amount := range map[string]float64{
				"annual_ctc": c.AnnualCTC, "basic_salary": c.BasicSalary, "hra": c.HRA,
				"conveyance": c.Conveyance, "medical_allowance": c.MedicalAllowance,
				"special_allowance": c.SpecialAllowance, "employee_pf": c.EmployeePF,
				"employer_pf": c.EmployerPF, "professional_tax": c.ProfessionalTax,
				"tds": c.TDS, "hourly_rate": c.HourlyRate, "variable_pay": c.VariablePay,
			} {
				if amount < 0 {
					add(models.DraftSectionCompensation, field, "Amounts cannot be negative")
				}
			}
			gross := c.BasicSalary + c.HRA + c.Conveyance + c.MedicalAllowance + c.SpecialAllowance
			if c.BasicSalary <= 0 {
				add(models.DraftSectionCompensation, "basic_salary", "Basic salary is required")
			}
			if c.AnnualCTC > 0 && gross > c.AnnualCTC {
				add(models.DraftSectionCompensation, "annual_ctc", "Component total exceeds the annual CTC")
			}
			if c.AnnualCTC > 0 && gross > 0 && gross != c.AnnualCTC {
				warnings = append(warnings, "Fixed components do not equal the annual CTC (variable pay and employer contributions may explain the difference).")
			}
			if c.EmployeePF > gross {
				add(models.DraftSectionCompensation, "employee_pf", "Employee PF cannot exceed gross salary")
			}
			if c.EffectiveDate != "" {
				if _, err := time.Parse("2006-01-02", c.EffectiveDate); err != nil {
					add(models.DraftSectionCompensation, "effective_date", "Effective date must be a valid date")
				}
			}
		}
	}

	// --- Leave & schedule ---------------------------------------------------
	sc := p.Schedule
	if sc.WorkScheduleID <= 0 && strings.TrimSpace(sc.WorkingDays) == "" {
		add(models.DraftSectionSchedule, "work_schedule_id", "Assign a work schedule")
	}
	if sc.ExpectedHours <= 0 || sc.ExpectedHours > 24 {
		add(models.DraftSectionSchedule, "expected_hours", "Expected working hours must be between 0 and 24")
	}
	for i, alloc := range sc.Allocations {
		if alloc.LeaveTypeID <= 0 {
			add(models.DraftSectionSchedule, fmt.Sprintf("allocations.%d.leave_type_id", i), "Select a leave type")
		}
		if alloc.Days < 0 {
			add(models.DraftSectionSchedule, fmt.Sprintf("allocations.%d.days", i), "Allocated days cannot be negative")
		}
	}

	// --- Documents ----------------------------------------------------------
	for i, doc := range p.Documents {
		if strings.TrimSpace(doc.FileName) == "" {
			add(models.DraftSectionDocuments, fmt.Sprintf("documents.%d.file_name", i), "File name is required")
			continue
		}
		dt := findDocType(docTypes, doc.DocumentTypeCode)
		if dt == nil {
			add(models.DraftSectionDocuments, fmt.Sprintf("documents.%d.document_type_code", i), "Select a valid document type")
			continue
		}
		if ext := fileExtension(doc.FileName); !extensionAllowed(dt, ext) {
			add(models.DraftSectionDocuments, fmt.Sprintf("documents.%d.file_name", i), fmt.Sprintf("%s must be one of: %s", dt.Name, dt.AllowedExtensions))
		}
		if dt.MaxSizeBytes > 0 && doc.FileSize > dt.MaxSizeBytes {
			add(models.DraftSectionDocuments, fmt.Sprintf("documents.%d.file_name", i), fmt.Sprintf("%s exceeds the %d MB limit", dt.Name, dt.MaxSizeBytes/(1024*1024)))
		}
	}
	for _, dt := range docTypes {
		if !dt.IsRequired {
			continue
		}
		found := false
		for _, doc := range p.Documents {
			if doc.DocumentTypeCode == dt.Code && strings.TrimSpace(doc.FileName) != "" {
				found = true
				break
			}
		}
		if !found {
			add(models.DraftSectionDocuments, dt.Code, fmt.Sprintf("%s is required", dt.Name))
		}
	}

	// --- Devices & access ---------------------------------------------------
	seenAssets := map[string]bool{}
	for i, a := range p.Devices.Assets {
		if strings.TrimSpace(a.AssetTag) == "" {
			add(models.DraftSectionDevices, fmt.Sprintf("assets.%d.asset_tag", i), "Asset tag is required")
			continue
		}
		if seenAssets[a.AssetTag] {
			add(models.DraftSectionDevices, fmt.Sprintf("assets.%d.asset_tag", i), "This asset is listed more than once")
		}
		seenAssets[a.AssetTag] = true
	}
	if p.Devices.Account.WorkEmail != "" && !isEmail(p.Devices.Account.WorkEmail) {
		add(models.DraftSectionDevices, "account.work_email", "Enter a valid work email for the account")
	}

	completed := computeCompleted(p, perms)
	missing := []string{}
	for _, section := range []string{
		models.DraftSectionPersonal, models.DraftSectionEmployment,
		models.DraftSectionSchedule, models.DraftSectionDocuments,
	} {
		if !contains(completed, section) {
			missing = append(missing, section)
		}
	}
	if perms.CompensationView && perms.CompensationEdit && p.Compensation == nil {
		missing = append(missing, models.DraftSectionCompensation)
	}

	return &models.DraftValidation{
		CanSubmit:         len(issues) == 0 && len(missing) == 0,
		Issues:            issues,
		Warnings:          warnings,
		CompletedSections: completed,
		MissingSections:   missing,
	}
}

// ---------------------------------------------------------------------------
// Submission
// ---------------------------------------------------------------------------

func (s *onboardingService) SubmitDraft(ctx context.Context, actor models.Actor, id int, req models.SubmitDraftRequest) (*dto.DraftSubmitResult, error) {
	draft, perms, err := s.loadDraft(ctx, actor, id, true)
	if err != nil {
		return nil, err
	}
	if req.Version != 0 && req.Version != draft.Version {
		return nil, ErrDraftConflict
	}
	payload := decodePayload(draft.Payload)
	docTypes, _ := s.repo.ListDocumentTypes(ctx)
	validation := s.validate(ctx, actor, draft, payload, docTypes)
	if !validation.CanSubmit {
		return nil, &DraftValidationError{Validation: validation}
	}

	roles := req.Roles
	if len(roles) == 0 {
		roles = payload.Employment.Roles
	}
	if err := s.validateRoleAssignments(ctx, actor, roles); err != nil {
		return nil, err
	}

	createAccount := req.CreateAccount
	if createAccount {
		if !perms.AccessManage {
			return nil, errors.New("you do not have permission to provision application accounts")
		}
		if strings.TrimSpace(payload.Employment.WorkEmail) == "" && strings.TrimSpace(payload.Personal.PersonalEmail) == "" {
			return nil, errors.New("a work or personal email is required to provision an account")
		}
	}

	password := ""
	tempPassword := ""
	if createAccount {
		password = req.InitialPassword
		if len(password) < 8 {
			password = randomPassword()
			tempPassword = password
		}
		hash, err := security.HashPassword(password)
		if err != nil {
			return nil, fmt.Errorf("failed to prepare credentials: %w", err)
		}
		password = hash
	}

	// Compensation is not written when the actor cannot see it.
	submittedPayload := *payload
	if !perms.CompensationView {
		submittedPayload.Compensation = nil
	}

	employeeID, err := s.repo.SubmitDraft(ctx, draft, &submittedPayload, interfaces.SubmitOptions{
		CreateAccount: createAccount,
		PasswordHash:  password,
		Roles:         roles,
		Actor:         actor,
	})
	if err != nil {
		if errors.Is(err, interfaces.ErrVersionConflict) {
			return nil, ErrDraftConflict
		}
		return nil, err
	}

	employee, err := s.empRepo.GetByID(ctx, employeeID)
	if err != nil {
		return nil, err
	}
	return &dto.DraftSubmitResult{
		EmployeeID:         employeeID,
		EmployeeCode:       employee.EmployeeCode,
		DraftID:            draft.ID,
		AccountProvisioned: createAccount,
		TemporaryPassword:  tempPassword,
	}, nil
}

// A role is privileged when it can modify the RBAC matrix itself. Only actors
// who can also edit roles may assign it.
func (s *onboardingService) validateRoleAssignments(ctx context.Context, actor models.Actor, roles []string) error {
	if len(roles) == 0 {
		return nil
	}
	if !s.can(ctx, actor, "employees-access", "update") && !s.can(ctx, actor, "employees-access", "create") {
		return errors.New("you do not have permission to assign application roles")
	}
	for _, role := range roles {
		exists, err := s.repo.RoleExists(ctx, role)
		if err != nil {
			return err
		}
		if !exists {
			return fmt.Errorf("role %q does not exist", role)
		}
		perms, err := s.permRepo.GetRolePermissions(ctx, role)
		if err != nil {
			return err
		}
		privileged := false
		for _, p := range perms {
			if p.Page == "roles" && p.CanUpdate {
				privileged = true
				break
			}
		}
		if privileged && !s.can(ctx, actor, "roles", "update") {
			return fmt.Errorf("only a role administrator can assign the %q role", role)
		}
	}
	return nil
}

// ---------------------------------------------------------------------------
// Reference data & history
// ---------------------------------------------------------------------------

func (s *onboardingService) ReferenceData(ctx context.Context, actor models.Actor) (*dto.OnboardingReferenceData, error) {
	if !s.can(ctx, actor, "employees", "view") {
		return nil, ErrDraftForbidden
	}
	data := &dto.OnboardingReferenceData{
		EmploymentTypes:    []string{"FullTime", "PartTime", "Contract", "Intern"},
		WorkModes:          []string{"Onsite", "Hybrid", "Remote"},
		EmploymentStatuses: []string{"Probation", "Active", "OnLeave", "Suspended", "Resigned", "Terminated"},
	}
	docs, err := s.repo.ListDocumentTypes(ctx)
	if err != nil {
		return nil, err
	}
	data.DocumentTypes = docs
	if schedules, err := s.repo.ListWorkSchedules(ctx); err == nil {
		data.WorkSchedules = schedules
	}
	if policies, err := s.repo.ListLeavePolicies(ctx); err == nil {
		data.LeavePolicies = policies
	}
	if types, err := s.leaveRepo.ListLeaveTypes(ctx); err == nil {
		data.LeaveTypes = types
	}
	if roles, err := s.permRepo.ListRoles(ctx); err == nil {
		for _, r := range roles {
			data.Roles = append(data.Roles, r.Name)
		}
	}
	if s.can(ctx, actor, "employees-assets", "view") {
		if assets, err := s.repo.ListAssets(ctx); err == nil {
			data.Assets = assets
		}
	}
	return data, nil
}

func (s *onboardingService) History(ctx context.Context, actor models.Actor, employeeID int) ([]*models.EmployeeAuditLog, error) {
	if !s.can(ctx, actor, "employees-history", "view") {
		return nil, ErrDraftForbidden
	}
	return s.repo.ListAudit(ctx, employeeID)
}

// Extras returns profile tabs section-by-section, each gated by its own permission.
func (s *onboardingService) Extras(ctx context.Context, actor models.Actor, employeeID int) (*models.EmployeeExtras, error) {
	if !s.can(ctx, actor, "employees", "view") {
		return nil, ErrDraftForbidden
	}
	extras := &models.EmployeeExtras{}

	if s.can(ctx, actor, "employees-documents", "view") {
		docs, err := s.repo.ListDocuments(ctx, employeeID)
		if err != nil {
			return nil, err
		}
		extras.Documents = docs
	}
	if s.can(ctx, actor, "employees-assets", "view") {
		assets, err := s.repo.ListAssetAssignments(ctx, employeeID)
		if err != nil {
			return nil, err
		}
		extras.Assets = assets
	}
	if s.can(ctx, actor, "leaves", "view") {
		if allocations, err := s.repo.ListLeaveAllocations(ctx, employeeID); err == nil {
			extras.LeaveAllocations = allocations
		}
	}
	if s.can(ctx, actor, "employees-access", "view") {
		access, err := s.repo.GetAccess(ctx, employeeID)
		if err != nil {
			return nil, err
		}
		extras.Access = access
	}
	if s.can(ctx, actor, "employees-history", "view") {
		history, err := s.repo.ListAudit(ctx, employeeID)
		if err != nil {
			return nil, err
		}
		extras.History = history
	}
	return extras, nil
}

func (s *onboardingService) AuditEmployeeAction(ctx context.Context, actor models.Actor, employeeID int, action, section, summary string) {
	_ = s.repo.Audit(ctx, &models.EmployeeAuditLog{
		EmployeeID:  &employeeID,
		ActorUserID: actor.UserID,
		ActorEmail:  actor.Email,
		ActorRole:   actor.Role,
		Action:      action,
		Section:     section,
		Summary:     summary,
	})
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

func (s *onboardingService) authorizeSectionWrite(ctx context.Context, actor models.Actor, perms dto.EmployeeDraftPermissions, section string) error {
	if !perms.CanUpdate {
		return ErrDraftForbidden
	}
	switch section {
	case models.DraftSectionCompensation:
		if !perms.CompensationEdit {
			return errors.New("you do not have permission to modify compensation")
		}
	case models.DraftSectionDocuments:
		if !perms.DocumentsUpload {
			return errors.New("you do not have permission to attach documents")
		}
	case models.DraftSectionDevices:
		if !perms.AssetsAssign && !perms.AccessManage {
			return errors.New("you do not have permission to assign devices or application access")
		}
	case models.DraftSectionEmployment:
		// Role assignment is a privileged operation and is re-validated on submit.
		_ = actor
	}
	return nil
}

func (s *onboardingService) normaliseSection(ctx context.Context, actor models.Actor, section string, data json.RawMessage) (json.RawMessage, error) {
	switch section {
	case models.DraftSectionPersonal:
		var p models.PersonalSection
		if err := json.Unmarshal(data, &p); err != nil {
			return nil, errors.New("invalid personal details payload")
		}
		p.FirstName = strings.TrimSpace(p.FirstName)
		p.MiddleName = strings.TrimSpace(p.MiddleName)
		p.LastName = strings.TrimSpace(p.LastName)
		p.PersonalEmail = strings.TrimSpace(strings.ToLower(p.PersonalEmail))
		p.PhoneNumber = strings.TrimSpace(p.PhoneNumber)
		p.AlternatePhone = strings.TrimSpace(p.AlternatePhone)
		p.CurrentAddress = strings.TrimSpace(p.CurrentAddress)
		p.PermanentAddress = strings.TrimSpace(p.PermanentAddress)
		p.EmergencyContactName = strings.TrimSpace(p.EmergencyContactName)
		p.EmergencyRelationship = strings.TrimSpace(p.EmergencyRelationship)
		p.EmergencyPhone = strings.TrimSpace(p.EmergencyPhone)
		return json.Marshal(p)
	case models.DraftSectionEmployment:
		var e models.EmploymentSection
		if err := json.Unmarshal(data, &e); err != nil {
			return nil, errors.New("invalid employment payload")
		}
		e.EmployeeCode = strings.TrimSpace(e.EmployeeCode)
		e.Designation = strings.TrimSpace(e.Designation)
		e.JobTitle = strings.TrimSpace(e.JobTitle)
		e.WorkEmail = strings.TrimSpace(strings.ToLower(e.WorkEmail))
		e.WorkLocation = strings.TrimSpace(e.WorkLocation)
		if e.ManagerID != nil && *e.ManagerID <= 0 {
			e.ManagerID = nil
		}
		if e.ManagerID != nil && e.SecondaryApproverID != nil && *e.ManagerID == *e.SecondaryApproverID {
			return nil, errors.New("the reporting manager and secondary approver must be different people")
		}
		if e.Roles == nil {
			e.Roles = []string{}
		}
		return json.Marshal(e)
	case models.DraftSectionCompensation:
		var c models.CompensationSection
		if err := json.Unmarshal(data, &c); err != nil {
			return nil, errors.New("invalid compensation payload")
		}
		if c.Currency == "" {
			c.Currency = "INR"
		}
		return json.Marshal(c)
	case models.DraftSectionSchedule:
		var sc models.ScheduleSection
		if err := json.Unmarshal(data, &sc); err != nil {
			return nil, errors.New("invalid schedule payload")
		}
		if sc.Allocations == nil {
			sc.Allocations = []models.LeaveAllocationInput{}
		}
		return json.Marshal(sc)
	case models.DraftSectionDocuments:
		var docs []models.DraftDocument
		if err := json.Unmarshal(data, &docs); err != nil {
			return nil, errors.New("invalid documents payload")
		}
		for i := range docs {
			docs[i].DocumentTypeCode = strings.TrimSpace(docs[i].DocumentTypeCode)
			docs[i].FileName = strings.TrimSpace(docs[i].FileName)
			docs[i].VerificationStatus = "Pending"
			docs[i].UploadedBy = actor.Email
			if docs[i].UploadedAt == "" {
				docs[i].UploadedAt = time.Now().UTC().Format(time.RFC3339)
			}
		}
		return json.Marshal(docs)
	case models.DraftSectionDevices:
		var d models.DevicesSection
		if err := json.Unmarshal(data, &d); err != nil {
			return nil, errors.New("invalid devices payload")
		}
		if d.Assets == nil {
			d.Assets = []models.AssetAssignmentInput{}
		}
		if d.Account.Roles == nil {
			d.Account.Roles = []string{}
		}
		if d.Account.AppAccess == nil {
			d.Account.AppAccess = []string{}
		}
		if d.Account.Checklist == nil {
			d.Account.Checklist = []string{}
		}
		return json.Marshal(d)
	}
	return nil, errors.New("unknown onboarding section")
}

func decodePayload(raw json.RawMessage) *models.EmployeeDraftPayload {
	var p models.EmployeeDraftPayload
	if len(raw) > 0 {
		_ = json.Unmarshal(raw, &p)
	}
	return &p
}

func computeCompleted(p *models.EmployeeDraftPayload, perms dto.EmployeeDraftPermissions) []string {
	completed := []string{}
	personal := p.Personal
	if personal.FirstName != "" && personal.LastName != "" && isEmail(personal.PersonalEmail) &&
		isPhone(personal.PhoneNumber) && personal.CurrentAddress != "" && personal.PermanentAddress != "" &&
		personal.EmergencyContactName != "" && personal.EmergencyRelationship != "" && isPhone(personal.EmergencyPhone) {
		completed = append(completed, models.DraftSectionPersonal)
	}
	e := p.Employment
	if e.DepartmentID > 0 && e.Designation != "" && e.DateOfJoining != "" && e.EmploymentType != "" && e.WorkMode != "" && e.EmploymentStatus != "" {
		completed = append(completed, models.DraftSectionEmployment)
	}
	if perms.CompensationView && p.Compensation != nil && p.Compensation.BasicSalary > 0 {
		completed = append(completed, models.DraftSectionCompensation)
	}
	if (p.Schedule.WorkScheduleID > 0 || p.Schedule.WorkingDays != "") && p.Schedule.ExpectedHours > 0 {
		completed = append(completed, models.DraftSectionSchedule)
	}
	if len(p.Documents) > 0 {
		completed = append(completed, models.DraftSectionDocuments)
	}
	if len(p.Devices.Assets) > 0 || p.Devices.Account.WorkEmail != "" {
		completed = append(completed, models.DraftSectionDevices)
	}
	return completed
}

func validSection(section string) bool {
	switch section {
	case models.DraftSectionPersonal, models.DraftSectionEmployment, models.DraftSectionCompensation,
		models.DraftSectionSchedule, models.DraftSectionDocuments, models.DraftSectionDevices,
		models.DraftSectionReview:
		return true
	}
	return false
}

func draftDisplayName(p *models.EmployeeDraftPayload) string {
	return strings.TrimSpace(strings.Join([]string{p.Personal.FirstName, p.Personal.MiddleName, p.Personal.LastName}, " "))
}

var emailRegex = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)

func isEmail(v string) bool {
	v = strings.TrimSpace(v)
	if v == "" || !emailRegex.MatchString(v) {
		return false
	}
	_, err := mail.ParseAddress(v)
	return err == nil
}

var nonDigits = regexp.MustCompile(`\D`)

func isPhone(v string) bool {
	digits := nonDigits.ReplaceAllString(strings.TrimSpace(v), "")
	return len(digits) >= 7 && len(digits) <= 15
}

func findDocType(types []*models.DocumentType, code string) *models.DocumentType {
	for _, t := range types {
		if t.Code == code {
			return t
		}
	}
	return nil
}

func fileExtension(name string) string {
	idx := strings.LastIndex(name, ".")
	if idx < 0 {
		return ""
	}
	return strings.ToLower(name[idx+1:])
}

func extensionAllowed(t *models.DocumentType, ext string) bool {
	for _, allowed := range strings.Split(t.AllowedExtensions, ",") {
		if strings.EqualFold(strings.TrimSpace(allowed), ext) {
			return true
		}
	}
	return false
}

func contains(list []string, v string) bool {
	for _, item := range list {
		if item == v {
			return true
		}
	}
	return false
}

func newDraftRef() string {
	buf := make([]byte, 4)
	_, _ = rand.Read(buf)
	return "DRF-" + time.Now().UTC().Format("20060102") + "-" + strings.ToUpper(hex.EncodeToString(buf))
}

func randomPassword() string {
	buf := make([]byte, 9)
	_, _ = rand.Read(buf)
	return "Temp@" + hex.EncodeToString(buf)
}
