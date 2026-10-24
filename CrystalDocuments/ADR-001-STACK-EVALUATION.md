# ADR-001: Backend & Desktop Architecture Selection

* **Status**: Proposed / Under Discussion
* **Date**: 2026-10-24
* **Author**: Senior Software Architect

---

## 1. Context & Objectives

The application targets a multi-client ecosystem:
- **Web**: React
- **Mobile**: Flutter (iOS / Android)
- **Desktop**: Windows / macOS / Linux
- **Backend**: API server powering all clients with authentication, business logic, relational data persistence, and RBAC.

The existing repository already contains a clean, tiered .NET 8 codebase:
- `Organize4u.Core` (Domain Entities, Enums, Interfaces)
- `Organize4u.Data` (Entity Framework Core, ApplicationDbContext, SQLite/Relational schemas, Unit of Work, Identity Repositories)
- `Organize4u.Service` (HR Service, Employee Service, Identity Logic)
- `Organize4u` (ASP.NET Core Web MVC application)

---

## 2. Backend Evaluation

### Option A: ASP.NET Core 8 Web API (Refactor Existing Solution)
* **Description**: Convert/extend the existing `Organize4u` web project into a dedicated RESTful Web API (with JWT Bearer tokens, ASP.NET Core Identity API endpoints, and Swagger/OpenAPI documentation) located in `Backend/`.

* **Pros**:
  * **Zero Sunk Cost**: Leverages existing domain entities, EF Core database mappings, seed data, and HR business services immediately.
  * **Enterprise Performance**: .NET 8/9 is one of the highest performing enterprise runtimes in the world (top tier in TechEmpower benchmarks, low latency, native async I/O).
  * **Scalability (100k+ users)**: Robust concurrency, out-of-the-box connection pooling, thread scheduling, and strongly-typed LINQ queries.
  * **Security**: Built-in Microsoft.AspNetCore.Identity for secure password hashing, 2FA, token providers, claims-based authorization, and RBAC.
  * **Database Agility**: EF Core easily transitions from SQLite (dev) to PostgreSQL/SQL Server (prod) with zero domain logic changes.

* **Cons**:
  * Requires C# / .NET skill set.
  * Requires OpenAPI / Swagger code-gen to automatically generate TypeScript DTOs for React and Dart models for Flutter.

* **Best For**: Enterprise scalability, data integrity, leveraging the existing codebase, and production reliability.

---

### Option B: Node.js / TypeScript (NestJS or Fastify + Prisma/PostgreSQL)
* **Description**: Discard the existing C# backend and rebuild the API in TypeScript using NestJS (Clean Architecture / DI) or Fastify.

* **Pros**:
  * **Language Uniformity**: Single language (TypeScript) across React Web, Desktop (if Tauri/Electron), and Backend.
  * Shared types/validation schemas (e.g. Zod DTOs) between frontend and backend.
  * Massive npm ecosystem.

* **Cons**:
  * **Rewriting Sunk Work**: Must re-implement all entities, relationships, identity tables, and HR/Employee service logic from scratch.
  * Single-threaded event loop requires careful async management and clustering at high scale.
  * Prisma/TypeORM under high relational loads requires more query tuning than EF Core.

* **Best For**: Teams that only write TypeScript and want zero C# footprint.

---

### Option C: Go (Golang + Gin/Echo + sqlc/GORM)
* **Description**: Rebuild the backend as a compiled Go microservice.

* **Pros**:
  * Minimal memory footprint (~20MB RAM vs 80-150MB), tiny Docker images, blazing fast cold starts.
  * Excellent for high-concurrency raw throughput.

* **Cons**:
  * Sunk work: complete rewrite of existing .NET business logic and Identity.
  * Verbose boilerplate for CRUD, relations, and RBAC.

* **Best For**: Microservices, serverless containers with extreme cost-per-compute constraints.

---

### Option D: Python (FastAPI + SQLAlchemy)
* **Description**: Rebuild with Python FastAPI.

* **Pros**:
  * Fast to prototype, first-class AI/LLM integration ecosystem.

* **Cons**:
  * Sunk work: complete rewrite.
  * Concurrency and CPU-bound throughput are lower than .NET or Go.

* **Best For**: AI-heavy applications where the core value is machine learning pipelines.

---

## 3. Desktop Client Evaluation

### Option 1: Flutter Desktop (Direct Synergy with `Frontend/mobile`)
* **Pros**:
  * **Maximum Code Sharing**: Share up to 80-90% of Dart models, state management, API services, and UI components between Mobile and Desktop.
  * Single UI framework to master and maintain.
  * Native rendering engine (Impeller/Skia) on Windows, macOS, and Linux.

* **Cons**:
  * Desktop-specific patterns (complex windowing, native system menus) require dedicated responsive UI layouts.

* **Best For**: Small to medium teams wanting the lowest maintenance overhead across mobile and desktop.

---

### Option 2: Tauri (React + Rust)
* **Pros**:
  * **Direct Synergy with `Frontend/web`**: Reuses React web views directly inside native OS Webview (Edge WebView2 on Windows, WebKit on macOS).
  * Extremely small bundle size (~10MB) and very low memory usage (~25MB RAM).

* **Cons**:
  * Native backend plugins require Rust if doing heavy OS-level integrations.

* **Best For**: Teams wanting a modern, lightweight desktop app sharing the React codebase.

---

### Option 3: Electron (React + Node.js)
* **Pros**:
  * Industry standard (VS Code, Discord, Slack), mature ecosystem, direct Node.js OS access.

* **Cons**:
  * Heavy resource consumption (Chromium + Node runtime = 150MB+ bundle, 200MB+ RAM).

* **Best For**: Complex desktop tools requiring deep file system / background process control where memory footprint is secondary.

---

## 4. Final Architectural Decisions

1. **Backend**: **Golang (Go) with PostgreSQL** (Decision Confirmed)
   * *Rationale*:
     * Unbeatable concurrency and raw throughput with goroutines.
     * Minimal memory footprint (~20-40MB RAM) and lightning-fast execution.
     * Single statically linked binary deployment — zero external runtime dependencies.
     * Rock-solid data persistence using **PostgreSQL** (`pgx/v5` connection pooling) and clean SQL migrations.
     * Industry-standard Clean Architecture (`cmd/`, `internal/domain`, `internal/repository`, `internal/service`, `internal/handler`).
   * *Action*: Use the existing C# models and services in `Organize4u` as the domain blueprint, porting them to idiomatic Go.

2. **Frontend Clients**:
   * **Web**: React (Vite + TypeScript)
   * **Mobile**: Flutter (iOS & Android)
   * **Desktop**: Flutter Desktop (Windows, macOS, Linux) — sharing code & business logic with Mobile.

3. **Database**: **PostgreSQL** (ACID compliant, relational integrity, JSONB support).
