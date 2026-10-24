# Golang Backend Architecture Specification

## 1. Architectural Philosophy: Clean / Hexagonal Architecture

To ensure testability, scalability, and strict separation of concerns, the Go backend follows the Standard Go Project Layout:

```
Backend/
├── cmd/
│   └── api/
│       └── main.go                  # Application entry point, dependency wiring, graceful shutdown
├── internal/
│   ├── config/                      # Environment variables, database credentials, JWT secrets
│   ├── domain/                      # Enterprise entities, DTOs, and interface contracts
│   │   ├── user.go                  # Auth, roles, claims, password hashing
│   │   ├── employee.go              # Employee profile, personal, emergency, professional details
│   │   ├── department.go            # Department hierarchies
│   │   ├── leave.go                 # Leave applications, balances, approvals
│   │   ├── salary.go                # Salary structures, payroll periods, payslips
│   │   ├── project.go               # Projects, task assignments, tracking
│   │   ├── document.go              # File uploads, document metadata
│   │   └── activity.go              # Audit trail and activity logs
│   ├── repository/                  # Database access layer (PostgreSQL / pgx / SQL)
│   │   ├── postgres/
│   │   │   ├── db.go                # pgxpool connection lifecycle & health check
│   │   │   ├── user_repo.go
│   │   │   ├── employee_repo.go
│   │   │   ├── leave_repo.go
│   │   │   ├── salary_repo.go
│   │   │   └── project_repo.go
│   ├── service/                     # Business logic and domain use cases
│   │   ├── auth_service.go          # Login, Register, Refresh Tokens, Password policy
│   │   ├── employee_service.go      # Onboarding, profile updates, directory
│   │   ├── hr_service.go            # Department assignments, hierarchy, stats
│   │   ├── leave_service.go         # Application validation, balance deduction
│   │   ├── payroll_service.go       # Salary breakdown, deductions, payslips
│   │   └── project_service.go       # Task status transitions, assignee management
│   ├── handler/                     # HTTP transport layer (REST API handlers)
│   │   ├── http/
│   │   │   ├── router.go            # Route definitions & grouping
│   │   │   ├── auth_handler.go
│   │   │   ├── employee_handler.go
│   │   │   ├── hr_handler.go
│   │   │   ├── leave_handler.go
│   │   │   ├── payroll_handler.go
│   │   │   └── project_handler.go
│   └── middleware/                  # HTTP interceptors
│       ├── auth_jwt.go              # JWT verification & claims injection
│       ├── rbac.go                  # Role enforcement (Admin, HR, Manager, Employee)
│       ├── cors.go                  # CORS headers for React Web & Flutter Desktop/Mobile
│       ├── logger.go                # Structured logging using log/slog
│       └── recovery.go              # Panic recovery with standardized 500 JSON
├── migrations/                      # Versioned PostgreSQL migration scripts (.sql)
│   ├── 000001_create_users_table.up.sql
│   ├── 000002_create_employees_table.up.sql
│   ├── 000003_create_leaves_table.up.sql
│   ├── 000004_create_salaries_table.up.sql
│   └── 000005_create_projects_table.up.sql
├── pkg/
│   ├── validator/                   # Request body validation
│   └── response/                    # Standardized JSON response envelope
├── go.mod
├── go.sum
└── Dockerfile                       # Multi-stage lightweight scratch/alpine build (~20MB)
```

---

## 2. Standardized API Response Contract

Every endpoint returns a consistent JSON envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "Resource retrieved successfully",
  "error": null,
  "meta": {
    "page": 1,
    "page_size": 20,
    "total_records": 142
  }
}
```

---

## 3. Security & Authentication Architecture
- **Password Hashing**: `golang.org/x/crypto/bcrypt` (cost factor 12) or `argon2id`.
- **Token Architecture**:
  - **Access Token**: Short-lived (15 minutes), signed with HMAC-SHA256 (JWT), contains `user_id`, `role`, `email`.
  - **Refresh Token**: Long-lived (7 days), stored hashed in PostgreSQL with revocation / device tracking.
- **RBAC**: Roles: `Admin`, `HRManager`, `DepartmentManager`, `Employee`.
- **CORS**: Configured to permit requests from React Web (`http://localhost:5173` or production domain) and Flutter clients.

---

## 4. PostgreSQL Database Integration
- **Driver**: `jackc/pgx/v5` with `pgxpool.Pool` for thread-safe high-performance connection pooling.
- **Migration Engine**: `golang-migrate/migrate` for deterministic, version-controlled SQL up/down migrations.
- **Relational Integrity**: Foreign keys, cascade rules, composite indexes on search columns (`employee_id`, `department_id`, `created_at`).
