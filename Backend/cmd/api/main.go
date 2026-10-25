package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"crystalspace/backend/api"
	"crystalspace/backend/config"
	"crystalspace/backend/data"
	"crystalspace/backend/data/postgres"
	"crystalspace/backend/service"
)

func main() {
	// Structured JSON logging
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	// Load Configuration
	cfg := config.Load()
	slog.Info("Starting CrystalSpace N-Tier Backend API", "port", cfg.Port, "env", cfg.Environment)

	// Initialize Database Pool (Tier 3: Data Access Layer)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	dbPool, err := postgres.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("Database connection initialization failed", "error", err)
	} else {
		defer dbPool.Close()

		// Execute schema auto-migration
		if err := postgres.AutoMigrate(ctx, dbPool); err != nil {
			slog.Warn("Auto-migration notice (check database readiness)", "error", err)
		}
	}

	// 1. Instantiate Data Repositories (DAL)
	userRepo := data.NewUserRepository(dbPool)
	empRepo := data.NewEmployeeRepository(dbPool)
	deptRepo := data.NewDepartmentRepository(dbPool)
	leaveRepo := data.NewLeaveRepository(dbPool)
	salaryRepo := data.NewSalaryRepository(dbPool)
	projRepo := data.NewProjectRepository(dbPool)
	permRepo := data.NewPermissionRepository(dbPool)

	// 2. Instantiate Business Services (BLL)
	authSvc := service.NewAuthService(userRepo, empRepo, cfg.JWTSecret)
	empSvc := service.NewEmployeeService(empRepo, userRepo)
	deptSvc := service.NewDepartmentService(deptRepo)
	leaveSvc := service.NewLeaveService(leaveRepo)
	salarySvc := service.NewSalaryService(salaryRepo)
	projSvc := service.NewProjectService(projRepo)
	dashSvc := service.NewDashboardService(empRepo, leaveRepo, deptRepo, projRepo)
	permSvc := service.NewPermissionService(permRepo)

	// 3. Setup Presentation / API Routing (Tier 1)
	router := api.SetupRoutes(api.RouterParams{
		Config:            cfg,
		AuthService:       authSvc,
		EmployeeService:   empSvc,
		DepartmentService: deptSvc,
		LeaveService:      leaveSvc,
		SalaryService:     salarySvc,
		ProjectService:    projSvc,
		DashboardService:  dashSvc,
		PermissionService: permSvc,
		PermissionRepo:    permRepo,
	})

	// 4. HTTP Server
	server := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Run Server asynchronously
	serverErrors := make(chan error, 1)
	go func() {
		slog.Info("Server listening for HTTP requests", "addr", server.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErrors <- err
		}
	}()

	// Graceful Shutdown Handling
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		slog.Error("Fatal server error", "error", err)
		os.Exit(1)

	case sig := <-shutdown:
		slog.Info("Shutdown signal received", "signal", sig.String())

		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer shutdownCancel()

		if err := server.Shutdown(shutdownCtx); err != nil {
			slog.Error("Graceful shutdown failed; terminating immediately", "error", err)
			_ = server.Close()
		}
		slog.Info("Server shutdown complete")
	}
}
