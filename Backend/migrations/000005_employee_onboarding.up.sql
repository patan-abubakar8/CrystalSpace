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

ALTER TABLE employee_personal_details
    ADD COLUMN IF NOT EXISTS permanent_address TEXT,
    ADD COLUMN IF NOT EXISTS personal_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(20);

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
