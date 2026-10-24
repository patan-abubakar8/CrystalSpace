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

type leaveRepository struct {
	pool *pgxpool.Pool
}

func NewLeaveRepository(pool *pgxpool.Pool) interfaces.LeaveRepository {
	return &leaveRepository{pool: pool}
}

func (r *leaveRepository) Create(ctx context.Context, l *models.Leave) error {
	query := `
		INSERT INTO leaves (
			employee_id, leave_type_id, start_date, end_date, total_days,
			reason, status, applied_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, applied_at
	`
	now := time.Now().UTC()
	err := r.pool.QueryRow(ctx, query,
		l.EmployeeID, l.LeaveTypeID, l.StartDate, l.EndDate, l.TotalDays,
		l.Reason, l.Status, now,
	).Scan(&l.ID, &l.AppliedAt)
	if err != nil {
		return fmt.Errorf("failed to create leave: %w", err)
	}
	return nil
}

func (r *leaveRepository) GetByID(ctx context.Context, id int) (*models.Leave, error) {
	query := `
		SELECT 
			l.id, l.employee_id, (e.first_name || ' ' || e.last_name),
			l.leave_type_id, lt.name, l.start_date, l.end_date, l.total_days,
			l.reason, l.status, l.applied_at, l.reviewed_at,
			COALESCE(l.reviewed_by_id::text, ''), COALESCE(l.rejection_reason, '')
		FROM leaves l
		JOIN employees e ON l.employee_id = e.id
		JOIN leave_types lt ON l.leave_type_id = lt.id
		WHERE l.id = $1
	`
	var l models.Leave
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&l.ID, &l.EmployeeID, &l.EmployeeName, &l.LeaveTypeID, &l.LeaveTypeName,
		&l.StartDate, &l.EndDate, &l.TotalDays, &l.Reason, &l.Status,
		&l.AppliedAt, &l.ReviewedAt, &l.ReviewedByID, &l.RejectionReason,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("leave not found")
		}
		return nil, fmt.Errorf("failed to get leave by id: %w", err)
	}
	return &l, nil
}

func (r *leaveRepository) ListByEmployeeID(ctx context.Context, employeeID int) ([]*models.Leave, error) {
	query := `
		SELECT 
			l.id, l.employee_id, (e.first_name || ' ' || e.last_name),
			l.leave_type_id, lt.name, l.start_date, l.end_date, l.total_days,
			l.reason, l.status, l.applied_at, l.reviewed_at,
			COALESCE(l.reviewed_by_id::text, ''), COALESCE(l.rejection_reason, '')
		FROM leaves l
		JOIN employees e ON l.employee_id = e.id
		JOIN leave_types lt ON l.leave_type_id = lt.id
		WHERE l.employee_id = $1
		ORDER BY l.applied_at DESC
	`
	rows, err := r.pool.Query(ctx, query, employeeID)
	if err != nil {
		return nil, fmt.Errorf("failed to list employee leaves: %w", err)
	}
	defer rows.Close()

	var leaves []*models.Leave
	for rows.Next() {
		var l models.Leave
		if err := rows.Scan(
			&l.ID, &l.EmployeeID, &l.EmployeeName, &l.LeaveTypeID, &l.LeaveTypeName,
			&l.StartDate, &l.EndDate, &l.TotalDays, &l.Reason, &l.Status,
			&l.AppliedAt, &l.ReviewedAt, &l.ReviewedByID, &l.RejectionReason,
		); err != nil {
			return nil, err
		}
		leaves = append(leaves, &l)
	}
	return leaves, nil
}

func (r *leaveRepository) ListPending(ctx context.Context) ([]*models.Leave, error) {
	query := `
		SELECT 
			l.id, l.employee_id, (e.first_name || ' ' || e.last_name),
			l.leave_type_id, lt.name, l.start_date, l.end_date, l.total_days,
			l.reason, l.status, l.applied_at, l.reviewed_at,
			COALESCE(l.reviewed_by_id::text, ''), COALESCE(l.rejection_reason, '')
		FROM leaves l
		JOIN employees e ON l.employee_id = e.id
		JOIN leave_types lt ON l.leave_type_id = lt.id
		WHERE l.status = 'Pending'
		ORDER BY l.applied_at ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list pending leaves: %w", err)
	}
	defer rows.Close()

	var leaves []*models.Leave
	for rows.Next() {
		var l models.Leave
		if err := rows.Scan(
			&l.ID, &l.EmployeeID, &l.EmployeeName, &l.LeaveTypeID, &l.LeaveTypeName,
			&l.StartDate, &l.EndDate, &l.TotalDays, &l.Reason, &l.Status,
			&l.AppliedAt, &l.ReviewedAt, &l.ReviewedByID, &l.RejectionReason,
		); err != nil {
			return nil, err
		}
		leaves = append(leaves, &l)
	}
	return leaves, nil
}

func (r *leaveRepository) UpdateStatus(ctx context.Context, id int, status models.LeaveStatus, reviewerID string, rejectionReason string) error {
	query := `
		UPDATE leaves
		SET status = $1, reviewed_at = $2, reviewed_by_id = $3::uuid, rejection_reason = $4
		WHERE id = $5
	`
	now := time.Now().UTC()
	var rID *string
	if reviewerID != "" {
		rID = &reviewerID
	}
	_, err := r.pool.Exec(ctx, query, status, now, rID, rejectionReason, id)
	if err != nil {
		return fmt.Errorf("failed to update leave status: %w", err)
	}
	return nil
}

func (r *leaveRepository) ListLeaveTypes(ctx context.Context) ([]*models.LeaveType, error) {
	query := `SELECT id, name, default_days, COALESCE(description, '') FROM leave_types ORDER BY id ASC`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list leave types: %w", err)
	}
	defer rows.Close()

	var types []*models.LeaveType
	for rows.Next() {
		var lt models.LeaveType
		if err := rows.Scan(&lt.ID, &lt.Name, &lt.DefaultDays, &lt.Description); err != nil {
			return nil, err
		}
		types = append(types, &lt)
	}
	return types, nil
}

func (r *leaveRepository) GetBalances(ctx context.Context, employeeID int) ([]*models.LeaveBalance, error) {
	query := `
		SELECT 
			lt.id, lt.name, lt.default_days,
			COALESCE(SUM(l.total_days), 0) AS used_days,
			(lt.default_days - COALESCE(SUM(l.total_days), 0)) AS balance_days
		FROM leave_types lt
		LEFT JOIN leaves l ON lt.id = l.leave_type_id 
			AND l.employee_id = $1 
			AND l.status = 'Approved'
			AND EXTRACT(YEAR FROM l.start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
		GROUP BY lt.id, lt.name, lt.default_days
		ORDER BY lt.id ASC
	`
	rows, err := r.pool.Query(ctx, query, employeeID)
	if err != nil {
		return nil, fmt.Errorf("failed to get leave balances: %w", err)
	}
	defer rows.Close()

	var balances []*models.LeaveBalance
	for rows.Next() {
		var b models.LeaveBalance
		if err := rows.Scan(&b.LeaveTypeID, &b.TypeName, &b.TotalDays, &b.UsedDays, &b.BalanceDays); err != nil {
			return nil, err
		}
		balances = append(balances, &b)
	}
	return balances, nil
}

func (r *leaveRepository) CountActive(ctx context.Context) (int, error) {
	var count int
	query := `
		SELECT COUNT(*)
		FROM leaves
		WHERE status = 'Approved' 
		  AND CURRENT_DATE BETWEEN start_date AND end_date
	`
	err := r.pool.QueryRow(ctx, query).Scan(&count)
	return count, err
}
