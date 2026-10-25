package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	"crystalspace/backend/config"
	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/models"
	"crystalspace/backend/data"
	"crystalspace/backend/data/postgres"
	"crystalspace/backend/pkg/security"
	"crystalspace/backend/service"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	cfg := config.Load()
	slog.Info("Starting database seed script...", "db", cfg.DatabaseURL)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pool, err := postgres.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("Failed to connect to database for seeding", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	// Ensure tables exist
	if err := postgres.AutoMigrate(ctx, pool); err != nil {
		slog.Error("Auto-migration during seed failed", "error", err)
		os.Exit(1)
	}

	userRepo := data.NewUserRepository(pool)
	deptRepo := data.NewDepartmentRepository(pool)
	empRepo := data.NewEmployeeRepository(pool)
	leaveRepo := data.NewLeaveRepository(pool)
	salarySvc := service.NewSalaryService(data.NewSalaryRepository(pool))

	// 1. Seed SuperAdmin
	adminEmail := "superadmin@organize.com"
	adminUser, _ := userRepo.GetByEmail(ctx, adminEmail)
	if adminUser == nil {
		hash, _ := security.HashPassword("Admin@123")
		adminUser = &models.User{
			Email:        adminEmail,
			PasswordHash: hash,
			Role:         "SuperAdmin",
			IsActive:     true,
		}
		_ = userRepo.Create(ctx, adminUser)
		slog.Info("Seeded SuperAdmin user", "email", adminEmail)
	}

	// 2. Seed HR User
	hrEmail := "hr@organize.com"
	hrUser, _ := userRepo.GetByEmail(ctx, hrEmail)
	if hrUser == nil {
		hash, _ := security.HashPassword("HR@123")
		hrUser = &models.User{
			Email:        hrEmail,
			PasswordHash: hash,
			Role:         "HR",
			IsActive:     true,
		}
		_ = userRepo.Create(ctx, hrUser)
		slog.Info("Seeded HR user", "email", hrEmail)
	}

	// 3. Seed Departments
	depts := []models.Department{
		{Name: "Human Resources", Code: "HR", Description: "Human Resources and People Ops"},
		{Name: "Engineering", Code: "ENG", Description: "Software Engineering & Architecture"},
		{Name: "Sales", Code: "SLS", Description: "Sales and Business Development"},
		{Name: "Administration", Code: "ADM", Description: "Office and Systems Administration"},
	}
	for _, d := range depts {
		deptCopy := d
		if err := deptRepo.Create(ctx, &deptCopy); err != nil {
			slog.Warn("Department seed notice (may already exist)", "dept", d.Name, "error", err)
		}
	}
	slog.Info("Seeded default departments")

	// 4. Seed Leave Types
	leaveTypes := []string{"Sick Leave", "Annual Leave", "Casual Leave"}
	existingTypes, _ := leaveRepo.ListLeaveTypes(ctx)
	if len(existingTypes) == 0 {
		_, _ = pool.Exec(ctx, `
			INSERT INTO leave_types (name, default_days, description) VALUES
			('Sick Leave', 10, 'Medical and sickness leave'),
			('Annual Leave', 20, 'Paid annual vacation'),
			('Casual Leave', 5, 'Personal and casual affairs')
			ON CONFLICT DO NOTHING;
		`)
		slog.Info("Seeded default leave types", "types", leaveTypes)
	}

	// 5. Seed Sample Employees
	deptList, _ := deptRepo.List(ctx)
	var engDeptID int
	for _, d := range deptList {
		if d.Code == "ENG" {
			engDeptID = d.ID
			break
		}
	}
	if engDeptID == 0 && len(deptList) > 0 {
		engDeptID = deptList[0].ID
	}

	sampleEmp := &models.Employee{
		FirstName:      "Ahmed",
		LastName:       "Khan",
		Email:          "ahmed.k@organize.com",
		PhoneNumber:    "+91 98765 43210",
		Designation:    "Lead Full Stack Engineer",
		DepartmentID:   engDeptID,
		EmployeeCode:   "EMP-1024",
		OfficeLocation: "Hyderabad",
		DateOfJoining:  time.Now().UTC().AddDate(-2, 0, 0),
		Status:         "Active",
		PersonalDetail: &models.PersonalDetail{
			Gender:        "Male",
			MaritalStatus: "Single",
			BloodGroup:    "O+",
			City:          "Hyderabad",
			Country:       "India",
		},
		ProfessionalDetail: &models.ProfessionalDetail{
			EmploymentType:       "FullTime",
			WorkMode:             "Hybrid",
			TotalExperienceYears: 5.5,
			Skills:               "Go, PostgreSQL, React, Flutter, Docker, Kubernetes",
		},
	}

	_ = empRepo.Create(ctx, sampleEmp)
	if sampleEmp.ID > 0 {
		_, _ = salarySvc.CalculateAndSave(ctx, sampleEmp.ID, dto.SalaryRequest{
			BasicSalary:      120000,
			HRA:              48000,
			Conveyance:       5000,
			MedicalAllowance: 5000,
			SpecialAllowance: 22000,
			ProvidentFund:    14400,
			ProfessionalTax:  200,
			TDS:              8000,
		}, "System Seed")
		slog.Info("Seeded sample employee & salary structure", "id", sampleEmp.ID, "name", sampleEmp.FirstName)
	}

	slog.Info("Seeding completed successfully!")
}
