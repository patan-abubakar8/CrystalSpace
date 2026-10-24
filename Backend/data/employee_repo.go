package data

import (
	"context"
	"errors"
	"fmt"
	"time"

	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type employeeRepository struct {
	pool *pgxpool.Pool
}

func NewEmployeeRepository(pool *pgxpool.Pool) interfaces.EmployeeRepository {
	return &employeeRepository{pool: pool}
}

func (r *employeeRepository) Create(ctx context.Context, emp *models.Employee) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	now := time.Now().UTC()
	empQuery := `
		INSERT INTO employees (
			user_id, first_name, last_name, email, phone_number, designation,
			department_id, manager_id, employee_code, office_location, date_of_joining,
			status, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
		RETURNING id, created_at, updated_at
	`
	var uid *string
	if emp.UserID != "" {
		uid = &emp.UserID
	}

	err = tx.QueryRow(ctx, empQuery,
		uid, emp.FirstName, emp.LastName, emp.Email, emp.PhoneNumber, emp.Designation,
		emp.DepartmentID, emp.ManagerID, emp.EmployeeCode, emp.OfficeLocation, emp.DateOfJoining,
		emp.Status, now, now,
	).Scan(&emp.ID, &emp.CreatedAt, &emp.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert employee: %w", err)
	}

	// Insert Personal Details if provided
	if emp.PersonalDetail != nil {
		emp.PersonalDetail.EmployeeID = emp.ID
		pdQuery := `
			INSERT INTO employee_personal_details (
				employee_id, date_of_birth, gender, marital_status, blood_group,
				address, city, state, postal_code, country
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
			RETURNING id
		`
		_ = tx.QueryRow(ctx, pdQuery,
			emp.ID, emp.PersonalDetail.DateOfBirth, emp.PersonalDetail.Gender,
			emp.PersonalDetail.MaritalStatus, emp.PersonalDetail.BloodGroup,
			emp.PersonalDetail.Address, emp.PersonalDetail.City, emp.PersonalDetail.State,
			emp.PersonalDetail.PostalCode, emp.PersonalDetail.Country,
		).Scan(&emp.PersonalDetail.ID)
	}

	// Insert Emergency Contact if provided
	if emp.EmergencyContact != nil {
		emp.EmergencyContact.EmployeeID = emp.ID
		ecQuery := `
			INSERT INTO emergency_contacts (
				employee_id, contact_name, relationship, phone, alternate_phone
			) VALUES ($1, $2, $3, $4, $5)
			RETURNING id
		`
		_ = tx.QueryRow(ctx, ecQuery,
			emp.ID, emp.EmergencyContact.ContactName, emp.EmergencyContact.Relationship,
			emp.EmergencyContact.Phone, emp.EmergencyContact.AlternatePhone,
		).Scan(&emp.EmergencyContact.ID)
	}

	// Insert Professional Detail if provided
	if emp.ProfessionalDetail != nil {
		emp.ProfessionalDetail.EmployeeID = emp.ID
		prdQuery := `
			INSERT INTO employee_professional_details (
				employee_id, employment_type, work_mode, total_experience_years,
				previous_employer, skills
			) VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id
		`
		_ = tx.QueryRow(ctx, prdQuery,
			emp.ID, emp.ProfessionalDetail.EmploymentType, emp.ProfessionalDetail.WorkMode,
			emp.ProfessionalDetail.TotalExperienceYears, emp.ProfessionalDetail.PreviousEmployer,
			emp.ProfessionalDetail.Skills,
		).Scan(&emp.ProfessionalDetail.ID)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit employee transaction: %w", err)
	}
	return nil
}

func (r *employeeRepository) GetByID(ctx context.Context, id int) (*models.Employee, error) {
	query := `
		SELECT 
			e.id, COALESCE(e.user_id::text, ''), e.first_name, e.last_name, e.email,
			COALESCE(e.phone_number, ''), e.designation, e.department_id,
			COALESCE(d.name, ''), e.manager_id, COALESCE(e.employee_code, ''),
			e.office_location, e.date_of_joining, e.status, e.created_at, e.updated_at
		FROM employees e
		LEFT JOIN departments d ON e.department_id = d.id
		WHERE e.id = $1
	`
	var emp models.Employee
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&emp.ID, &emp.UserID, &emp.FirstName, &emp.LastName, &emp.Email,
		&emp.PhoneNumber, &emp.Designation, &emp.DepartmentID,
		&emp.DepartmentName, &emp.ManagerID, &emp.EmployeeCode,
		&emp.OfficeLocation, &emp.DateOfJoining, &emp.Status,
		&emp.CreatedAt, &emp.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("employee not found")
		}
		return nil, fmt.Errorf("failed to get employee by id: %w", err)
	}

	// Load 1-to-1 relations
	emp.PersonalDetail = r.getPersonalDetail(ctx, emp.ID)
	emp.EmergencyContact = r.getEmergencyContact(ctx, emp.ID)
	emp.ProfessionalDetail = r.getProfessionalDetail(ctx, emp.ID)

	return &emp, nil
}

func (r *employeeRepository) GetByUserID(ctx context.Context, userID string) (*models.Employee, error) {
	query := `
		SELECT 
			e.id, COALESCE(e.user_id::text, ''), e.first_name, e.last_name, e.email,
			COALESCE(e.phone_number, ''), e.designation, e.department_id,
			COALESCE(d.name, ''), e.manager_id, COALESCE(e.employee_code, ''),
			e.office_location, e.date_of_joining, e.status, e.created_at, e.updated_at
		FROM employees e
		LEFT JOIN departments d ON e.department_id = d.id
		WHERE e.user_id = $1
	`
	var emp models.Employee
	err := r.pool.QueryRow(ctx, query, userID).Scan(
		&emp.ID, &emp.UserID, &emp.FirstName, &emp.LastName, &emp.Email,
		&emp.PhoneNumber, &emp.Designation, &emp.DepartmentID,
		&emp.DepartmentName, &emp.ManagerID, &emp.EmployeeCode,
		&emp.OfficeLocation, &emp.DateOfJoining, &emp.Status,
		&emp.CreatedAt, &emp.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("employee not found for user")
		}
		return nil, fmt.Errorf("failed to get employee by user id: %w", err)
	}

	emp.PersonalDetail = r.getPersonalDetail(ctx, emp.ID)
	emp.EmergencyContact = r.getEmergencyContact(ctx, emp.ID)
	emp.ProfessionalDetail = r.getProfessionalDetail(ctx, emp.ID)

	return &emp, nil
}

func (r *employeeRepository) List(ctx context.Context, filter models.EmployeeFilter) ([]*models.Employee, int, error) {
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.PageSize <= 0 {
		filter.PageSize = 20
	}
	offset := (filter.Page - 1) * filter.PageSize

	countQuery := `
		SELECT COUNT(*)
		FROM employees e
		WHERE ($1::int IS NULL OR e.department_id = $1)
		  AND ($2::text IS NULL OR e.status = $2)
		  AND ($3::text IS NULL OR e.first_name ILIKE '%' || $3 || '%' OR e.last_name ILIKE '%' || $3 || '%' OR e.email ILIKE '%' || $3 || '%')
	`
	var total int
	var deptID *int = filter.DepartmentID
	var status *string
	if filter.Status != "" {
		status = &filter.Status
	}
	var search *string
	if filter.SearchQuery != "" {
		search = &filter.SearchQuery
	}

	err := r.pool.QueryRow(ctx, countQuery, deptID, status, search).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count employees: %w", err)
	}

	query := `
		SELECT 
			e.id, COALESCE(e.user_id::text, ''), e.first_name, e.last_name, e.email,
			COALESCE(e.phone_number, ''), e.designation, e.department_id,
			COALESCE(d.name, ''), e.manager_id, COALESCE(e.employee_code, ''),
			e.office_location, e.date_of_joining, e.status, e.created_at, e.updated_at
		FROM employees e
		LEFT JOIN departments d ON e.department_id = d.id
		WHERE ($1::int IS NULL OR e.department_id = $1)
		  AND ($2::text IS NULL OR e.status = $2)
		  AND ($3::text IS NULL OR e.first_name ILIKE '%' || $3 || '%' OR e.last_name ILIKE '%' || $3 || '%' OR e.email ILIKE '%' || $3 || '%')
		ORDER BY e.created_at DESC
		LIMIT $4 OFFSET $5
	`
	rows, err := r.pool.Query(ctx, query, deptID, status, search, filter.PageSize, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list employees: %w", err)
	}
	defer rows.Close()

	var emps []*models.Employee
	for rows.Next() {
		var emp models.Employee
		if err := rows.Scan(
			&emp.ID, &emp.UserID, &emp.FirstName, &emp.LastName, &emp.Email,
			&emp.PhoneNumber, &emp.Designation, &emp.DepartmentID,
			&emp.DepartmentName, &emp.ManagerID, &emp.EmployeeCode,
			&emp.OfficeLocation, &emp.DateOfJoining, &emp.Status,
			&emp.CreatedAt, &emp.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		emps = append(emps, &emp)
	}
	return emps, total, nil
}

func (r *employeeRepository) Update(ctx context.Context, emp *models.Employee) error {
	query := `
		UPDATE employees
		SET first_name = $1, last_name = $2, phone_number = $3, designation = $4,
		    department_id = $5, manager_id = $6, office_location = $7, status = $8,
		    updated_at = $9
		WHERE id = $10
	`
	emp.UpdatedAt = time.Now().UTC()
	_, err := r.pool.Exec(ctx, query,
		emp.FirstName, emp.LastName, emp.PhoneNumber, emp.Designation,
		emp.DepartmentID, emp.ManagerID, emp.OfficeLocation, emp.Status,
		emp.UpdatedAt, emp.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update employee: %w", err)
	}
	return nil
}

func (r *employeeRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM employees WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete employee: %w", err)
	}
	return nil
}

func (r *employeeRepository) Count(ctx context.Context) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM employees WHERE status = 'Active'").Scan(&count)
	return count, err
}

func (r *employeeRepository) getPersonalDetail(ctx context.Context, empID int) *models.PersonalDetail {
	var pd models.PersonalDetail
	query := `SELECT id, employee_id, date_of_birth, COALESCE(gender, ''), COALESCE(marital_status, ''), COALESCE(blood_group, ''), COALESCE(address, ''), COALESCE(city, ''), COALESCE(state, ''), COALESCE(postal_code, ''), COALESCE(country, '') FROM employee_personal_details WHERE employee_id = $1`
	err := r.pool.QueryRow(ctx, query, empID).Scan(&pd.ID, &pd.EmployeeID, &pd.DateOfBirth, &pd.Gender, &pd.MaritalStatus, &pd.BloodGroup, &pd.Address, &pd.City, &pd.State, &pd.PostalCode, &pd.Country)
	if err != nil {
		return nil
	}
	return &pd
}

func (r *employeeRepository) getEmergencyContact(ctx context.Context, empID int) *models.EmergencyContact {
	var ec models.EmergencyContact
	query := `SELECT id, employee_id, contact_name, relationship, phone, COALESCE(alternate_phone, '') FROM emergency_contacts WHERE employee_id = $1`
	err := r.pool.QueryRow(ctx, query, empID).Scan(&ec.ID, &ec.EmployeeID, &ec.ContactName, &ec.Relationship, &ec.Phone, &ec.AlternatePhone)
	if err != nil {
		return nil
	}
	return &ec
}

func (r *employeeRepository) getProfessionalDetail(ctx context.Context, empID int) *models.ProfessionalDetail {
	var prd models.ProfessionalDetail
	query := `SELECT id, employee_id, employment_type, work_mode, total_experience_years, COALESCE(previous_employer, ''), COALESCE(skills, '') FROM employee_professional_details WHERE employee_id = $1`
	err := r.pool.QueryRow(ctx, query, empID).Scan(&prd.ID, &prd.EmployeeID, &prd.EmploymentType, &prd.WorkMode, &prd.TotalExperienceYears, &prd.PreviousEmployer, &prd.Skills)
	if err != nil {
		return nil
	}
	return &prd
}
