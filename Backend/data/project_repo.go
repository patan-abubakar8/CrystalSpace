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

type projectRepository struct {
	pool *pgxpool.Pool
}

func NewProjectRepository(pool *pgxpool.Pool) interfaces.ProjectRepository {
	return &projectRepository{pool: pool}
}

func (r *projectRepository) CreateProject(ctx context.Context, p *models.Project) error {
	query := `
		INSERT INTO projects (name, description, start_date, end_date, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`
	now := time.Now().UTC()
	err := r.pool.QueryRow(ctx, query, p.Name, p.Description, p.StartDate, p.EndDate, p.Status, now, now).
		Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create project: %w", err)
	}
	return nil
}

func (r *projectRepository) GetProjectByID(ctx context.Context, id int) (*models.Project, error) {
	query := `
		SELECT id, name, description, start_date, end_date, status, created_at, updated_at
		FROM projects
		WHERE id = $1
	`
	var p models.Project
	err := r.pool.QueryRow(ctx, query, id).
		Scan(&p.ID, &p.Name, &p.Description, &p.StartDate, &p.EndDate, &p.Status, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("project not found")
		}
		return nil, fmt.Errorf("failed to get project: %w", err)
	}
	return &p, nil
}

func (r *projectRepository) ListProjects(ctx context.Context) ([]*models.Project, error) {
	query := `
		SELECT id, name, description, start_date, end_date, status, created_at, updated_at
		FROM projects
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list projects: %w", err)
	}
	defer rows.Close()

	var projects []*models.Project
	for rows.Next() {
		var p models.Project
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.StartDate, &p.EndDate, &p.Status, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		projects = append(projects, &p)
	}
	return projects, nil
}

func (r *projectRepository) CreateTask(ctx context.Context, t *models.TaskItem) error {
	query := `
		INSERT INTO task_items (
			project_id, title, description, status, priority,
			assigned_to_employee_id, due_date, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`
	now := time.Now().UTC()
	err := r.pool.QueryRow(ctx, query,
		t.ProjectID, t.Title, t.Description, t.Status, t.Priority,
		t.AssignedToEmployeeID, t.DueDate, now, now,
	).Scan(&t.ID, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create task: %w", err)
	}
	return nil
}

func (r *projectRepository) ListTasksByProject(ctx context.Context, projectID int) ([]*models.TaskItem, error) {
	query := `
		SELECT 
			t.id, t.project_id, p.name, t.title, COALESCE(t.description, ''),
			t.status, t.priority, t.assigned_to_employee_id,
			COALESCE(e.first_name || ' ' || e.last_name, ''),
			t.due_date, t.created_at, t.updated_at
		FROM task_items t
		JOIN projects p ON t.project_id = p.id
		LEFT JOIN employees e ON t.assigned_to_employee_id = e.id
		WHERE t.project_id = $1
		ORDER BY t.created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to list tasks: %w", err)
	}
	defer rows.Close()

	var tasks []*models.TaskItem
	for rows.Next() {
		var t models.TaskItem
		if err := rows.Scan(
			&t.ID, &t.ProjectID, &t.ProjectName, &t.Title, &t.Description,
			&t.Status, &t.Priority, &t.AssignedToEmployeeID, &t.AssigneeName,
			&t.DueDate, &t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, err
		}
		tasks = append(tasks, &t)
	}
	return tasks, nil
}

func (r *projectRepository) UpdateTaskStatus(ctx context.Context, taskID int, status models.TaskStatus) error {
	query := `UPDATE task_items SET status = $1, updated_at = $2 WHERE id = $3`
	_, err := r.pool.Exec(ctx, query, status, time.Now().UTC(), taskID)
	if err != nil {
		return fmt.Errorf("failed to update task status: %w", err)
	}
	return nil
}
