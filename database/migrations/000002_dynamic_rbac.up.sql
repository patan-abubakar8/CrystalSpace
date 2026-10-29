-- Migration 000002: Dynamic Roles and Page Permissions
-- Enables System Admin to grant/revoke can_view, can_create, can_update, can_delete across all pages

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    page VARCHAR(50) NOT NULL,
    can_view BOOLEAN NOT NULL DEFAULT FALSE,
    can_create BOOLEAN NOT NULL DEFAULT FALSE,
    can_update BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, page)
);

-- Seed System Roles
INSERT INTO roles (name, description, is_system) VALUES
    ('SuperAdmin', 'System Administrator with full master bypass privileges', TRUE),
    ('Admin', 'Executive Administrator with full workforce management privileges', FALSE),
    ('HR', 'Human Resources management and employee lifecycle', FALSE),
    ('Manager', 'Department & Team Operations and approvals', FALSE),
    ('Employee', 'Standard workforce personnel self-service', FALSE)
ON CONFLICT (name) DO NOTHING;

-- Seed Default Page Permissions for All Roles
-- Pages: dashboard, employees, departments, leaves, salaries, projects, roles

INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('SuperAdmin', 'dashboard', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'employees', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'departments', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'leaves', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'salaries', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'projects', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'roles', TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (role, page) DO NOTHING;

INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('Admin', 'dashboard', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'employees', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'departments', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'leaves', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'salaries', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'projects', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'roles', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role, page) DO NOTHING;

INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('HR', 'dashboard', TRUE, FALSE, FALSE, FALSE),
    ('HR', 'employees', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'departments', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'leaves', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'salaries', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'projects', TRUE, FALSE, FALSE, FALSE),
    ('HR', 'roles', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role, page) DO NOTHING;

INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('Manager', 'dashboard', TRUE, FALSE, FALSE, FALSE),
    ('Manager', 'employees', TRUE, FALSE, FALSE, FALSE),
    ('Manager', 'departments', TRUE, FALSE, FALSE, FALSE),
    ('Manager', 'leaves', TRUE, TRUE, TRUE, FALSE),
    ('Manager', 'salaries', FALSE, FALSE, FALSE, FALSE),
    ('Manager', 'projects', TRUE, TRUE, TRUE, FALSE),
    ('Manager', 'roles', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role, page) DO NOTHING;

INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('Employee', 'dashboard', TRUE, FALSE, FALSE, FALSE),
    ('Employee', 'employees', TRUE, FALSE, FALSE, FALSE),
    ('Employee', 'departments', TRUE, FALSE, FALSE, FALSE),
    ('Employee', 'leaves', TRUE, TRUE, FALSE, FALSE),
    ('Employee', 'salaries', FALSE, FALSE, FALSE, FALSE),
    ('Employee', 'projects', TRUE, FALSE, TRUE, FALSE),
    ('Employee', 'roles', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role, page) DO NOTHING;
