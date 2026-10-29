package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"time"

	"crystalspace/backend/config"
	"crystalspace/backend/core/models"
	"crystalspace/backend/data"
	"crystalspace/backend/data/postgres"
	"crystalspace/backend/pkg/security"
)

type SeedUserDef struct {
	Role         string
	FirstName    string
	LastName     string
	Email        string
	Password     string
	DeptCode     string
	Designation  string
	EmployeeCode string
	Phone        string
	Location     string
	Gender       string
	BloodGroup   string
	WorkMode     string
	Skills       string
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)

	cfg := config.Load()
	slog.Info("Starting CrystalSpace 5-Users-Per-Role Seeder", "database", cfg.DatabaseURL)

	ctx, cancel := context.WithTimeout(context.Background(), 90*time.Second)
	defer cancel()

	pool, err := postgres.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("Database connection failed", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	// Auto-migrate tables if not already existing
	if err := postgres.AutoMigrate(ctx, pool); err != nil {
		slog.Warn("Auto-migrate warning", "error", err)
	}

	userRepo := data.NewUserRepository(pool)
	deptRepo := data.NewDepartmentRepository(pool)
	empRepo := data.NewEmployeeRepository(pool)

	// 1. Ensure Standard Departments Exist
	deptMap := make(map[string]int)
	defaultDepts := []models.Department{
		{Name: "Administration", Code: "ADM", Description: "Corporate Leadership, IT & Security Operations"},
		{Name: "Engineering", Code: "ENG", Description: "Core Platform, Architecture & Cloud Engineering"},
		{Name: "Human Resources", Code: "HR", Description: "People Operations, Talent Acquisition & Culture"},
		{Name: "Sales", Code: "SLS", Description: "Enterprise Sales, Partnerships & Client Solutions"},
	}

	for _, d := range defaultDepts {
		var id int
		err := pool.QueryRow(ctx, "SELECT id FROM departments WHERE code = $1", d.Code).Scan(&id)
		if err != nil {
			deptCopy := d
			if err := deptRepo.Create(ctx, &deptCopy); err == nil {
				id = deptCopy.ID
				slog.Info("Created department", "code", d.Code, "id", id)
			} else {
				// Retry fetching if concurrent
				_ = pool.QueryRow(ctx, "SELECT id FROM departments WHERE code = $1", d.Code).Scan(&id)
			}
		}
		deptMap[d.Code] = id
	}

	// 2. Define the 25 Users (5 for each of the 5 roles)
	seedUsers := []SeedUserDef{
		// === SuperAdmin (5 Users) ===
		{
			Role: "SuperAdmin", FirstName: "Abubakar", LastName: "Patan",
			Email: "superadmin@organize.com", Password: "Admin@123",
			DeptCode: "ADM", Designation: "Chief Technology Officer",
			EmployeeCode: "CS-SA01", Phone: "+91 98765 00001", Location: "Headquarters",
			Gender: "Male", BloodGroup: "O+", WorkMode: "Office",
			Skills: "Go, Kubernetes, PostgreSQL, Distributed Architecture, Security Operations",
		},
		{
			Role: "SuperAdmin", FirstName: "Alexander", LastName: "Vance",
			Email: "superadmin2@organize.com", Password: "SuperAdmin@123",
			DeptCode: "ADM", Designation: "Principal Cloud Architect",
			EmployeeCode: "CS-SA02", Phone: "+91 98765 00002", Location: "Headquarters",
			Gender: "Male", BloodGroup: "A+", WorkMode: "Hybrid",
			Skills: "Cloud Infrastructure, Multi-Region Deployment, High Availability, Docker",
		},
		{
			Role: "SuperAdmin", FirstName: "Elena", LastName: "Rostova",
			Email: "superadmin3@organize.com", Password: "SuperAdmin@123",
			DeptCode: "ADM", Designation: "VP of Infrastructure & Security",
			EmployeeCode: "CS-SA03", Phone: "+91 98765 00003", Location: "Headquarters",
			Gender: "Female", BloodGroup: "B+", WorkMode: "Remote",
			Skills: "Zero-Trust Architecture, DevSecOps, Compliance, Identity Governance",
		},
		{
			Role: "SuperAdmin", FirstName: "Marcus", LastName: "Chen",
			Email: "superadmin4@organize.com", Password: "SuperAdmin@123",
			DeptCode: "ADM", Designation: "Chief Information Security Officer",
			EmployeeCode: "CS-SA04", Phone: "+91 98765 00004", Location: "Headquarters",
			Gender: "Male", BloodGroup: "AB+", WorkMode: "Office",
			Skills: "Threat Modeling, Cryptography, PenTesting, SOC2, Enterprise RBAC",
		},
		{
			Role: "SuperAdmin", FirstName: "Sarah", LastName: "Jenkins",
			Email: "superadmin5@organize.com", Password: "SuperAdmin@123",
			DeptCode: "ADM", Designation: "Director of Systems Engineering",
			EmployeeCode: "CS-SA05", Phone: "+91 98765 00005", Location: "Headquarters",
			Gender: "Female", BloodGroup: "O-", WorkMode: "Hybrid",
			Skills: "Distributed Systems, SRE, Performance Tuning, Database Clustering",
		},

		// === Admin (5 Users) ===
		{
			Role: "Admin", FirstName: "David", LastName: "Miller",
			Email: "admin1@organize.com", Password: "Admin@123",
			DeptCode: "ADM", Designation: "Chief Operating Officer",
			EmployeeCode: "CS-AD01", Phone: "+91 98765 00006", Location: "Headquarters",
			Gender: "Male", BloodGroup: "A+", WorkMode: "Office",
			Skills: "Workforce Optimization, Strategic Planning, Operations Governance",
		},
		{
			Role: "Admin", FirstName: "Sophia", LastName: "Taylor",
			Email: "admin2@organize.com", Password: "Admin@123",
			DeptCode: "ADM", Designation: "VP of Global Operations",
			EmployeeCode: "CS-AD02", Phone: "+91 98765 00007", Location: "Headquarters",
			Gender: "Female", BloodGroup: "B-", WorkMode: "Hybrid",
			Skills: "Cross-functional Leadership, Resource Allocation, Enterprise Strategy",
		},
		{
			Role: "Admin", FirstName: "James", LastName: "Wilson",
			Email: "admin3@organize.com", Password: "Admin@123",
			DeptCode: "ADM", Designation: "Director of Corporate Strategy",
			EmployeeCode: "CS-AD03", Phone: "+91 98765 00008", Location: "Headquarters",
			Gender: "Male", BloodGroup: "O+", WorkMode: "Remote",
			Skills: "Business Operations, Financial Analytics, Portfolio Management",
		},
		{
			Role: "Admin", FirstName: "Olivia", LastName: "Martinez",
			Email: "admin4@organize.com", Password: "Admin@123",
			DeptCode: "ADM", Designation: "General Operations Manager",
			EmployeeCode: "CS-AD04", Phone: "+91 98765 00009", Location: "Headquarters",
			Gender: "Female", BloodGroup: "AB-", WorkMode: "Office",
			Skills: "Process Engineering, Operational Excellence, Performance Metrics",
		},
		{
			Role: "Admin", FirstName: "William", LastName: "Anderson",
			Email: "admin5@organize.com", Password: "Admin@123",
			DeptCode: "ADM", Designation: "Executive Operations Director",
			EmployeeCode: "CS-AD05", Phone: "+91 98765 00010", Location: "Headquarters",
			Gender: "Male", BloodGroup: "A-", WorkMode: "Hybrid",
			Skills: "Workplace Operations, Asset Management, Organizational Scaling",
		},

		// === HR (5 Users) ===
		{
			Role: "HR", FirstName: "Priya", LastName: "Sharma",
			Email: "hr@organize.com", Password: "HR@123",
			DeptCode: "HR", Designation: "Chief People Officer",
			EmployeeCode: "CS-HR01", Phone: "+91 98765 00011", Location: "Headquarters",
			Gender: "Female", BloodGroup: "B+", WorkMode: "Office",
			Skills: "Talent Strategy, Organizational Culture, Executive HR, Policy Design",
		},
		{
			Role: "HR", FirstName: "Rachel", LastName: "Green",
			Email: "hr2@organize.com", Password: "HR@123",
			DeptCode: "HR", Designation: "HR Business Partner",
			EmployeeCode: "CS-HR02", Phone: "+91 98765 00012", Location: "Headquarters",
			Gender: "Female", BloodGroup: "O+", WorkMode: "Hybrid",
			Skills: "Employee Lifecycle, Performance Appraisals, Retention Strategy",
		},
		{
			Role: "HR", FirstName: "Daniel", LastName: "Craig",
			Email: "hr3@organize.com", Password: "HR@123",
			DeptCode: "HR", Designation: "Talent Acquisition Lead",
			EmployeeCode: "CS-HR03", Phone: "+91 98765 00013", Location: "Headquarters",
			Gender: "Male", BloodGroup: "A+", WorkMode: "Remote",
			Skills: "Executive Recruiting, Technical Sourcing, Candidate Experience",
		},
		{
			Role: "HR", FirstName: "Ananya", LastName: "Verma",
			Email: "hr4@organize.com", Password: "HR@123",
			DeptCode: "HR", Designation: "People Operations Specialist",
			EmployeeCode: "CS-HR04", Phone: "+91 98765 00014", Location: "Headquarters",
			Gender: "Female", BloodGroup: "AB+", WorkMode: "Office",
			Skills: "Payroll Administration, Benefits Management, HR Compliance",
		},
		{
			Role: "HR", FirstName: "Michael", LastName: "Scott",
			Email: "hr5@organize.com", Password: "HR@123",
			DeptCode: "HR", Designation: "Employee Relations Manager",
			EmployeeCode: "CS-HR05", Phone: "+91 98765 00015", Location: "Headquarters",
			Gender: "Male", BloodGroup: "O-", WorkMode: "Hybrid",
			Skills: "Conflict Resolution, Team Dynamics, Employee Engagement, Wellbeing",
		},

		// === Manager (5 Users) ===
		{
			Role: "Manager", FirstName: "Vikram", LastName: "Malhotra",
			Email: "manager1@organize.com", Password: "Manager@123",
			DeptCode: "ENG", Designation: "Engineering Director",
			EmployeeCode: "CS-MG01", Phone: "+91 98765 00016", Location: "Headquarters",
			Gender: "Male", BloodGroup: "O+", WorkMode: "Office",
			Skills: "Engineering Leadership, Agile Coaching, Architecture Governance",
		},
		{
			Role: "Manager", FirstName: "Carlos", LastName: "Santana",
			Email: "manager2@organize.com", Password: "Manager@123",
			DeptCode: "ENG", Designation: "Software Development Manager",
			EmployeeCode: "CS-MG02", Phone: "+91 98765 00017", Location: "Headquarters",
			Gender: "Male", BloodGroup: "A+", WorkMode: "Hybrid",
			Skills: "Sprint Planning, CI/CD Pipelines, Code Reviews, Team Mentorship",
		},
		{
			Role: "Manager", FirstName: "Emily", LastName: "Watson",
			Email: "manager3@organize.com", Password: "Manager@123",
			DeptCode: "ENG", Designation: "Product Delivery Manager",
			EmployeeCode: "CS-MG03", Phone: "+91 98765 00018", Location: "Headquarters",
			Gender: "Female", BloodGroup: "B+", WorkMode: "Remote",
			Skills: "Roadmap Execution, Stakeholder Management, Release Orchestration",
		},
		{
			Role: "Manager", FirstName: "Rohan", LastName: "Joshi",
			Email: "manager4@organize.com", Password: "Manager@123",
			DeptCode: "SLS", Designation: "Enterprise Sales Lead",
			EmployeeCode: "CS-MG04", Phone: "+91 98765 00019", Location: "Headquarters",
			Gender: "Male", BloodGroup: "AB+", WorkMode: "Office",
			Skills: "Enterprise Accounts, Pipeline Strategy, Revenue Forecasting",
		},
		{
			Role: "Manager", FirstName: "Jessica", LastName: "Pearson",
			Email: "manager5@organize.com", Password: "Manager@123",
			DeptCode: "SLS", Designation: "Client Solutions Manager",
			EmployeeCode: "CS-MG05", Phone: "+91 98765 00020", Location: "Headquarters",
			Gender: "Female", BloodGroup: "A-", WorkMode: "Hybrid",
			Skills: "Client Engagements, Contract Negotiations, Solution Consulting",
		},

		// === Employee (5 Users) ===
		{
			Role: "Employee", FirstName: "Ahmed", LastName: "Khan",
			Email: "employee1@organize.com", Password: "Employee@123",
			DeptCode: "ENG", Designation: "Senior Full Stack Engineer",
			EmployeeCode: "CS-EM01", Phone: "+91 98765 00021", Location: "Headquarters",
			Gender: "Male", BloodGroup: "O+", WorkMode: "Hybrid",
			Skills: "Go, React, TypeScript, PostgreSQL, REST APIs, TailwindCSS",
		},
		{
			Role: "Employee", FirstName: "Maya", LastName: "Patel",
			Email: "employee2@organize.com", Password: "Employee@123",
			DeptCode: "ENG", Designation: "Frontend UI/UX Developer",
			EmployeeCode: "CS-EM02", Phone: "+91 98765 00022", Location: "Headquarters",
			Gender: "Female", BloodGroup: "B+", WorkMode: "Remote",
			Skills: "React, CSS Systems, Motion Design, Accessibility, Figma",
		},
		{
			Role: "Employee", FirstName: "Lucas", LastName: "Silva",
			Email: "employee3@organize.com", Password: "Employee@123",
			DeptCode: "ENG", Designation: "Backend Systems Engineer",
			EmployeeCode: "CS-EM03", Phone: "+91 98765 00023", Location: "Headquarters",
			Gender: "Male", BloodGroup: "A+", WorkMode: "Office",
			Skills: "Go, Microservices, Redis, Event-Driven Architecture, Docker",
		},
		{
			Role: "Employee", FirstName: "Chloe", LastName: "Bennett",
			Email: "employee4@organize.com", Password: "Employee@123",
			DeptCode: "ENG", Designation: "DevOps & Cloud SRE Engineer",
			EmployeeCode: "CS-EM04", Phone: "+91 98765 00024", Location: "Headquarters",
			Gender: "Female", BloodGroup: "O-", WorkMode: "Hybrid",
			Skills: "Kubernetes, Terraform, Prometheus, CI/CD, Linux Administration",
		},
		{
			Role: "Employee", FirstName: "Nathan", LastName: "Drake",
			Email: "employee5@organize.com", Password: "Employee@123",
			DeptCode: "SLS", Designation: "Technical Solutions Specialist",
			EmployeeCode: "CS-EM05", Phone: "+91 98765 00025", Location: "Headquarters",
			Gender: "Male", BloodGroup: "AB-", WorkMode: "Office",
			Skills: "Product Demonstrations, Solution Architecture, Client Onboarding",
		},
	}

	seededCount := 0
	updatedCount := 0

	for _, u := range seedUsers {
		email := strings.ToLower(strings.TrimSpace(u.Email))
		passwordHash, err := security.HashPassword(u.Password)
		if err != nil {
			slog.Error("Failed to hash password", "email", email, "error", err)
			continue
		}

		// 2a. Upsert into Users Table
		existingUser, _ := userRepo.GetByEmail(ctx, email)
		var userID string
		if existingUser != nil {
			userID = existingUser.ID
			_, err = pool.Exec(ctx, `
				UPDATE users
				SET password_hash = $1, role = $2, is_active = TRUE, updated_at = NOW()
				WHERE id = $3
			`, passwordHash, u.Role, userID)
			if err != nil {
				slog.Error("Failed to update user", "email", email, "error", err)
			} else {
				updatedCount++
				slog.Info("Updated existing user credentials", "email", email, "role", u.Role)
			}
		} else {
			newUser := &models.User{
				Email:        email,
				PasswordHash: passwordHash,
				Role:         u.Role,
				IsActive:     true,
			}
			if err := userRepo.Create(ctx, newUser); err != nil {
				slog.Error("Failed to create user", "email", email, "error", err)
				continue
			}
			userID = newUser.ID
			seededCount++
			slog.Info("Created new user", "email", email, "role", u.Role, "id", userID)
		}

		// 2b. Link or Create Employee Profile
		deptID := deptMap[u.DeptCode]
		if deptID == 0 {
			deptID = deptMap["ADM"]
		}

		var existingEmpID int
		err = pool.QueryRow(ctx, "SELECT id FROM employees WHERE email = $1 OR user_id = $2", email, userID).Scan(&existingEmpID)
		if err != nil || existingEmpID == 0 {
			emp := &models.Employee{
				UserID:         userID,
				FirstName:      u.FirstName,
				LastName:       u.LastName,
				Email:          email,
				PhoneNumber:    u.Phone,
				Designation:    u.Designation,
				DepartmentID:   deptID,
				EmployeeCode:   u.EmployeeCode,
				OfficeLocation: u.Location,
				DateOfJoining:  time.Now().UTC().AddDate(-1, 0, 0),
				Status:         "Active",
				PersonalDetail: &models.PersonalDetail{
					Gender:        u.Gender,
					BloodGroup:    u.BloodGroup,
					MaritalStatus: "Single",
					City:          "Hyderabad",
					State:         "Telangana",
					Country:       "India",
				},
				ProfessionalDetail: &models.ProfessionalDetail{
					EmploymentType:       "FullTime",
					WorkMode:             u.WorkMode,
					TotalExperienceYears: 4.5,
					Skills:               u.Skills,
				},
			}
			if err := empRepo.Create(ctx, emp); err != nil {
				slog.Warn("Notice creating employee profile (may already exist)", "email", email, "error", err)
			} else {
				existingEmpID = emp.ID
				slog.Info("Created employee profile", "name", u.FirstName+" "+u.LastName, "emp_id", existingEmpID)
			}
		} else {
			// Update employee to ensure user_id and department match
			_, _ = pool.Exec(ctx, `
				UPDATE employees
				SET user_id = $1, designation = $2, department_id = $3, updated_at = NOW()
				WHERE id = $4
			`, userID, u.Designation, deptID, existingEmpID)
		}

		// 2c. Seed Sample Attendance for Today so Dashboard Displays Data
		if existingEmpID > 0 {
			today := time.Now().UTC().Format("2006-01-02")
			clockIn := time.Now().UTC().Add(-4 * time.Hour)
			_, _ = pool.Exec(ctx, `
				INSERT INTO attendances (employee_id, date, clock_in, clock_out, total_minutes, status, work_mode, notes)
				VALUES ($1, $2, $3, NULL, 240, 'Present', $4, 'Automated Seed Active Session')
				ON CONFLICT (employee_id, date) DO UPDATE
				SET clock_in = EXCLUDED.clock_in, total_minutes = EXCLUDED.total_minutes;
			`, existingEmpID, today, clockIn, u.WorkMode)
		}
	}

	slog.Info("Seeding completed successfully!", "created", seededCount, "updated", updatedCount, "total_users", len(seedUsers))
	fmt.Printf("\nSUCCESS: Successfully seeded %d users across all 5 roles into PostgreSQL.\n", len(seedUsers))
}
