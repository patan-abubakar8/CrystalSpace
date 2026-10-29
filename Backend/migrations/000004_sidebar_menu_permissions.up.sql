-- Migration: 000004_sidebar_menu_permissions.up.sql
-- Adds page permissions for the expanded sidebar menu:
--   tasks, daily-logs, calendar, chats, meetings, documents, support,
--   announcements, workflows, audit-logs, org-settings
-- Without these rows the menu entries stay hidden for every non-SuperAdmin role.

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

-- Admin: full operational access; audit logs are view-only (append-only trail)
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

-- HR: people-facing collaboration, documents and announcements; no admin settings
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

-- Manager: team-level tracking and approvals
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

-- Employee: self-service collaboration
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
