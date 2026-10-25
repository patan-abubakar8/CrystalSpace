package models

import "time"

// Role represents a defined user group with specific permissions.
type Role struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IsSystem    bool      `json:"is_system"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// PagePermission defines the 4 core actions for a given page and role.
type PagePermission struct {
	ID        int       `json:"id,omitempty"`
	Role      string    `json:"role"`
	Page      string    `json:"page"`
	CanView   bool      `json:"can_view"`
	CanCreate bool      `json:"can_create"`
	CanUpdate bool      `json:"can_update"`
	CanDelete bool      `json:"can_delete"`
	CreatedAt time.Time `json:"created_at,omitempty"`
	UpdatedAt time.Time `json:"updated_at,omitempty"`
}

// RolePermissionsMatrix aggregates a role and all its page-level permissions.
type RolePermissionsMatrix struct {
	Role        Role                        `json:"role"`
	Permissions map[string]PagePermission   `json:"permissions"`
}
