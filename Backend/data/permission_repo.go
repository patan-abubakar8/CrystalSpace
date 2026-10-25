package data

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type permissionRepository struct {
	pool  *pgxpool.Pool
	mu    sync.RWMutex
	cache map[string]map[string]*models.PagePermission // role -> page -> permission
}

func NewPermissionRepository(pool *pgxpool.Pool) interfaces.PermissionRepository {
	return &permissionRepository{
		pool:  pool,
		cache: make(map[string]map[string]*models.PagePermission),
	}
}

func (r *permissionRepository) InvalidateCache() {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.cache = make(map[string]map[string]*models.PagePermission)
}

func (r *permissionRepository) ListRoles(ctx context.Context) ([]*models.Role, error) {
	query := `
		SELECT id, name, description, is_system, created_at, updated_at
		FROM roles
		ORDER BY id ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query roles: %w", err)
	}
	defer rows.Close()

	var roles []*models.Role
	for rows.Next() {
		role := &models.Role{}
		if err := rows.Scan(
			&role.ID,
			&role.Name,
			&role.Description,
			&role.IsSystem,
			&role.CreatedAt,
			&role.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan role: %w", err)
		}
		roles = append(roles, role)
	}

	return roles, nil
}

func (r *permissionRepository) CreateRole(ctx context.Context, role *models.Role) error {
	now := time.Now().UTC()
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	insertRoleQuery := `
		INSERT INTO roles (name, description, is_system, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	err = tx.QueryRow(ctx, insertRoleQuery, role.Name, role.Description, false, now, now).
		Scan(&role.ID, &role.CreatedAt, &role.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert role: %w", err)
	}

	// Seed all default pages with false for this custom role
	defaultPages := []string{"dashboard", "employees", "departments", "leaves", "salaries", "projects", "roles"}
	insertPermQuery := `
		INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete, created_at, updated_at)
		VALUES ($1, $2, FALSE, FALSE, FALSE, FALSE, $3, $4)
		ON CONFLICT (role, page) DO NOTHING
	`
	for _, page := range defaultPages {
		if _, err := tx.Exec(ctx, insertPermQuery, role.Name, page, now, now); err != nil {
			return fmt.Errorf("failed to seed permission for page %s: %w", page, err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	r.InvalidateCache()
	return nil
}

func (r *permissionRepository) DeleteRole(ctx context.Context, roleName string) error {
	// Verify role is not a system role
	var isSystem bool
	err := r.pool.QueryRow(ctx, "SELECT is_system FROM roles WHERE name = $1", roleName).Scan(&isSystem)
	if err != nil {
		return fmt.Errorf("role not found: %w", err)
	}
	if isSystem {
		return errors.New("cannot delete protected system role")
	}

	// Verify no users are assigned to this role
	var userCount int
	err = r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM users WHERE role = $1", roleName).Scan(&userCount)
	if err != nil {
		return fmt.Errorf("failed to check role assignments: %w", err)
	}
	if userCount > 0 {
		return fmt.Errorf("cannot delete role '%s': %d users are currently assigned to it", roleName, userCount)
	}

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, "DELETE FROM role_permissions WHERE role = $1", roleName); err != nil {
		return fmt.Errorf("failed to delete role permissions: %w", err)
	}

	if _, err := tx.Exec(ctx, "DELETE FROM roles WHERE name = $1", roleName); err != nil {
		return fmt.Errorf("failed to delete role: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	r.InvalidateCache()
	return nil
}

func (r *permissionRepository) GetRolePermissions(ctx context.Context, role string) ([]*models.PagePermission, error) {
	query := `
		SELECT id, role, page, can_view, can_create, can_update, can_delete, created_at, updated_at
		FROM role_permissions
		WHERE role = $1
		ORDER BY page ASC
	`
	rows, err := r.pool.Query(ctx, query, role)
	if err != nil {
		return nil, fmt.Errorf("failed to query role permissions: %w", err)
	}
	defer rows.Close()

	var perms []*models.PagePermission
	for rows.Next() {
		p := &models.PagePermission{}
		if err := rows.Scan(
			&p.ID,
			&p.Role,
			&p.Page,
			&p.CanView,
			&p.CanCreate,
			&p.CanUpdate,
			&p.CanDelete,
			&p.CreatedAt,
			&p.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan permission: %w", err)
		}
		perms = append(perms, p)
	}

	return perms, nil
}

func (r *permissionRepository) GetAllPermissions(ctx context.Context) ([]*models.PagePermission, error) {
	query := `
		SELECT id, role, page, can_view, can_create, can_update, can_delete, created_at, updated_at
		FROM role_permissions
		ORDER BY role, page ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query permissions: %w", err)
	}
	defer rows.Close()

	var perms []*models.PagePermission
	for rows.Next() {
		p := &models.PagePermission{}
		if err := rows.Scan(
			&p.ID,
			&p.Role,
			&p.Page,
			&p.CanView,
			&p.CanCreate,
			&p.CanUpdate,
			&p.CanDelete,
			&p.CreatedAt,
			&p.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan permission: %w", err)
		}
		perms = append(perms, p)
	}

	return perms, nil
}

func (r *permissionRepository) UpdateRolePermissions(ctx context.Context, role string, perms []models.PagePermission) error {
	now := time.Now().UTC()
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	upsertQuery := `
		INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
		ON CONFLICT (role, page) DO UPDATE SET
			can_view = EXCLUDED.can_view,
			can_create = EXCLUDED.can_create,
			can_update = EXCLUDED.can_update,
			can_delete = EXCLUDED.can_delete,
			updated_at = EXCLUDED.updated_at
	`

	for _, p := range perms {
		_, err := tx.Exec(ctx, upsertQuery, role, p.Page, p.CanView, p.CanCreate, p.CanUpdate, p.CanDelete, now)
		if err != nil {
			return fmt.Errorf("failed to upsert permission for page %s: %w", p.Page, err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	r.InvalidateCache()
	return nil
}

func (r *permissionRepository) HasPermission(ctx context.Context, role string, page string, action string) (bool, error) {
	// SuperAdmin always has master bypass access
	if role == "SuperAdmin" {
		return true, nil
	}

	// 1. Try reading from thread-safe cache
	r.mu.RLock()
	if roleMap, ok := r.cache[role]; ok {
		if perm, ok := roleMap[page]; ok {
			r.mu.RUnlock()
			return evaluateAction(perm, action), nil
		}
	}
	r.mu.RUnlock()

	// 2. Fetch all permissions for this role and populate cache
	perms, err := r.GetRolePermissions(ctx, role)
	if err != nil {
		return false, err
	}

	r.mu.Lock()
	if _, ok := r.cache[role]; !ok {
		r.cache[role] = make(map[string]*models.PagePermission)
	}
	for _, p := range perms {
		r.cache[role][p.Page] = p
	}
	targetPerm, found := r.cache[role][page]
	r.mu.Unlock()

	if !found || targetPerm == nil {
		return false, nil
	}

	return evaluateAction(targetPerm, action), nil
}

func evaluateAction(perm *models.PagePermission, action string) bool {
	switch action {
	case "view":
		return perm.CanView
	case "create":
		return perm.CanCreate
	case "update":
		return perm.CanUpdate
	case "delete":
		return perm.CanDelete
	default:
		return false
	}
}
