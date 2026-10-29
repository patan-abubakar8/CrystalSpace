-- CrystalSpace PostgreSQL Initial Schema

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
-- Pages: dashboard, employees, departments, leaves, salaries, projects, roles

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

-- Extended sidebar menu pages: tasks, daily-logs, calendar, chats, meetings,
-- documents, support, announcements, workflows, audit-logs, org-settings

INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('SuperAdmin', 'tasks', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'daily-logs', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'calendar', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'chats', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'meetings', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'documents', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'support', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'announcements', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'workflows', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'audit-logs', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'org-settings', TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (role, page) DO NOTHING;

INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('Admin', 'tasks', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'daily-logs', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'calendar', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'chats', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'meetings', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'documents', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'support', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'announcements', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'workflows', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'audit-logs', TRUE, FALSE, FALSE, FALSE),
    ('Admin', 'org-settings', TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (role, page) DO NOTHING;

INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('HR', 'tasks', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'daily-logs', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'calendar', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'chats', TRUE, TRUE, FALSE, FALSE),
    ('HR', 'meetings', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'documents', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'support', TRUE, TRUE, FALSE, FALSE),
    ('HR', 'announcements', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'workflows', TRUE, FALSE, FALSE, FALSE),
    ('HR', 'audit-logs', FALSE, FALSE, FALSE, FALSE),
    ('HR', 'org-settings', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role, page) DO NOTHING;

INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('Manager', 'tasks', TRUE, TRUE, TRUE, FALSE),
    ('Manager', 'daily-logs', TRUE, TRUE, TRUE, FALSE),
    ('Manager', 'calendar', TRUE, FALSE, FALSE, FALSE),
    ('Manager', 'chats', TRUE, TRUE, FALSE, FALSE),
    ('Manager', 'meetings', TRUE, TRUE, TRUE, FALSE),
    ('Manager', 'documents', TRUE, TRUE, FALSE, FALSE),
    ('Manager', 'support', TRUE, TRUE, FALSE, FALSE),
    ('Manager', 'announcements', TRUE, FALSE, FALSE, FALSE),
    ('Manager', 'workflows', TRUE, TRUE, FALSE, FALSE),
    ('Manager', 'audit-logs', FALSE, FALSE, FALSE, FALSE),
    ('Manager', 'org-settings', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role, page) DO NOTHING;

INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('Employee', 'tasks', TRUE, FALSE, TRUE, FALSE),
    ('Employee', 'daily-logs', TRUE, TRUE, TRUE, FALSE),
    ('Employee', 'calendar', TRUE, FALSE, FALSE, FALSE),
    ('Employee', 'chats', TRUE, TRUE, FALSE, FALSE),
    ('Employee', 'meetings', TRUE, TRUE, FALSE, FALSE),
    ('Employee', 'documents', TRUE, TRUE, FALSE, FALSE),
    ('Employee', 'support', TRUE, TRUE, FALSE, FALSE),
    ('Employee', 'announcements', TRUE, FALSE, FALSE, FALSE),
    ('Employee', 'workflows', FALSE, FALSE, FALSE, FALSE),
    ('Employee', 'audit-logs', FALSE, FALSE, FALSE, FALSE),
    ('Employee', 'org-settings', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role, page) DO NOTHING;

-- ===========================================================================
-- Employee onboarding (mirrors migrations/000005_employee_onboarding.up.sql)
-- ===========================================================================

-- Employee Management & Multi-Step Onboarding
-- Adds draft persistence, extended employee profile data, document verification,
-- asset assignment, leave allocation, work schedules, granular permissions and audit history.

-- ---------------------------------------------------------------------------
-- 1. Extend the employee profile
-- ---------------------------------------------------------------------------
ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS personal_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS job_title VARCHAR(120),
    ADD COLUMN IF NOT EXISTS work_location VARCHAR(120),
    ADD COLUMN IF NOT EXISTS secondary_approver_id INT REFERENCES employees(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS probation_end_date DATE,
    ADD COLUMN IF NOT EXISTS contract_end_date DATE,
    ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(30) NOT NULL DEFAULT 'Completed',
    ADD COLUMN IF NOT EXISTS work_schedule_id INT,
    ADD COLUMN IF NOT EXISTS attendance_policy VARCHAR(120),
    ADD COLUMN IF NOT EXISTS holiday_calendar VARCHAR(120),
    ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS offboarding_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_onboarding_status ON employees(onboarding_status);

-- ---------------------------------------------------------------------------
-- 2. Configurable document categories (required flags live here, not per employee)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(60) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    allowed_extensions VARCHAR(200) NOT NULL DEFAULT 'pdf,jpg,jpeg,png',
    max_size_bytes BIGINT NOT NULL DEFAULT 10485760,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO document_types (code, name, description, is_required, sort_order) VALUES
    ('resume', 'Resume / CV', 'Latest curriculum vitae', TRUE, 10),
    ('graduation-certificate', 'Graduation Certificate', 'Degree or diploma certificate', FALSE, 20),
    ('experience-letter', 'Experience Letter', 'Letter from a previous employer', FALSE, 30),
    ('relieving-letter', 'Relieving Letter', 'Relieving letter from the previous employer', FALSE, 40),
    ('id-proof', 'Identity Proof', 'Government issued photo identity', TRUE, 50),
    ('address-proof', 'Address Proof', 'Utility bill, rental agreement or similar', FALSE, 60),
    ('offer-letter', 'Signed Offer Letter', 'Countersigned offer letter', TRUE, 70),
    ('employment-agreement', 'Employment Agreement', 'Signed employment contract', FALSE, 80),
    ('form-16', 'Form 16', 'Annual tax statement from a previous employer', FALSE, 90),
    ('other', 'Other Document', 'Any additional supporting document', FALSE, 100)
ON CONFLICT (code) DO NOTHING;

-- Verification metadata for employee documents
ALTER TABLE employee_documents
    ADD COLUMN IF NOT EXISTS document_type_code VARCHAR(60),
    ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS expiry_date DATE,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS storage_key TEXT,
    ADD COLUMN IF NOT EXISTS mime_type VARCHAR(120);

CREATE INDEX IF NOT EXISTS idx_employee_documents_employee ON employee_documents(employee_id);

-- ---------------------------------------------------------------------------
-- 3. Work schedules & leave policies (configurable reference data)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS work_schedules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) UNIQUE NOT NULL,
    work_days VARCHAR(120) NOT NULL DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    weekly_off_days VARCHAR(120) NOT NULL DEFAULT 'Sat,Sun',
    expected_hours NUMERIC(4, 1) NOT NULL DEFAULT 8,
    shift_start TIME,
    shift_end TIME,
    attendance_policy VARCHAR(120),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO work_schedules (name, work_days, weekly_off_days, expected_hours, shift_start, shift_end, attendance_policy) VALUES
    ('Standard 5-Day (General Shift)', 'Mon,Tue,Wed,Thu,Fri', 'Sat,Sun', 8, '09:30', '18:30', 'Standard'),
    ('Rotational 6-Day', 'Mon,Tue,Wed,Thu,Fri,Sat', 'Sun', 8, '09:00', '18:00', 'Rotational'),
    ('Flexible Hours', 'Mon,Tue,Wed,Thu,Fri', 'Sat,Sun', 8, NULL, NULL, 'Flexible')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE employees
    DROP CONSTRAINT IF EXISTS fk_employees_work_schedule;
ALTER TABLE employees
    ADD CONSTRAINT fk_employees_work_schedule FOREIGN KEY (work_schedule_id) REFERENCES work_schedules(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS leave_policies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO leave_policies (name, description) VALUES
    ('Standard Company Policy', 'Annual, sick and casual leave as per company handbook'),
    ('Contractor Policy', 'Statutory leave only, no paid annual leave'),
    ('Internship Policy', 'Limited unpaid leave during the internship term')
ON CONFLICT (name) DO NOTHING;

-- Individual allocations are stored separately from policy definitions.
CREATE TABLE IF NOT EXISTS employee_leave_allocations (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id INT NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    policy_name VARCHAR(120),
    allocated_days NUMERIC(4, 1) NOT NULL DEFAULT 0,
    used_days NUMERIC(4, 1) NOT NULL DEFAULT 0,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id, leave_type_id, effective_from)
);

-- ---------------------------------------------------------------------------
-- 4. Assets & assignment history
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_tag VARCHAR(60) UNIQUE NOT NULL,
    category VARCHAR(60) NOT NULL,
    manufacturer VARCHAR(120),
    model VARCHAR(120),
    serial_number VARCHAR(120) UNIQUE,
    condition VARCHAR(30) NOT NULL DEFAULT 'Good',
    accessories TEXT,
    software_licenses TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Available',
    purchased_at DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset_assignments (
    id SERIAL PRIMARY KEY,
    asset_id INT NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_return_date DATE,
    returned_at TIMESTAMP WITH TIME ZONE,
    return_condition VARCHAR(30),
    acknowledgement BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT
);

-- An asset can only be with one employee at a time.
CREATE UNIQUE INDEX IF NOT EXISTS uq_asset_active_assignment
    ON asset_assignments(asset_id)
    WHERE returned_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_asset_assignments_employee ON asset_assignments(employee_id);

-- ---------------------------------------------------------------------------
-- 5. Employee drafts (in-progress onboarding records)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_drafts (
    id SERIAL PRIMARY KEY,
    draft_ref VARCHAR(40) UNIQUE NOT NULL,
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_email VARCHAR(255) NOT NULL,
    owner_name VARCHAR(200) NOT NULL DEFAULT '',
    status VARCHAR(30) NOT NULL DEFAULT 'Draft',
    current_step INT NOT NULL DEFAULT 1,
    version INT NOT NULL DEFAULT 1,
    display_name VARCHAR(200) NOT NULL DEFAULT '',
    employee_code VARCHAR(60),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    completed_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    submitted_employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    last_saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employee_drafts_owner ON employee_drafts(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_employee_drafts_status ON employee_drafts(status);

-- ---------------------------------------------------------------------------
-- 6. Audit history for sensitive employee operations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_audit_logs (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    draft_id INT REFERENCES employee_drafts(id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_email VARCHAR(255) NOT NULL DEFAULT '',
    actor_role VARCHAR(50) NOT NULL DEFAULT '',
    action VARCHAR(80) NOT NULL,
    section VARCHAR(60),
    summary TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employee_audit_employee ON employee_audit_logs(employee_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 7. Granular employee permissions (page keys follow the existing RBAC model)
--    employees-drafts      -> create/update/resume/delete drafts
--    employees-compensation-> view/update salary information
--    employees-documents   -> view/upload/verify documents
--    employees-assets      -> view/assign/return devices
--    employees-access      -> view/provision application access
--    employees-history     -> view employment, lifecycle and audit history
-- ---------------------------------------------------------------------------
INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('SuperAdmin', 'employees-drafts', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'employees-compensation', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'employees-documents', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'employees-assets', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'employees-access', TRUE, TRUE, TRUE, TRUE),
    ('SuperAdmin', 'employees-history', TRUE, TRUE, TRUE, TRUE),

    ('Admin', 'employees-drafts', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'employees-compensation', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'employees-documents', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'employees-assets', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'employees-access', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'employees-history', TRUE, TRUE, TRUE, TRUE),

    ('HR', 'employees-drafts', TRUE, TRUE, TRUE, TRUE),
    ('HR', 'employees-compensation', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'employees-documents', TRUE, TRUE, TRUE, TRUE),
    ('HR', 'employees-assets', TRUE, TRUE, TRUE, FALSE),
    ('HR', 'employees-access', TRUE, FALSE, FALSE, FALSE),
    ('HR', 'employees-history', TRUE, FALSE, FALSE, FALSE),

    ('Manager', 'employees-drafts', FALSE, FALSE, FALSE, FALSE),
    ('Manager', 'employees-compensation', FALSE, FALSE, FALSE, FALSE),
    ('Manager', 'employees-documents', FALSE, FALSE, FALSE, FALSE),
    ('Manager', 'employees-assets', FALSE, FALSE, FALSE, FALSE),
    ('Manager', 'employees-access', FALSE, FALSE, FALSE, FALSE),
    ('Manager', 'employees-history', TRUE, FALSE, FALSE, FALSE),

    ('Employee', 'employees-drafts', FALSE, FALSE, FALSE, FALSE),
    ('Employee', 'employees-compensation', FALSE, FALSE, FALSE, FALSE),
    ('Employee', 'employees-documents', FALSE, FALSE, FALSE, FALSE),
    ('Employee', 'employees-assets', FALSE, FALSE, FALSE, FALSE),
    ('Employee', 'employees-access', FALSE, FALSE, FALSE, FALSE),
    ('Employee', 'employees-history', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (role, page) DO NOTHING;

ALTER TABLE employee_personal_details
    ADD COLUMN IF NOT EXISTS permanent_address TEXT,
    ADD COLUMN IF NOT EXISTS personal_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(20);
