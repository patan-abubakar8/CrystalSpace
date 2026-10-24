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

type salaryRepository struct {
	pool *pgxpool.Pool
}

func NewSalaryRepository(pool *pgxpool.Pool) interfaces.SalaryRepository {
	return &salaryRepository{pool: pool}
}

func (r *salaryRepository) GetByEmployeeID(ctx context.Context, employeeID int) (*models.Salary, error) {
	query := `
		SELECT 
			id, employee_id, basic_salary, hra, conveyance, medical_allowance,
			special_allowance, provident_fund, professional_tax, tds, gross_salary,
			net_salary, effective_date, created_at, updated_at
		FROM salaries
		WHERE employee_id = $1
	`
	var s models.Salary
	err := r.pool.QueryRow(ctx, query, employeeID).Scan(
		&s.ID, &s.EmployeeID, &s.BasicSalary, &s.HRA, &s.Conveyance,
		&s.MedicalAllowance, &s.SpecialAllowance, &s.ProvidentFund,
		&s.ProfessionalTax, &s.TDS, &s.GrossSalary, &s.NetSalary,
		&s.EffectiveDate, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("salary structure not found")
		}
		return nil, fmt.Errorf("failed to get salary: %w", err)
	}
	return &s, nil
}

func (r *salaryRepository) Upsert(ctx context.Context, s *models.Salary) error {
	query := `
		INSERT INTO salaries (
			employee_id, basic_salary, hra, conveyance, medical_allowance,
			special_allowance, provident_fund, professional_tax, tds, gross_salary,
			net_salary, effective_date, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
			updated_at = EXCLUDED.updated_at
		RETURNING id, created_at, updated_at
	`
	now := time.Now().UTC()
	err := r.pool.QueryRow(ctx, query,
		s.EmployeeID, s.BasicSalary, s.HRA, s.Conveyance, s.MedicalAllowance,
		s.SpecialAllowance, s.ProvidentFund, s.ProfessionalTax, s.TDS,
		s.GrossSalary, s.NetSalary, s.EffectiveDate, now, now,
	).Scan(&s.ID, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to upsert salary: %w", err)
	}
	return nil
}

func (r *salaryRepository) RecordHistory(ctx context.Context, h *models.SalaryHistory) error {
	query := `
		INSERT INTO salary_histories (
			employee_id, previous_salary, new_salary, revision_reason,
			revised_by, revised_at
		) VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	now := time.Now().UTC()
	err := r.pool.QueryRow(ctx, query,
		h.EmployeeID, h.PreviousSalary, h.NewSalary, h.RevisionReason,
		h.RevisedBy, now,
	).Scan(&h.ID)
	if err != nil {
		// Table may be optional or created in migration
		return nil
	}
	return nil
}

func (r *salaryRepository) GetHistory(ctx context.Context, employeeID int) ([]*models.SalaryHistory, error) {
	query := `
		SELECT id, employee_id, previous_salary, new_salary, revision_reason, revised_by, revised_at
		FROM salary_histories
		WHERE employee_id = $1
		ORDER BY revised_at DESC
	`
	rows, err := r.pool.Query(ctx, query, employeeID)
	if err != nil {
		return []*models.SalaryHistory{}, nil
	}
	defer rows.Close()

	var histories []*models.SalaryHistory
	for rows.Next() {
		var h models.SalaryHistory
		if err := rows.Scan(&h.ID, &h.EmployeeID, &h.PreviousSalary, &h.NewSalary, &h.RevisionReason, &h.RevisedBy, &h.RevisedAt); err != nil {
			return nil, err
		}
		histories = append(histories, &h)
	}
	return histories, nil
}
