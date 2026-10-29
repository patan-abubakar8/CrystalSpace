package data

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type employeeOnboardingRepository struct {
	pool *pgxpool.Pool
}

func NewEmployeeOnboardingRepository(pool *pgxpool.Pool) interfaces.EmployeeOnboardingRepository {
	return &employeeOnboardingRepository{pool: pool}
}

const draftColumns = `
	id, draft_ref, owner_user_id::text, owner_email, owner_name, status, current_step,
	version, display_name, COALESCE(employee_code, ''), payload, completed_sections,
	submitted_employee_id, last_saved_at, created_at, updated_at
`

func scanDraft(row pgx.Row) (*models.EmployeeDraft, error) {
	var d models.EmployeeDraft
	var payload []byte
	var completed []byte
	if err := row.Scan(
		&d.ID, &d.DraftRef, &d.OwnerUserID, &d.OwnerEmail, &d.OwnerName, &d.Status,
		&d.CurrentStep, &d.Version, &d.DisplayName, &d.EmployeeCode, &payload, &completed,
		&d.SubmittedEmployeeID, &d.LastSavedAt, &d.CreatedAt, &d.UpdatedAt,
	); err != nil {
		return nil, err
	}
	d.Payload = json.RawMessage(payload)
	d.CompletedSections = []string{}
	_ = json.Unmarshal(completed, &d.CompletedSections)
	return &d, nil
}

func (r *employeeOnboardingRepository) CreateDraft(ctx context.Context, draft *models.EmployeeDraft) error {
	payload := draft.Payload
	if len(payload) == 0 {
		payload = json.RawMessage(`{}`)
	}
	completed, _ := json.Marshal(draft.CompletedSections)

	row := r.pool.QueryRow(ctx, `
		INSERT INTO employee_drafts (
			draft_ref, owner_user_id, owner_email, owner_name, status, current_step,
			version, display_name, employee_code, payload, completed_sections, last_saved_at
		) VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $8, $9, $10, now())
		RETURNING `+draftColumns,
		draft.DraftRef, draft.OwnerUserID, draft.OwnerEmail, draft.OwnerName,
		models.DraftStatusDraft, draft.CurrentStep, draft.DisplayName,
		nullIfEmpty(draft.EmployeeCode), payload, completed,
	)
	saved, err := scanDraft(row)
	if err != nil {
		return fmt.Errorf("failed to create employee draft: %w", err)
	}
	*draft = *saved
	return nil
}

func (r *employeeOnboardingRepository) GetDraft(ctx context.Context, id int) (*models.EmployeeDraft, error) {
	row := r.pool.QueryRow(ctx, `SELECT `+draftColumns+` FROM employee_drafts WHERE id = $1`, id)
	draft, err := scanDraft(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("draft not found")
		}
		return nil, fmt.Errorf("failed to get employee draft: %w", err)
	}
	return draft, nil
}

func (r *employeeOnboardingRepository) ListDrafts(ctx context.Context, filter models.EmployeeDraftFilter) ([]*models.EmployeeDraftSummary, int, error) {
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.PageSize <= 0 {
		filter.PageSize = 20
	}
	offset := (filter.Page - 1) * filter.PageSize

	var search, status, owner *string
	if filter.Search != "" {
		search = &filter.Search
	}
	if filter.Status != "" {
		status = &filter.Status
	}
	if filter.OwnerID != "" {
		owner = &filter.OwnerID
	}

	var total int
	err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM employee_drafts
		WHERE ($1::text IS NULL OR display_name ILIKE '%' || $1 || '%' OR employee_code ILIKE '%' || $1 || '%' OR owner_email ILIKE '%' || $1 || '%')
		  AND ($2::text IS NULL OR status = $2)
		  AND ($3::uuid IS NULL OR owner_user_id = $3)
	`, search, status, owner).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count drafts: %w", err)
	}

	rows, err := r.pool.Query(ctx, `
		SELECT id, draft_ref, display_name, COALESCE(employee_code, ''), status, current_step,
		       completed_sections, owner_email, owner_name, owner_user_id::text, last_saved_at, created_at
		FROM employee_drafts
		WHERE ($1::text IS NULL OR display_name ILIKE '%' || $1 || '%' OR employee_code ILIKE '%' || $1 || '%' OR owner_email ILIKE '%' || $1 || '%')
		  AND ($2::text IS NULL OR status = $2)
		  AND ($3::uuid IS NULL OR owner_user_id = $3)
		ORDER BY updated_at DESC
		LIMIT $4 OFFSET $5
	`, search, status, owner, filter.PageSize, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list drafts: %w", err)
	}
	defer rows.Close()

	drafts := []*models.EmployeeDraftSummary{}
	for rows.Next() {
		var d models.EmployeeDraftSummary
		var completed []byte
		if err := rows.Scan(
			&d.ID, &d.DraftRef, &d.DisplayName, &d.EmployeeCode, &d.Status, &d.CurrentStep,
			&completed, &d.OwnerEmail, &d.OwnerName, &d.OwnerUserID, &d.LastSavedAt, &d.CreatedAt,
		); err != nil {
			return nil, 0, err
		}
		d.CompletedSections = []string{}
		_ = json.Unmarshal(completed, &d.CompletedSections)
		drafts = append(drafts, &d)
	}
	return drafts, total, rows.Err()
}

func (r *employeeOnboardingRepository) SaveDraft(
	ctx context.Context,
	id int,
	payload json.RawMessage,
	completedSections []string,
	currentStep int,
	version int,
	displayName string,
	employeeCode string,
) (*models.EmployeeDraft, error) {
	completed, _ := json.Marshal(completedSections)
	row := r.pool.QueryRow(ctx, `
		UPDATE employee_drafts
		SET payload = $2::jsonb,
		    completed_sections = $3::jsonb,
		    current_step = $4,
		    version = version + 1,
		    display_name = COALESCE(NULLIF($5, ''), display_name),
		    employee_code = COALESCE(NULLIF($6, ''), employee_code),
		    status = CASE WHEN status = 'Converted' THEN status ELSE 'Draft' END,
		    last_saved_at = now(),
		    updated_at = now()
		WHERE id = $1 AND version = $7 AND status <> 'Converted'
		RETURNING `+draftColumns,
		id, payload, completed, currentStep, displayName, employeeCode, version,
	)
	draft, err := scanDraft(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, interfaces.ErrVersionConflict
		}
		return nil, fmt.Errorf("failed to save draft: %w", err)
	}
	return draft, nil
}

func (r *employeeOnboardingRepository) UpdateDraftMeta(ctx context.Context, id int, status string, currentStep int, version int) (*models.EmployeeDraft, error) {
	row := r.pool.QueryRow(ctx, `
		UPDATE employee_drafts
		SET status = CASE WHEN status = 'Converted' THEN status ELSE $2 END,
		    current_step = $3,
		    version = version + 1,
		    updated_at = now()
		WHERE id = $1 AND version = $4 AND status <> 'Converted'
		RETURNING `+draftColumns,
		id, status, currentStep, version,
	)
	draft, err := scanDraft(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, interfaces.ErrVersionConflict
		}
		return nil, fmt.Errorf("failed to update draft: %w", err)
	}
	return draft, nil
}

func (r *employeeOnboardingRepository) DeleteDraft(ctx context.Context, id int) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM employee_drafts WHERE id = $1 AND status <> 'Converted'`, id)
	if err != nil {
		return fmt.Errorf("failed to delete draft: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return errors.New("draft not found or already submitted")
	}
	return nil
}

// SubmitDraft converts a draft into a real employee inside a single transaction.
// Any failure (validation, duplicate code, unavailable asset) rolls everything back,
// so a partially created employee can never exist.
func (r *employeeOnboardingRepository) SubmitDraft(
	ctx context.Context,
	draft *models.EmployeeDraft,
	payload *models.EmployeeDraftPayload,
	opts interfaces.SubmitOptions,
) (int, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Lock the draft row so two concurrent submissions cannot both succeed.
	var currentVersion int
	var status string
	err = tx.QueryRow(ctx, `SELECT version, status FROM employee_drafts WHERE id = $1 FOR UPDATE`, draft.ID).
		Scan(&currentVersion, &status)
	if err != nil {
		return 0, fmt.Errorf("failed to load draft: %w", err)
	}
	if status == models.DraftStatusConverted {
		return 0, errors.New("draft has already been submitted")
	}
	if currentVersion != draft.Version {
		return 0, interfaces.ErrVersionConflict
	}

	emp := payload.Employment
	personal := payload.Personal

	// Employee identity numbers must stay unique. Serialise generation with an
	// advisory lock so concurrent submits cannot pick the same code.
	if _, err := tx.Exec(ctx, `SELECT pg_advisory_xact_lock(hashtext('crystalspace_employee_code'))`); err != nil {
		return 0, fmt.Errorf("failed to lock employee code generation: %w", err)
	}

	code := strings.TrimSpace(emp.EmployeeCode)
	if code == "" {
		code, err = nextEmployeeCodeTx(ctx, tx)
		if err != nil {
			return 0, err
		}
	} else {
		var taken bool
		if err := tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM employees WHERE lower(employee_code) = lower($1))`, code).Scan(&taken); err != nil {
			return 0, err
		}
		if taken {
			return 0, fmt.Errorf("employee code %s is already in use", code)
		}
	}

	workEmail := strings.TrimSpace(strings.ToLower(emp.WorkEmail))
	if workEmail == "" {
		workEmail = strings.TrimSpace(strings.ToLower(personal.PersonalEmail))
	}
	if workEmail == "" {
		return 0, errors.New("an email address is required to create the employee record")
	}
	var emailTaken bool
	if err := tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM employees WHERE lower(email) = lower($1))`, workEmail).Scan(&emailTaken); err != nil {
		return 0, err
	}
	if emailTaken {
		return 0, fmt.Errorf("an employee with email %s already exists", workEmail)
	}

	joining := parseDateOrNow(emp.DateOfJoining)
	statusValue := emp.EmploymentStatus
	if statusValue == "" {
		statusValue = "Active"
	}
	location := emp.WorkLocation
	if location == "" {
		location = "Headquarters"
	}
	workMode := emp.WorkMode
	if workMode == "" {
		workMode = "Onsite"
	}
	employmentType := emp.EmploymentType
	if employmentType == "" {
		employmentType = "FullTime"
	}

	// Role assignment is validated before this call; the primary role becomes the
	// employee's application role.
	var userID *string
	if opts.CreateAccount {
		var existingID string
		err := tx.QueryRow(ctx, `SELECT id::text FROM users WHERE lower(email) = lower($1)`, workEmail).Scan(&existingID)
		switch {
		case err == nil:
			userID = &existingID
		case errors.Is(err, pgx.ErrNoRows):
			role := "Employee"
			if len(opts.Roles) > 0 {
				role = opts.Roles[0]
			}
			newID := ""
			if err := tx.QueryRow(ctx, `
				INSERT INTO users (email, password_hash, role, is_active)
				VALUES ($1, $2, $3, TRUE) RETURNING id::text
			`, workEmail, opts.PasswordHash, role).Scan(&newID); err != nil {
				return 0, fmt.Errorf("failed to provision login account: %w", err)
			}
			userID = &newID
		default:
			return 0, err
		}
	}

	var probationEnd, contractEnd interface{}
	if emp.ProbationMonths > 0 && emp.ProbationEndDate == "" {
		probationEnd = joining.AddDate(0, emp.ProbationMonths, 0)
	} else if emp.ProbationEndDate != "" {
		probationEnd = parseDatePtr(emp.ProbationEndDate)
	}
	if emp.ContractEndDate != "" {
		contractEnd = parseDatePtr(emp.ContractEndDate)
	}

	var employeeID int
	err = tx.QueryRow(ctx, `
		INSERT INTO employees (
			user_id, first_name, last_name, middle_name, email, personal_email, phone_number,
			alternate_phone, designation, job_title, department_id, manager_id, secondary_approver_id,
			employee_code, office_location, work_location, date_of_joining, status, onboarding_status,
			probation_end_date, contract_end_date, work_schedule_id, attendance_policy, holiday_calendar,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, NULLIF($4, ''), $5, NULLIF($6, ''), $7,
			NULLIF($8, ''), $9, NULLIF($10, ''), $11, $12, $13,
			$14, $15, NULLIF($16, ''), $17, $18, 'Completed',
			$19, $20, NULLIF($21, 0), NULLIF($22, ''), NULLIF($23, ''),
			now(), now()
		) RETURNING id
	`,
		userID, personal.FirstName, personal.LastName, personal.MiddleName, workEmail,
		personal.PersonalEmail, personal.PhoneNumber, personal.AlternatePhone,
		emp.Designation, emp.JobTitle, emp.DepartmentID, emp.ManagerID, emp.SecondaryApproverID,
		code, location, emp.WorkLocation, joining, statusValue,
		probationEnd, contractEnd, payload.Schedule.WorkScheduleID,
		payload.Schedule.AttendancePolicy, payload.Schedule.HolidayCalendar,
	).Scan(&employeeID)
	if err != nil {
		return 0, fmt.Errorf("failed to create employee: %w", err)
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO employee_personal_details (
			employee_id, date_of_birth, address, permanent_address, personal_email,
			alternate_phone, country
		) VALUES ($1, $2, NULLIF($3, ''), NULLIF($4, ''), NULLIF($5, ''), NULLIF($6, ''), 'India')
		ON CONFLICT (employee_id) DO UPDATE SET
			date_of_birth = EXCLUDED.date_of_birth,
			address = EXCLUDED.address,
			permanent_address = EXCLUDED.permanent_address,
			personal_email = EXCLUDED.personal_email,
			alternate_phone = EXCLUDED.alternate_phone
	`,
		employeeID, parseDatePtr(personal.DateOfBirth), personal.CurrentAddress,
		personal.PermanentAddress, personal.PersonalEmail, personal.AlternatePhone,
	)
	if err != nil {
		return 0, fmt.Errorf("failed to save personal details: %w", err)
	}

	if personal.EmergencyContactName != "" {
		_, err = tx.Exec(ctx, `
			INSERT INTO emergency_contacts (employee_id, contact_name, relationship, phone)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (employee_id) DO UPDATE SET
				contact_name = EXCLUDED.contact_name,
				relationship = EXCLUDED.relationship,
				phone = EXCLUDED.phone
		`, employeeID, personal.EmergencyContactName, personal.EmergencyRelationship, personal.EmergencyPhone)
		if err != nil {
			return 0, fmt.Errorf("failed to save emergency contact: %w", err)
		}
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO employee_professional_details (employee_id, employment_type, work_mode, total_experience_years)
		VALUES ($1, $2, $3, 0)
		ON CONFLICT (employee_id) DO UPDATE SET
			employment_type = EXCLUDED.employment_type,
			work_mode = EXCLUDED.work_mode
	`, employeeID, employmentType, workMode)
	if err != nil {
		return 0, fmt.Errorf("failed to save professional details: %w", err)
	}
	// Compensation is only written when the section was present and authorised.
	if payload.Compensation != nil {
		c := payload.Compensation
		effective := parseDateOrNow(c.EffectiveDate)
		gross := c.BasicSalary + c.HRA + c.Conveyance + c.MedicalAllowance + c.SpecialAllowance
		net := gross - (c.EmployeePF + c.ProfessionalTax + c.TDS)
		_, err = tx.Exec(ctx, `
			INSERT INTO salaries (
				employee_id, basic_salary, hra, conveyance, medical_allowance, special_allowance,
				provident_fund, professional_tax, tds, gross_salary, net_salary, effective_date,
				created_at, updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now(), now())
			ON CONFLICT (employee_id) DO UPDATE SET
				basic_salary = EXCLUDED.basic_salary,
				hra = EXCLUDED.hra,
				conveyance = EXCLUDED.conveyance,
				medical_allowance = EXCLUDED.medical_allowance,
				special_allowance = EXCLUDED.special_allowance,
				provident_fund = EXCLUDED.provident_fund,
				professional_tax = EXCLUDED.professional_tax,
				tds = EXCLUDED.tds,
				gross_salary = EXCLUDED.gross_salary,
				net_salary = EXCLUDED.net_salary,
				effective_date = EXCLUDED.effective_date,
				updated_at = now()
		`, employeeID, c.BasicSalary, c.HRA, c.Conveyance, c.MedicalAllowance, c.SpecialAllowance,
			c.EmployeePF, c.ProfessionalTax, c.TDS, gross, net, effective)
		if err != nil {
			return 0, fmt.Errorf("failed to save compensation: %w", err)
		}
	}

	for _, doc := range payload.Documents {
		storageKey := doc.StorageKey
		if storageKey == "" {
			storageKey = "pending/" + doc.FileName
		}
		verification := doc.VerificationStatus
		if verification == "" {
			verification = "Pending"
		}
		_, err = tx.Exec(ctx, `
			INSERT INTO employee_documents (
				employee_id, document_type, document_type_code, file_name, file_path, file_size,
				uploaded_by, verification_status, expiry_date, notes, storage_key, mime_type
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULLIF($10, ''), $11, NULLIF($12, ''))
		`, employeeID, doc.DocumentTypeCode, doc.DocumentTypeCode, doc.FileName, storageKey,
			doc.FileSize, userID, verification, parseDatePtr(doc.ExpiryDate), doc.Notes,
			storageKey, doc.MimeType)
		if err != nil {
			return 0, fmt.Errorf("failed to save document metadata: %w", err)
		}
	}

	for _, alloc := range payload.Schedule.Allocations {
		if alloc.LeaveTypeID <= 0 || alloc.Days <= 0 {
			continue
		}
		effective := parseDateOrNow(alloc.EffectiveFrom)
		_, err = tx.Exec(ctx, `
			INSERT INTO employee_leave_allocations (
				employee_id, leave_type_id, policy_name, allocated_days, effective_from
			) VALUES ($1, $2, NULLIF($3, ''), $4, $5)
			ON CONFLICT (employee_id, leave_type_id, effective_from) DO UPDATE SET
				allocated_days = EXCLUDED.allocated_days,
				policy_name = EXCLUDED.policy_name,
				updated_at = now()
		`, employeeID, alloc.LeaveTypeID, payload.Schedule.LeavePolicy, alloc.Days, effective)
		if err != nil {
			return 0, fmt.Errorf("failed to save leave allocation: %w", err)
		}
	}

	for _, item := range payload.Devices.Assets {
		if item.AssetTag == "" {
			continue
		}
		var assetID int
		var assetStatus string
		err := tx.QueryRow(ctx, `SELECT id, status FROM assets WHERE asset_tag = $1 FOR UPDATE`, item.AssetTag).
			Scan(&assetID, &assetStatus)
		if errors.Is(err, pgx.ErrNoRows) {
			err = tx.QueryRow(ctx, `
				INSERT INTO assets (
					asset_tag, category, manufacturer, model, serial_number, condition,
					accessories, software_licenses, status
				) VALUES ($1, $2, NULLIF($3, ''), NULLIF($4, ''), NULLIF($5, ''), COALESCE(NULLIF($6, ''), 'Good'),
					NULLIF($7, ''), NULLIF($8, ''), 'Assigned')
				RETURNING id
			`, item.AssetTag, item.Category, item.Manufacturer, item.Model, item.SerialNumber,
				item.Condition, item.Accessories, item.SoftwareLicenses).Scan(&assetID)
			if err != nil {
				return 0, fmt.Errorf("failed to create asset %s: %w", item.AssetTag, err)
			}
		} else if err != nil {
			return 0, err
		} else {
			if assetStatus != "Available" {
				return 0, fmt.Errorf("asset %s is not available (current status: %s)", item.AssetTag, assetStatus)
			}
			if _, err := tx.Exec(ctx, `UPDATE assets SET status = 'Assigned', updated_at = now() WHERE id = $1`, assetID); err != nil {
				return 0, err
			}
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO asset_assignments (
				asset_id, employee_id, assigned_by, expected_return_date, acknowledgement, notes
			) VALUES ($1, $2, $3, $4, $5, NULLIF($6, ''))
		`, assetID, employeeID, nullIfEmpty(opts.Actor.UserID),
			parseDatePtr(item.IssueDate), item.Acknowledgement, item.Notes)
		if err != nil {
			return 0, fmt.Errorf("failed to record asset assignment: %w", err)
		}
	}

	if _, err := tx.Exec(ctx, `
		UPDATE employee_drafts
		SET status = 'Converted', submitted_employee_id = $2, version = version + 1, updated_at = now()
		WHERE id = $1
	`, draft.ID, employeeID); err != nil {
		return 0, fmt.Errorf("failed to finalise draft: %w", err)
	}

	details, _ := json.Marshal(map[string]any{
		"employee_code":   code,
		"department_id":   emp.DepartmentID,
		"designation":     emp.Designation,
		"account_created": opts.CreateAccount,
		"roles":           opts.Roles,
	})
	if err := insertAudit(ctx, tx, &models.EmployeeAuditLog{
		EmployeeID:  &employeeID,
		DraftID:     &draft.ID,
		ActorUserID: opts.Actor.UserID,
		ActorEmail:  opts.Actor.Email,
		ActorRole:   opts.Actor.Role,
		Action:      "employee.create",
		Section:     models.DraftSectionReview,
		Summary:     fmt.Sprintf("Employee %s %s (%s) created from draft %s", personal.FirstName, personal.LastName, code, draft.DraftRef),
		Details:     details,
	}); err != nil {
		return 0, err
	}

	if err := tx.Commit(ctx); err != nil {
		return 0, fmt.Errorf("failed to commit employee submission: %w", err)
	}
	return employeeID, nil
}

func (r *employeeOnboardingRepository) Audit(ctx context.Context, log *models.EmployeeAuditLog) error {
	return insertAudit(ctx, r.pool, log)
}

// auditExecer is satisfied by both *pgxpool.Pool and pgx.Tx.
type auditExecer interface {
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
}

func insertAudit(ctx context.Context, q auditExecer, log *models.EmployeeAuditLog) error {
	details := log.Details
	if len(details) == 0 {
		details = json.RawMessage(`{}`)
	}
	if _, err := q.Exec(ctx, `
		INSERT INTO employee_audit_logs (
			employee_id, draft_id, actor_user_id, actor_email, actor_role, action, section, summary, details
		) VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, ''), $8, $9)
	`, log.EmployeeID, log.DraftID, nullIfEmpty(log.ActorUserID), log.ActorEmail, log.ActorRole,
		log.Action, log.Section, log.Summary, details); err != nil {
		return fmt.Errorf("failed to write audit log: %w", err)
	}
	return nil
}

func (r *employeeOnboardingRepository) ListAudit(ctx context.Context, employeeID int) ([]*models.EmployeeAuditLog, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, employee_id, draft_id, COALESCE(actor_user_id::text, ''), actor_email, actor_role,
		       action, COALESCE(section, ''), summary, details, created_at
		FROM employee_audit_logs
		WHERE employee_id = $1
		ORDER BY created_at DESC
		LIMIT 200
	`, employeeID)
	if err != nil {
		return nil, fmt.Errorf("failed to list audit history: %w", err)
	}
	defer rows.Close()

	logs := []*models.EmployeeAuditLog{}
	for rows.Next() {
		var l models.EmployeeAuditLog
		var details []byte
		if err := rows.Scan(&l.ID, &l.EmployeeID, &l.DraftID, &l.ActorUserID, &l.ActorEmail,
			&l.ActorRole, &l.Action, &l.Section, &l.Summary, &details, &l.CreatedAt); err != nil {
			return nil, err
		}
		l.Details = json.RawMessage(details)
		logs = append(logs, &l)
	}
	return logs, rows.Err()
}

func (r *employeeOnboardingRepository) ListDocumentTypes(ctx context.Context) ([]*models.DocumentType, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, code, name, COALESCE(description, ''), is_required, allowed_extensions, max_size_bytes, sort_order
		FROM document_types WHERE is_active = TRUE ORDER BY sort_order, name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []*models.DocumentType{}
	for rows.Next() {
		var d models.DocumentType
		if err := rows.Scan(&d.ID, &d.Code, &d.Name, &d.Description, &d.IsRequired,
			&d.AllowedExtensions, &d.MaxSizeBytes, &d.SortOrder); err != nil {
			return nil, err
		}
		out = append(out, &d)
	}
	return out, rows.Err()
}

func (r *employeeOnboardingRepository) ListWorkSchedules(ctx context.Context) ([]*models.WorkSchedule, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, work_days, weekly_off_days, expected_hours,
		       COALESCE(to_char(shift_start, 'HH24:MI'), ''), COALESCE(to_char(shift_end, 'HH24:MI'), ''),
		       COALESCE(attendance_policy, '')
		FROM work_schedules WHERE is_active = TRUE ORDER BY name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []*models.WorkSchedule{}
	for rows.Next() {
		var w models.WorkSchedule
		if err := rows.Scan(&w.ID, &w.Name, &w.WorkDays, &w.WeeklyOffDays, &w.ExpectedHours,
			&w.ShiftStart, &w.ShiftEnd, &w.AttendancePolicy); err != nil {
			return nil, err
		}
		out = append(out, &w)
	}
	return out, rows.Err()
}

func (r *employeeOnboardingRepository) ListLeavePolicies(ctx context.Context) ([]*models.LeavePolicy, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, COALESCE(description, '') FROM leave_policies WHERE is_active = TRUE ORDER BY name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []*models.LeavePolicy{}
	for rows.Next() {
		var p models.LeavePolicy
		if err := rows.Scan(&p.ID, &p.Name, &p.Description); err != nil {
			return nil, err
		}
		out = append(out, &p)
	}
	return out, rows.Err()
}

func (r *employeeOnboardingRepository) ListAssets(ctx context.Context) ([]*models.Asset, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT a.id, a.asset_tag, a.category, COALESCE(a.manufacturer, ''), COALESCE(a.model, ''),
		       COALESCE(a.serial_number, ''), a.condition, COALESCE(a.accessories, ''),
		       COALESCE(a.software_licenses, ''), a.status,
		       COALESCE(e.first_name || ' ' || e.last_name, ''), aa.employee_id
		FROM assets a
		LEFT JOIN asset_assignments aa ON aa.asset_id = a.id AND aa.returned_at IS NULL
		LEFT JOIN employees e ON e.id = aa.employee_id
		ORDER BY a.asset_tag
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []*models.Asset{}
	for rows.Next() {
		var a models.Asset
		if err := rows.Scan(&a.ID, &a.AssetTag, &a.Category, &a.Manufacturer, &a.Model,
			&a.SerialNumber, &a.Condition, &a.Accessories, &a.SoftwareLicenses, &a.Status,
			&a.AssignedToName, &a.AssignedToID); err != nil {
			return nil, err
		}
		out = append(out, &a)
	}
	return out, rows.Err()
}

func (r *employeeOnboardingRepository) EmployeeEmailTaken(ctx context.Context, email string, excludeID int) (bool, error) {
	var taken bool
	err := r.pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM employees WHERE lower(email) = lower($1) AND id <> $2)`,
		email, excludeID).Scan(&taken)
	return taken, err
}

func (r *employeeOnboardingRepository) EmployeeCodeTaken(ctx context.Context, code string) (bool, error) {
	var taken bool
	err := r.pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM employees WHERE lower(employee_code) = lower($1))`, code).Scan(&taken)
	return taken, err
}

func (r *employeeOnboardingRepository) NextEmployeeCode(ctx context.Context) (string, error) {
	var code string
	err := r.pool.QueryRow(ctx, `
		SELECT 'EMP-' || LPAD((COALESCE(MAX(NULLIF(regexp_replace(employee_code, '\D', '', 'g'), '')::int), 0) + 1)::text, 4, '0')
		FROM employees
	`).Scan(&code)
	if err != nil {
		return "", err
	}
	return code, nil
}

func nextEmployeeCodeTx(ctx context.Context, tx pgx.Tx) (string, error) {
	for i := 1; i <= 50; i++ {
		var seq int
		if err := tx.QueryRow(ctx, `
			SELECT COALESCE(MAX(NULLIF(regexp_replace(employee_code, '\D', '', 'g'), '')::int), 0) FROM employees
		`).Scan(&seq); err != nil {
			return "", err
		}
		code := fmt.Sprintf("EMP-%04d", seq+i)
		var taken bool
		if err := tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM employees WHERE employee_code = $1)`, code).Scan(&taken); err != nil {
			return "", err
		}
		if !taken {
			return code, nil
		}
	}
	return "", errors.New("unable to allocate a unique employee code")
}

func (r *employeeOnboardingRepository) RoleExists(ctx context.Context, role string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM roles WHERE name = $1)`, role).Scan(&exists)
	return exists, err
}

func nullIfEmpty(v string) interface{} {
	if strings.TrimSpace(v) == "" {
		return nil
	}
	return v
}

func parseDateOrNow(v string) time.Time {
	if t, err := time.Parse("2006-01-02", v); err == nil {
		return t
	}
	return time.Now().UTC().Truncate(24 * time.Hour)
}

func parseDatePtr(v string) interface{} {
	if strings.TrimSpace(v) == "" {
		return nil
	}
	t, err := time.Parse("2006-01-02", v)
	if err != nil {
		return nil
	}
	return t
}

// DraftDisplayName builds the list title from the personal section.
func DraftDisplayName(p *models.EmployeeDraftPayload) string {
	return strings.TrimSpace(strings.Join([]string{p.Personal.FirstName, p.Personal.MiddleName, p.Personal.LastName}, " "))
}

func (r *employeeOnboardingRepository) ListDocuments(ctx context.Context, employeeID int) ([]*models.EmployeeDocumentRecord, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT d.id, COALESCE(d.document_type_code, d.document_type),
		       COALESCE(dt.name, d.document_type), d.file_name, d.file_size, d.verification_status,
		       COALESCE(u.email, ''), d.verified_at, d.expiry_date, COALESCE(d.notes, ''),
		       COALESCE(d.rejection_reason, ''), d.uploaded_at
		FROM employee_documents d
		LEFT JOIN document_types dt ON dt.code = COALESCE(d.document_type_code, d.document_type)
		LEFT JOIN users u ON u.id = d.verified_by
		WHERE d.employee_id = $1
		ORDER BY d.uploaded_at DESC
	`, employeeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []*models.EmployeeDocumentRecord{}
	for rows.Next() {
		var d models.EmployeeDocumentRecord
		if err := rows.Scan(&d.ID, &d.DocumentType, &d.DocumentTypeName, &d.FileName, &d.FileSize,
			&d.VerificationStatus, &d.VerifiedBy, &d.VerifiedAt, &d.ExpiryDate, &d.Notes,
			&d.RejectionReason, &d.UploadedAt); err != nil {
			return nil, err
		}
		out = append(out, &d)
	}
	return out, rows.Err()
}

func (r *employeeOnboardingRepository) ListAssetAssignments(ctx context.Context, employeeID int) ([]*models.EmployeeAssetAssignment, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT aa.id, a.asset_tag, a.category, COALESCE(a.manufacturer, ''), COALESCE(a.model, ''),
		       COALESCE(a.serial_number, ''), aa.assigned_at, aa.returned_at, aa.acknowledgement,
		       COALESCE(aa.notes, '')
		FROM asset_assignments aa
		JOIN assets a ON a.id = aa.asset_id
		WHERE aa.employee_id = $1
		ORDER BY aa.assigned_at DESC
	`, employeeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []*models.EmployeeAssetAssignment{}
	for rows.Next() {
		var a models.EmployeeAssetAssignment
		if err := rows.Scan(&a.ID, &a.AssetTag, &a.Category, &a.Manufacturer, &a.Model,
			&a.SerialNumber, &a.AssignedAt, &a.ReturnedAt, &a.Acknowledgement, &a.Notes); err != nil {
			return nil, err
		}
		out = append(out, &a)
	}
	return out, rows.Err()
}

func (r *employeeOnboardingRepository) ListLeaveAllocations(ctx context.Context, employeeID int) ([]*models.EmployeeLeaveAllocation, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT la.id, la.leave_type_id, COALESCE(lt.name, 'Leave'), COALESCE(la.policy_name, ''),
		       la.allocated_days, la.used_days, la.effective_from
		FROM employee_leave_allocations la
		LEFT JOIN leave_types lt ON lt.id = la.leave_type_id
		WHERE la.employee_id = $1
		ORDER BY la.effective_from DESC, lt.name
	`, employeeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []*models.EmployeeLeaveAllocation{}
	for rows.Next() {
		var a models.EmployeeLeaveAllocation
		if err := rows.Scan(&a.ID, &a.LeaveTypeID, &a.LeaveTypeName, &a.PolicyName,
			&a.AllocatedDays, &a.UsedDays, &a.EffectiveFrom); err != nil {
			return nil, err
		}
		out = append(out, &a)
	}
	return out, rows.Err()
}

func (r *employeeOnboardingRepository) GetAccess(ctx context.Context, employeeID int) (*models.EmployeeAccessInfo, error) {
	var info models.EmployeeAccessInfo
	var createdAt *time.Time
	err := r.pool.QueryRow(ctx, `
		SELECT COALESCE(u.email, e.email), COALESCE(u.role, ''), COALESCE(u.is_active, FALSE), u.created_at
		FROM employees e
		LEFT JOIN users u ON u.id = e.user_id
		WHERE e.id = $1
	`, employeeID).Scan(&info.WorkEmail, &info.Role, &info.IsActive, &createdAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("employee not found")
		}
		return nil, err
	}
	if createdAt != nil {
		info.ProvisioningStatus = "Provisioned"
		info.AccountCreatedAt = createdAt.Format(time.RFC3339)
	} else {
		info.ProvisioningStatus = "Not provisioned"
	}
	return &info, nil
}
