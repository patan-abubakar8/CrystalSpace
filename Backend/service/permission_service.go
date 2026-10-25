package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
)

type permissionService struct {
	repo interfaces.PermissionRepository
}

func NewPermissionService(repo interfaces.PermissionRepository) interfaces.PermissionService {
	return &permissionService{
		repo: repo,
	}
}

func (s *permissionService) GetMyPermissions(ctx context.Context, role string) (map[string]*models.PagePermission, error) {
	defaultPages := []string{"dashboard", "employees", "departments", "leaves", "salaries", "projects", "roles"}
	result := make(map[string]*models.PagePermission)

	// SuperAdmin always has master bypass privileges on every page
	if role == "SuperAdmin" {
		for _, page := range defaultPages {
			result[page] = &models.PagePermission{
				Role:      role,
				Page:      page,
				CanView:   true,
				CanCreate: true,
				CanUpdate: true,
				CanDelete: true,
			}
		}
		return result, nil
	}

	perms, err := s.repo.GetRolePermissions(ctx, role)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch role permissions: %w", err)
	}

	for _, p := range perms {
		result[p.Page] = p
	}

	// Guarantee every standard page has an entry (defaulting to false if not configured)
	for _, page := range defaultPages {
		if _, exists := result[page]; !exists {
			result[page] = &models.PagePermission{
				Role:      role,
				Page:      page,
				CanView:   false,
				CanCreate: false,
				CanUpdate: false,
				CanDelete: false,
			}
		}
	}

	return result, nil
}

func (s *permissionService) ListRolesWithPermissions(ctx context.Context) ([]*models.RolePermissionsMatrix, error) {
	roles, err := s.repo.ListRoles(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list roles: %w", err)
	}

	allPerms, err := s.repo.GetAllPermissions(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list permissions: %w", err)
	}

	// Group permissions by role
	permMap := make(map[string]map[string]models.PagePermission)
	for _, p := range allPerms {
		if _, ok := permMap[p.Role]; !ok {
			permMap[p.Role] = make(map[string]models.PagePermission)
		}
		permMap[p.Role][p.Page] = *p
	}

	defaultPages := []string{"dashboard", "employees", "departments", "leaves", "salaries", "projects", "roles"}
	var matrix []*models.RolePermissionsMatrix

	for _, r := range roles {
		rolePerms, ok := permMap[r.Name]
		if !ok {
			rolePerms = make(map[string]models.PagePermission)
		}

		// Ensure all default pages exist in the matrix representation
		for _, page := range defaultPages {
			if _, exists := rolePerms[page]; !exists {
				isSuper := r.Name == "SuperAdmin"
				rolePerms[page] = models.PagePermission{
					Role:      r.Name,
					Page:      page,
					CanView:   isSuper,
					CanCreate: isSuper,
					CanUpdate: isSuper,
					CanDelete: isSuper,
				}
			}
		}

		matrix = append(matrix, &models.RolePermissionsMatrix{
			Role:        *r,
			Permissions: rolePerms,
		})
	}

	return matrix, nil
}

func (s *permissionService) UpdateRolePermissions(ctx context.Context, req dto.UpdateRolePermissionsRequest) error {
	roleName := strings.TrimSpace(req.Role)
	if roleName == "" {
		return errors.New("role name cannot be empty")
	}

	// SuperAdmin lockout protection: Cannot strip SuperAdmin master privileges
	if roleName == "SuperAdmin" {
		return errors.New("cannot modify SuperAdmin system permissions: master privileges are protected")
	}

	var perms []models.PagePermission
	for _, p := range req.Permissions {
		perms = append(perms, models.PagePermission{
			Role:      roleName,
			Page:      p.Page,
			CanView:   p.CanView,
			CanCreate: p.CanCreate,
			CanUpdate: p.CanUpdate,
			CanDelete: p.CanDelete,
		})
	}

	return s.repo.UpdateRolePermissions(ctx, roleName, perms)
}

func (s *permissionService) CreateRole(ctx context.Context, req dto.CreateRoleRequest) (*models.Role, error) {
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return nil, errors.New("role name cannot be empty")
	}

	role := &models.Role{
		Name:        name,
		Description: strings.TrimSpace(req.Description),
	}

	if err := s.repo.CreateRole(ctx, role); err != nil {
		return nil, err
	}

	return role, nil
}

func (s *permissionService) DeleteRole(ctx context.Context, roleName string) error {
	name := strings.TrimSpace(roleName)
	if name == "" {
		return errors.New("role name cannot be empty")
	}
	return s.repo.DeleteRole(ctx, name)
}
