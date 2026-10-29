-- Migration 000003: Attendance Management & Heatmap Matrix
-- Enables time tracking, check-ins/outs, and attendance status

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

CREATE INDEX IF NOT EXISTS idx_attendances_emp_date ON attendances(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(date);

-- Role permissions for attendance
INSERT INTO role_permissions (role, page, can_view, can_create, can_update, can_delete) VALUES
    ('SuperAdmin', 'attendance', TRUE, TRUE, TRUE, TRUE),
    ('Admin', 'attendance', TRUE, TRUE, TRUE, TRUE),
    ('HR', 'attendance', TRUE, TRUE, TRUE, FALSE),
    ('Manager', 'attendance', TRUE, TRUE, FALSE, FALSE),
    ('Employee', 'attendance', TRUE, TRUE, FALSE, FALSE)
ON CONFLICT (role, page) DO NOTHING;
