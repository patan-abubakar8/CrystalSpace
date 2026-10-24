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

type departmentRepository struct {
	pool *pgxpool.Pool
}

func NewDepartmentRepository(pool *pgxpool.Pool) interfaces.DepartmentRepository {
	return &departmentRepository{pool: pool}
}

func (r *departmentRepository) Create(ctx context.Context, d *models.Department) error {
	query := `
		INSERT INTO departments (name, description, code, manager_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`
	now := time.Now().UTC()
	err := r.pool.QueryRow(ctx, query, d.Name, d.Description, d.Code, d.ManagerID, now, now).
		Scan(&d.ID, &d.CreatedAt, &d.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create department: %w", err)
	}
	return nil
}

func (r *departmentRepository) GetByID(ctx context.Context, id int) (*models.Department, error) {
	query := `
		SELECT id, name, description, code, manager_id, created_at, updated_at
		FROM departments
		WHERE id = $1
	`
	var d models.Department
	err := r.pool.QueryRow(ctx, query, id).
		Scan(&d.ID, &d.Name, &d.Description, &d.Code, &d.ManagerID, &d.CreatedAt, &d.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("department not found")
		}
		return nil, fmt.Errorf("failed to get department by id: %w", err)
	}
	return &d, nil
}

func (r *departmentRepository) List(ctx context.Context) ([]*models.Department, error) {
	query := `
		SELECT id, name, description, code, manager_id, created_at, updated_at
		FROM departments
		ORDER BY name ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list departments: %w", err)
	}
	defer rows.Close()

	var depts []*models.Department
	for rows.Next() {
		var d models.Department
		if err := rows.Scan(&d.ID, &d.Name, &d.Description, &d.Code, &d.ManagerID, &d.CreatedAt, &d.UpdatedAt); err != nil {
			return nil, err
		}
		depts = append(depts, &d)
	}
	return depts, nil
}

func (r *departmentRepository) Update(ctx context.Context, d *models.Department) error {
	query := `
		UPDATE departments
		SET name = $1, description = $2, code = $3, manager_id = $4, updated_at = $5
		WHERE id = $6
	`
	d.UpdatedAt = time.Now().UTC()
	_, err := r.pool.Exec(ctx, query, d.Name, d.Description, d.Code, d.ManagerID, d.UpdatedAt, d.ID)
	if err != nil {
		return fmt.Errorf("failed to update department: %w", err)
	}
	return nil
}

func (r *departmentRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM departments WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete department: %w", err)
	}
	return nil
}
