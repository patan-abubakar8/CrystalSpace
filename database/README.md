# CrystalSpace Database Scripts

All database scripts, migrations, and schema definitions are centralized in this directory.

## Directory Structure

```
database/
├── schema.sql                         # Complete unified PostgreSQL master schema & RBAC seeds
├── migrations/                        # Sequential versioned migration files
│   ├── 000001_initial_schema.up.sql   # Core tables (users, employees, depts, leaves, salaries, projects)
│   ├── 000002_dynamic_rbac.up.sql     # Dynamic roles and role_permissions matrix
│   └── 000003_attendance.up.sql       # Attendance tracking, work mode, and indexes
└── README.md                          # Documentation and execution instructions
```

## How to Run

### Option 1: Automated Auto-Migration (Default)
When the Golang backend starts up, it automatically executes the unified schema on PostgreSQL via `AutoMigrate`:
```bash
cd Backend
go run ./cmd/api
```

### Option 2: Direct PostgreSQL CLI (`psql`)
To apply the entire schema directly:
```bash
psql -h localhost -U postgres -d crystalspace -f database/schema.sql
```

To run individual migrations incrementally:
```bash
psql -h localhost -U postgres -d crystalspace -f database/migrations/000001_initial_schema.up.sql
psql -h localhost -U postgres -d crystalspace -f database/migrations/000002_dynamic_rbac.up.sql
psql -h localhost -U postgres -d crystalspace -f database/migrations/000003_attendance.up.sql
```
