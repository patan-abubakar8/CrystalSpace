-- CrystalSpace Unified Master PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (Auth & Security)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Employee',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    code VARCHAR(20) UNIQUE NOT NULL,
    manager_id INT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    designation VARCHAR(100) NOT NULL,
    department_id INT REFERENCES departments(id) ON DELETE RESTRICT,
    manager_id INT REFERENCES employees(id) ON DELETE RESTRICT,
    employee_code VARCHAR(50) UNIQUE,
    office_location VARCHAR(100) NOT NULL DEFAULT 'Headquarters',
    date_of_joining DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Personal Details (1-to-1)
CREATE TABLE IF NOT EXISTS employee_personal_details (
    id SERIAL PRIMARY KEY,
    employee_id INT UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    marital_status VARCHAR(20),
    blood_group VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India'
);

-- Emergency Contacts (1-to-1)
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    employee_id INT UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    contact_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20)
);

-- Professional Details (1-to-1)
CREATE TABLE IF NOT EXISTS employee_professional_details (
    id SERIAL PRIMARY KEY,
    employee_id INT UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'FullTime',
    work_mode VARCHAR(50) NOT NULL DEFAULT 'Hybrid',
    total_experience_years NUMERIC(4, 1) DEFAULT 0,
    previous_employer VARCHAR(255),
    skills TEXT
);

-- Leave Types
CREATE TABLE IF NOT EXISTS leave_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    default_days NUMERIC(4, 1) NOT NULL,
    description TEXT
);

-- Leaves
CREATE TABLE IF NOT EXISTS leaves (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id INT NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(4, 1) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT
);

-- Salaries
CREATE TABLE IF NOT EXISTS salaries (
    id SERIAL PRIMARY KEY,
    employee_id INT UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    basic_salary NUMERIC(12, 2) NOT NULL DEFAULT 0,
    hra NUMERIC(12, 2) NOT NULL DEFAULT 0,
    conveyance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    medical_allowance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    special_allowance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    provident_fund NUMERIC(12, 2) NOT NULL DEFAULT 0,
    professional_tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tds NUMERIC(12, 2) NOT NULL DEFAULT 0,
    gross_salary NUMERIC(12, 2) NOT NULL DEFAULT 0,
    net_salary NUMERIC(12, 2) NOT NULL DEFAULT 0,
    effective_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Planning',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tasks
CREATE TABLE IF NOT EXISTS task_items (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Todo',
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    assigned_to_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Documents
CREATE TABLE IF NOT EXISTS employee_documents (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Attendances
CREATE TABLE IF NOT EXISTS attendances (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    total_minutes INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Present',
    work_mode VARCHAR(50) NOT NULL DEFAULT 'Office',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_employee_date UNIQUE (employee_id, date)
);

-- Indexes for high-concurrency performance
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);
CREATE INDEX IF NOT EXISTS idx_task_items_project_id ON task_items(project_id);
CREATE INDEX IF NOT EXISTS idx_task_items_assigned_to ON task_items(assigned_to_employee_id);
CREATE INDEX IF NOT EXISTS idx_attendances_emp_date ON attendances(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(date);

-- Dynamic Roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic Page Permissions (can_view, can_create, can_update, can_delete)
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
-- Pages: dashboard, employees, departments, leaves, salaries, projects, attendance, roles

-- SuperAdmin: full master access on all 4 actions across all pages
INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('SuperAdmin', 'dashboard', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'employees', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'departments', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'leaves', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'salaries', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'projects', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'attendance', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'roles', TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (role, page) DO NOTHING;

-- Admin: full access to organization pages; roles nav is FALSE by default unless SuperAdmin grants
INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('Admin', 'dashboard', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'employees', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'departments', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'leaves', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'salaries', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'projects', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'attendance', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'roles', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role, page) DO NOTHING;

-- HR: personnel, departments, leaves, salaries, attendance
INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('HR', 'dashboard', TRUE, FALSE, FALSE, FALSE),
    ('HR', 'employees', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'departments', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'leaves', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'salaries', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'projects', TRUE, FALSE, FALSE, FALSE),
    ('HR', 'attendance', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'roles', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role, page) DO NOTHING;

-- Manager: team leaves, projects, attendance
INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('Manager', 'dashboard', TRUE, FALSE, FALSE, FALSE),
    ('Manager', 'employees', TRUE, FALSE, FALSE, FALSE),
    ('Manager', 'departments', TRUE, FALSE, FALSE, FALSE),
    ('Manager', 'leaves', TRUE, TRUE, TRUE, FALSE),
    ('Manager', 'salaries', FALSE, FALSE, FALSE, FALSE),
    ('Manager', 'projects', TRUE, TRUE, TRUE, FALSE),
    ('Manager', 'attendance', TRUE, TRUE, FALSE, FALSE),
    ('Manager', 'roles', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role, page) DO NOTHING;

-- Employee: self service attendance, leaves, etc.
INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('Employee', 'dashboard', TRUE, FALSE, FALSE, FALSE),
    ('Employee', 'employees', TRUE, FALSE, FALSE, FALSE),
    ('Employee', 'departments', TRUE, FALSE, FALSE, FALSE),
    ('Employee', 'leaves', TRUE, TRUE, FALSE, FALSE),
    ('Employee', 'salaries', FALSE, FALSE, FALSE, FALSE),
    ('Employee', 'projects', TRUE, FALSE, TRUE, FALSE),
    ('Employee', 'attendance', TRUE, TRUE, FALSE, FALSE),
    ('Employee', 'roles', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role, page) DO NOTHING;
