# CrystalSpace Backend (Go / Golang)

High-performance, production-ready RESTful Web API for CrystalSpace, built with Go 1.22+ and PostgreSQL.

## Architecture

This project follows **Clean / Hexagonal Architecture**:
- `cmd/api`: Server entrypoint and graceful shutdown.
- `internal/domain`: Pure enterprise business entities and repository contracts.
- `internal/service`: Application business use-cases and rules.
- `internal/repository`: Data access implementation via PostgreSQL (`pgx/v5`).
- `internal/handler`: HTTP presentation layer (REST handlers).
- `internal/middleware`: JWT validation, RBAC enforcement, CORS, recovery, and structured logging (`log/slog`).
- `migrations`: Deterministic, versioned SQL database migrations for PostgreSQL.

## Multi-Client Support
The API serves:
1. **Web**: React (TypeScript)
2. **Mobile**: Flutter (iOS & Android)
3. **Desktop**: Flutter Desktop (Windows, macOS, Linux)
