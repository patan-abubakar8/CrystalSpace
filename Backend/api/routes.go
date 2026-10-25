package api

import (
	"net/http"
	"time"

	"crystalspace/backend/api/handlers"
	"crystalspace/backend/api/middlewares"
	"crystalspace/backend/config"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/pkg/response"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

type RouterParams struct {
	Config            *config.Config
	AuthService       interfaces.AuthService
	EmployeeService   interfaces.EmployeeService
	DepartmentService interfaces.DepartmentService
	LeaveService      interfaces.LeaveService
	SalaryService     interfaces.SalaryService
	ProjectService    interfaces.ProjectService
	DashboardService  interfaces.DashboardService
	PermissionService interfaces.PermissionService
	PermissionRepo    interfaces.PermissionRepository
}

func SetupRoutes(p RouterParams) *chi.Mux {
	r := chi.NewRouter()

	// Base middleware pipeline
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Timeout(60 * time.Second))
	r.Use(middlewares.CORS())

	// Handlers initialization
	authH := handlers.NewAuthHandler(p.AuthService)
	empH := handlers.NewEmployeeHandler(p.EmployeeService)
	deptH := handlers.NewDepartmentHandler(p.DepartmentService)
	leaveH := handlers.NewLeaveHandler(p.LeaveService, p.EmployeeService)
	salaryH := handlers.NewSalaryHandler(p.SalaryService)
	projH := handlers.NewProjectHandler(p.ProjectService)
	dashH := handlers.NewDashboardHandler(p.DashboardService)
	permH := handlers.NewPermissionHandler(p.PermissionService)

	// Liveness & Readiness Probe
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		response.JSON(w, http.StatusOK, map[string]interface{}{
			"status":    "healthy",
			"timestamp": time.Now().UTC(),
			"version":   "1.0.0",
		}, "CrystalSpace API is healthy")
	})

	// API v1 Routing
	r.Route("/api/v1", func(v1 chi.Router) {
		// Public Auth
		v1.Route("/auth", func(auth chi.Router) {
			auth.Post("/register", authH.Register)
			auth.Post("/login", authH.Login)
		})

		// Protected endpoints
		v1.Group(func(protected chi.Router) {
			protected.Use(middlewares.JWTAuth(p.Config.JWTSecret))

			// Current User Profile
			protected.Get("/auth/me", authH.GetProfile)

			// Current User Dynamic Page Permissions (used by frontend to toggle UI elements)
			protected.Get("/permissions/my", permH.GetMyPermissions)

			// Dashboard Overview
			protected.Get("/dashboard/stats", dashH.GetStats)

			// Employee Management (Enforced by can_view, can_create, can_update, can_delete)
			protected.Route("/employees", func(emp chi.Router) {
				emp.Use(middlewares.RequirePermission(p.PermissionRepo, "employees", "view"))
				emp.Get("/", empH.List)
				emp.Get("/{id}", empH.GetByID)

				emp.With(middlewares.RequirePermission(p.PermissionRepo, "employees", "create")).Post("/", empH.Create)
				emp.With(middlewares.RequirePermission(p.PermissionRepo, "employees", "update")).Put("/{id}", empH.Update)
				emp.With(middlewares.RequirePermission(p.PermissionRepo, "employees", "delete")).Delete("/{id}", empH.Delete)
			})

			// Department Management (Enforced by can_view, can_create, can_update, can_delete)
			protected.Route("/departments", func(dept chi.Router) {
				dept.Use(middlewares.RequirePermission(p.PermissionRepo, "departments", "view"))
				dept.Get("/", deptH.List)
				dept.Get("/{id}", deptH.GetByID)

				dept.With(middlewares.RequirePermission(p.PermissionRepo, "departments", "create")).Post("/", deptH.Create)
				dept.With(middlewares.RequirePermission(p.PermissionRepo, "departments", "update")).Put("/{id}", deptH.Update)
				dept.With(middlewares.RequirePermission(p.PermissionRepo, "departments", "delete")).Delete("/{id}", deptH.Delete)
			})

			// Leaves Management (Enforced by can_view, can_create, can_update)
			protected.Route("/leaves", func(l chi.Router) {
				l.Use(middlewares.RequirePermission(p.PermissionRepo, "leaves", "view"))
				l.Get("/my", leaveH.ListMyLeaves)
				l.Get("/types", leaveH.ListTypes)
				l.Get("/balances/{employee_id}", leaveH.GetBalances)

				l.With(middlewares.RequirePermission(p.PermissionRepo, "leaves", "create")).Post("/apply", leaveH.Apply)
				l.With(middlewares.RequirePermission(p.PermissionRepo, "leaves", "update")).Get("/pending", leaveH.ListPending)
				l.With(middlewares.RequirePermission(p.PermissionRepo, "leaves", "update")).Patch("/{id}/status", leaveH.Review)
			})

			// Compensation & Salaries (Enforced by can_view, can_create, can_update)
			protected.Route("/salaries", func(s chi.Router) {
				s.Use(middlewares.RequirePermission(p.PermissionRepo, "salaries", "view"))
				s.Get("/employee/{employee_id}", salaryH.GetByEmployeeID)
				s.Get("/employee/{employee_id}/history", salaryH.GetHistory)
				s.With(middlewares.RequirePermission(p.PermissionRepo, "salaries", "create")).Post("/employee/{employee_id}", salaryH.Save)
			})

			// Projects & Tasks (Enforced by can_view, can_create, can_update)
			protected.Route("/projects", func(proj chi.Router) {
				proj.Use(middlewares.RequirePermission(p.PermissionRepo, "projects", "view"))
				proj.Get("/", projH.ListProjects)
				proj.Get("/{id}/tasks", projH.ListTasks)
				proj.With(middlewares.RequirePermission(p.PermissionRepo, "projects", "update")).Patch("/tasks/{task_id}/status", projH.UpdateTaskStatus)
				proj.With(middlewares.RequirePermission(p.PermissionRepo, "projects", "create")).Post("/", projH.CreateProject)
				proj.With(middlewares.RequirePermission(p.PermissionRepo, "projects", "create")).Post("/{id}/tasks", projH.CreateTask)
			})

			// Dynamic Roles & Permissions Matrix Management (System Admin / DB-configured roles)
			protected.Route("/admin/roles", func(admin chi.Router) {
				admin.Use(middlewares.RequirePermission(p.PermissionRepo, "roles", "view"))
				admin.Get("/", permH.ListRoles)

				admin.Group(func(edit chi.Router) {
					edit.Use(middlewares.RequirePermission(p.PermissionRepo, "roles", "update"))
					edit.Post("/", permH.CreateRole)
					edit.Put("/{name}/permissions", permH.UpdatePermissions)
					edit.Delete("/{name}", permH.DeleteRole)
				})
			})
		})
	})

	return r
}
