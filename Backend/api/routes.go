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
	Config           *config.Config
	AuthService      interfaces.AuthService
	EmployeeService  interfaces.EmployeeService
	DepartmentService interfaces.DepartmentService
	LeaveService     interfaces.LeaveService
	SalaryService    interfaces.SalaryService
	ProjectService   interfaces.ProjectService
	DashboardService interfaces.DashboardService
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

			// Dashboard Overview
			protected.Get("/dashboard/stats", dashH.GetStats)

			// Employee Management
			protected.Route("/employees", func(emp chi.Router) {
				emp.Get("/", empH.List)
				emp.Get("/{id}", empH.GetByID)

				emp.Group(func(admin chi.Router) {
					admin.Use(middlewares.RequireRole("Admin", "HR", "SuperAdmin"))
					admin.Post("/", empH.Create)
					admin.Put("/{id}", empH.Update)
					admin.Delete("/{id}", empH.Delete)
				})
			})

			// Department Management
			protected.Route("/departments", func(dept chi.Router) {
				dept.Get("/", deptH.List)
				dept.Get("/{id}", deptH.GetByID)

				dept.Group(func(admin chi.Router) {
					admin.Use(middlewares.RequireRole("Admin", "HR", "SuperAdmin"))
					admin.Post("/", deptH.Create)
					admin.Put("/{id}", deptH.Update)
					admin.Delete("/{id}", deptH.Delete)
				})
			})

			// Leaves Management
			protected.Route("/leaves", func(l chi.Router) {
				l.Get("/my", leaveH.ListMyLeaves)
				l.Post("/apply", leaveH.Apply)
				l.Get("/types", leaveH.ListTypes)
				l.Get("/balances/{employee_id}", leaveH.GetBalances)

				l.Group(func(approver chi.Router) {
					approver.Use(middlewares.RequireRole("Admin", "HR", "Manager", "SuperAdmin"))
					approver.Get("/pending", leaveH.ListPending)
					approver.Patch("/{id}/status", leaveH.Review)
				})
			})

			// Compensation & Salaries
			protected.Route("/salaries", func(s chi.Router) {
				s.Group(func(hr chi.Router) {
					hr.Use(middlewares.RequireRole("Admin", "HR", "SuperAdmin"))
					hr.Get("/employee/{employee_id}", salaryH.GetByEmployeeID)
					hr.Post("/employee/{employee_id}", salaryH.Save)
					hr.Get("/employee/{employee_id}/history", salaryH.GetHistory)
				})
			})

			// Projects & Tasks
			protected.Route("/projects", func(proj chi.Router) {
				proj.Get("/", projH.ListProjects)
				proj.Get("/{id}/tasks", projH.ListTasks)
				proj.Patch("/tasks/{task_id}/status", projH.UpdateTaskStatus)

				proj.Group(func(mgr chi.Router) {
					mgr.Use(middlewares.RequireRole("Admin", "HR", "Manager", "SuperAdmin"))
					mgr.Post("/", projH.CreateProject)
					mgr.Post("/{id}/tasks", projH.CreateTask)
				})
			})
		})
	})

	return r
}
