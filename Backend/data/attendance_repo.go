package data

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type attendanceRepository struct {
	pool *pgxpool.Pool
}

func NewAttendanceRepository(pool *pgxpool.Pool) interfaces.AttendanceRepository {
	return &attendanceRepository{pool: pool}
}

func (r *attendanceRepository) PunchIn(ctx context.Context, att *models.Attendance) error {
	query := `
		INSERT INTO attendances (
			employee_id, date, clock_in, status, work_mode, notes, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (employee_id, date) DO UPDATE 
		SET work_mode = EXCLUDED.work_mode,
		    notes = EXCLUDED.notes,
		    updated_at = EXCLUDED.updated_at
		RETURNING id, created_at, updated_at
	`
	now := time.Now().UTC()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)

	err := r.pool.QueryRow(ctx, query,
		att.EmployeeID, today, now, att.Status, att.WorkMode, att.Notes, now, now,
	).Scan(&att.ID, &att.CreatedAt, &att.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to punch in: %w", err)
	}
	att.Date = today
	att.ClockIn = now
	return nil
}

func (r *attendanceRepository) PunchOut(ctx context.Context, id int, clockOut time.Time, totalMinutes int, status models.AttendanceStatus, notes string) error {
	query := `
		UPDATE attendances
		SET clock_out = $1,
		    total_minutes = $2,
		    status = $3,
		    notes = CASE WHEN $4 != '' THEN $4 ELSE notes END,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $5
	`
	_, err := r.pool.Exec(ctx, query, clockOut, totalMinutes, status, notes, id)
	if err != nil {
		return fmt.Errorf("failed to punch out: %w", err)
	}
	return nil
}

func (r *attendanceRepository) GetTodayByEmployeeID(ctx context.Context, employeeID int, date time.Time) (*models.Attendance, error) {
	query := `
		SELECT 
			a.id, a.employee_id, (e.first_name || ' ' || e.last_name),
			COALESCE(e.employee_code, ''), COALESCE(d.name, ''),
			a.date, a.clock_in, a.clock_out, a.total_minutes,
			a.status, a.work_mode, COALESCE(a.notes, ''),
			a.created_at, a.updated_at
		FROM attendances a
		JOIN employees e ON a.employee_id = e.id
		LEFT JOIN departments d ON e.department_id = d.id
		WHERE a.employee_id = $1 AND a.date = $2
	`
	dayOnly := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)
	var a models.Attendance
	err := r.pool.QueryRow(ctx, query, employeeID, dayOnly).Scan(
		&a.ID, &a.EmployeeID, &a.EmployeeName,
		&a.EmployeeCode, &a.DepartmentName,
		&a.Date, &a.ClockIn, &a.ClockOut, &a.TotalMinutes,
		&a.Status, &a.WorkMode, &a.Notes,
		&a.CreatedAt, &a.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get today's attendance: %w", err)
	}
	return &a, nil
}

func (r *attendanceRepository) GetByID(ctx context.Context, id int) (*models.Attendance, error) {
	query := `
		SELECT 
			a.id, a.employee_id, (e.first_name || ' ' || e.last_name),
			COALESCE(e.employee_code, ''), COALESCE(d.name, ''),
			a.date, a.clock_in, a.clock_out, a.total_minutes,
			a.status, a.work_mode, COALESCE(a.notes, ''),
			a.created_at, a.updated_at
		FROM attendances a
		JOIN employees e ON a.employee_id = e.id
		LEFT JOIN departments d ON e.department_id = d.id
		WHERE a.id = $1
	`
	var a models.Attendance
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&a.ID, &a.EmployeeID, &a.EmployeeName,
		&a.EmployeeCode, &a.DepartmentName,
		&a.Date, &a.ClockIn, &a.ClockOut, &a.TotalMinutes,
		&a.Status, &a.WorkMode, &a.Notes,
		&a.CreatedAt, &a.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get attendance by id: %w", err)
	}
	return &a, nil
}

func (r *attendanceRepository) List(ctx context.Context, filter models.AttendanceFilter) ([]*models.Attendance, int, error) {
	var conditions []string
	var args []interface{}
	idx := 1

	if filter.EmployeeID > 0 {
		conditions = append(conditions, fmt.Sprintf("a.employee_id = $%d", idx))
		args = append(args, filter.EmployeeID)
		idx++
	}

	if filter.DepartmentID > 0 {
		conditions = append(conditions, fmt.Sprintf("e.department_id = $%d", idx))
		args = append(args, filter.DepartmentID)
		idx++
	}

	if filter.Status != "" && filter.Status != "All" {
		conditions = append(conditions, fmt.Sprintf("a.status = $%d", idx))
		args = append(args, filter.Status)
		idx++
	}

	if filter.FromDate != "" {
		conditions = append(conditions, fmt.Sprintf("a.date >= $%d", idx))
		args = append(args, filter.FromDate)
		idx++
	}

	if filter.ToDate != "" {
		conditions = append(conditions, fmt.Sprintf("a.date <= $%d", idx))
		args = append(args, filter.ToDate)
		idx++
	}

	if filter.SearchQuery != "" {
		conditions = append(conditions, fmt.Sprintf("(e.first_name ILIKE $%d OR e.last_name ILIKE $%d OR e.employee_code ILIKE $%d)", idx, idx, idx))
		args = append(args, "%"+filter.SearchQuery+"%")
		idx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM attendances a
		JOIN employees e ON a.employee_id = e.id
		%s
	`, whereClause)

	var total int
	if err := r.pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("failed to count attendances: %w", err)
	}

	if filter.PageSize <= 0 {
		filter.PageSize = 50
	}
	if filter.Page <= 0 {
		filter.Page = 1
	}
	offset := (filter.Page - 1) * filter.PageSize

	query := fmt.Sprintf(`
		SELECT 
			a.id, a.employee_id, (e.first_name || ' ' || e.last_name),
			COALESCE(e.employee_code, ''), COALESCE(d.name, ''),
			a.date, a.clock_in, a.clock_out, a.total_minutes,
			a.status, a.work_mode, COALESCE(a.notes, ''),
			a.created_at, a.updated_at
		FROM attendances a
		JOIN employees e ON a.employee_id = e.id
		LEFT JOIN departments d ON e.department_id = d.id
		%s
		ORDER BY a.date DESC, a.clock_in DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, idx, idx+1)

	args = append(args, filter.PageSize, offset)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list attendances: %w", err)
	}
	defer rows.Close()

	var results []*models.Attendance
	for rows.Next() {
		var a models.Attendance
		if err := rows.Scan(
			&a.ID, &a.EmployeeID, &a.EmployeeName,
			&a.EmployeeCode, &a.DepartmentName,
			&a.Date, &a.ClockIn, &a.ClockOut, &a.TotalMinutes,
			&a.Status, &a.WorkMode, &a.Notes,
			&a.CreatedAt, &a.UpdatedAt,
		); err != nil {
			return nil, 0, fmt.Errorf("failed to scan attendance row: %w", err)
		}
		results = append(results, &a)
	}

	return results, total, nil
}

func (r *attendanceRepository) GetRangeByEmployee(ctx context.Context, employeeID int, startDate, endDate time.Time) ([]*models.Attendance, error) {
	query := `
		SELECT 
			a.id, a.employee_id, (e.first_name || ' ' || e.last_name),
			COALESCE(e.employee_code, ''), COALESCE(d.name, ''),
			a.date, a.clock_in, a.clock_out, a.total_minutes,
			a.status, a.work_mode, COALESCE(a.notes, ''),
			a.created_at, a.updated_at
		FROM attendances a
		JOIN employees e ON a.employee_id = e.id
		LEFT JOIN departments d ON e.department_id = d.id
		WHERE a.employee_id = $1 AND a.date >= $2 AND a.date <= $3
		ORDER BY a.date ASC
	`
	rows, err := r.pool.Query(ctx, query, employeeID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to query attendance range: %w", err)
	}
	defer rows.Close()

	var records []*models.Attendance
	for rows.Next() {
		var a models.Attendance
		if err := rows.Scan(
			&a.ID, &a.EmployeeID, &a.EmployeeName,
			&a.EmployeeCode, &a.DepartmentName,
			&a.Date, &a.ClockIn, &a.ClockOut, &a.TotalMinutes,
			&a.Status, &a.WorkMode, &a.Notes,
			&a.CreatedAt, &a.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan range attendance: %w", err)
		}
		records = append(records, &a)
	}
	return records, nil
}

func (r *attendanceRepository) GetTodayOverview(ctx context.Context, date time.Time) (*dto.OrgAttendanceTodayOverview, error) {
	dayOnly := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)

	// Total employees
	var totalEmp int
	_ = r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM employees WHERE status = 'Active'").Scan(&totalEmp)

	// Attendance counts for today
	query := `
		SELECT 
			COUNT(DISTINCT employee_id) AS present_count,
			COUNT(DISTINCT CASE WHEN status = 'Late' THEN employee_id END) AS late_count
		FROM attendances
		WHERE date = $1
	`
	var presentCount, lateCount int
	_ = r.pool.QueryRow(ctx, query, dayOnly).Scan(&presentCount, &lateCount)

	// Leaves for today
	leaveQuery := `
		SELECT COUNT(DISTINCT employee_id)
		FROM leaves
		WHERE status = 'Approved' AND start_date <= $1 AND end_date >= $1
	`
	var leaveCount int
	_ = r.pool.QueryRow(ctx, leaveQuery, dayOnly).Scan(&leaveCount)

	absentCount := totalEmp - presentCount - leaveCount
	if absentCount < 0 {
		absentCount = 0
	}

	return &dto.OrgAttendanceTodayOverview{
		TotalEmployees: totalEmp,
		PresentCount:   presentCount,
		LateCount:      lateCount,
		OnLeaveCount:   leaveCount,
		AbsentCount:    absentCount,
	}, nil
}
