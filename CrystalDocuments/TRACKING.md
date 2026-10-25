# CrystalSpace Project Tracking & Roadmap

## Milestone 1: Workspace & Architecture Setup
- [x] Clone and verify `Organize4u-new` repository.
- [x] Create project monorepo structure:
  - [x] `Frontend/web` (React)
  - [x] `Frontend/mobile` (Flutter)
  - [x] `Frontend/desktop`
  - [x] `CrystalDocuments/`
- [x] Author initial architecture documents and ADR-001 (Stack Decisions).
- [x] Align with team on Desktop decision: **Flutter Desktop** (Confirmed).
- [x] Database Selection: **PostgreSQL** (Confirmed).
- [x] Align with team on Backend decision: **Golang (Go)** (Confirmed).
- [x] Archive legacy C# codebase into `legacy-csharp/` for business rule reference.

---

## Milestone 2: Golang Backend N-Tier Architecture & Verification
- [x] Install and verify Go runtime environment (`go 1.27.0 windows/amd64`).
- [x] Structure strictly following **N-Tier Architecture**:
  - [x] **Tier 1 (Presentation / API)**: Handlers (`api/handlers/`), Middleware (`api/middlewares/`), Routes (`api/routes.go`)
  - [x] **Tier 2 (Business Logic - BLL)**: Services (`service/`) with domain rules and validation
  - [x] **Tier 3 (Data Access - DAL)**: Repositories (`data/`) and connection pooling (`data/postgres/`)
  - [x] **Core & Cross-Cutting**: Models (`core/models/`), Interfaces (`core/interfaces/`), DTOs (`core/dto/`)
- [x] Implement thread-safe PostgreSQL connection pooling (`pgxpool.Pool`) configured for 100k+ users.
- [x] Implement JWT Bearer Authentication & RBAC middleware (`Admin`, `HR`, `Manager`, `Employee`, `SuperAdmin`).
- [x] Implement CORS middleware for React Web & Flutter Desktop/Mobile.
- [x] Create PostgreSQL Initial Migration script (`Backend/migrations/000001_initial_schema.up.sql`).
- [x] Build standalone Database Seeder (`Backend/cmd/seed/main.go`).
- [x] Pass unit test suites (`go test -v ./pkg/security/...`).
- [x] Compile and verify standalone binaries (`Backend/bin/api.exe` & `Backend/bin/seed.exe`).

---

## Milestone 3: Client Scaffolding
- [x] **Frontend/web**:
  - [x] Scaffold React (Vite + TypeScript) project with modular architecture.
  - [x] Establish Vanilla CSS design token system (`tokens.css`, `global.css`, `components.css`, dark/light themes, Outfit & Plus Jakarta Sans typography).
  - [x] Integrate TanStack Query v5 (`@tanstack/react-query`) with automatic query caching, background polling, and mutations.
  - [x] Implement feature modules: `auth`, `dashboard`, `employees`, `departments`, `leaves`.
  - [x] Production build verified (`npm run build` passing with zero errors).
- [ ] **Frontend/mobile**:
  - [ ] Scaffold Flutter app with clean architecture.
  - [ ] Implement mobile auth flow & secure storage.
- [ ] **Frontend/desktop**:
  - [ ] Scaffold desktop client based on chosen tech stack.

---

## Milestone 4: Feature Implementation & Verification
- [ ] End-to-end authentication and token persistence.
- [ ] Employee dashboard, HR workflows, and department views across all clients.
- [ ] Automated testing (Unit tests, integration tests).
