package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
	"crystalspace/backend/pkg/security"
)

type employeeService struct {
	empRepo  interfaces.EmployeeRepository
	userRepo interfaces.UserRepository
}

func NewEmployeeService(empRepo interfaces.EmployeeRepository, userRepo interfaces.UserRepository) interfaces.EmployeeService {
	return &employeeService{
		empRepo:  empRepo,
		userRepo: userRepo,
	}
}

func (s *employeeService) Create(ctx context.Context, req dto.CreateEmployeeRequest) (*models.Employee, error) {
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.FirstName == "" || req.LastName == "" {
		return nil, errors.New("first name, last name, and email are required")
	}

	if req.EmployeeCode == "" {
		req.EmployeeCode = fmt.Sprintf("EMP-%d", time.Now().Unix()%100000)
	}

	var userID string
	// Optionally create linked User login credentials
	if req.CreateUserAccount {
		existingUser, _ := s.userRepo.GetByEmail(ctx, req.Email)
		if existingUser != nil {
			userID = existingUser.ID
		} else {
			pass := req.InitialPassword
			if pass == "" {
				pass = "Welcome@123"
			}
			hashedPass, err := security.HashPassword(pass)
			if err != nil {
				return nil, fmt.Errorf("failed to hash password: %w", err)
			}
			role := req.Role
			if role == "" {
				role = "Employee"
			}
			newUser := &models.User{
				Email:        req.Email,
				PasswordHash: hashedPass,
				Role:         role,
				IsActive:     true,
			}
			if err := s.userRepo.Create(ctx, newUser); err != nil {
				return nil, fmt.Errorf("failed to create user account: %w", err)
			}
			userID = newUser.ID
		}
	} else if req.UserID != "" {
		userID = req.UserID
	}

	status := req.Status
	if status == "" {
		status = "Active"
	}
	location := req.OfficeLocation
	if location == "" {
		location = "Headquarters"
	}
	joiningDate := req.DateOfJoining
	if joiningDate.IsZero() {
		joiningDate = time.Now().UTC()
	}

	emp := &models.Employee{
		UserID:         userID,
		FirstName:      req.FirstName,
		LastName:       req.LastName,
		Email:          req.Email,
		PhoneNumber:    req.PhoneNumber,
		Designation:    req.Designation,
		DepartmentID:   req.DepartmentID,
		ManagerID:      req.ManagerID,
		EmployeeCode:   req.EmployeeCode,
		OfficeLocation: location,
		DateOfJoining:  joiningDate,
		Status:         status,
	}

	// Personal Details
	if req.Address != "" || req.City != "" || req.DateOfBirth != nil {
		emp.PersonalDetail = &models.PersonalDetail{
			DateOfBirth:   req.DateOfBirth,
			Gender:        req.Gender,
			MaritalStatus: req.MaritalStatus,
			BloodGroup:    req.BloodGroup,
			Address:       req.Address,
			City:          req.City,
			State:         req.State,
			PostalCode:    req.PostalCode,
			Country:       req.Country,
		}
	}

	// Emergency Contact
	if req.EmergencyContactName != "" {
		emp.EmergencyContact = &models.EmergencyContact{
			ContactName:  req.EmergencyContactName,
			Relationship: req.EmergencyRelation,
			Phone:        req.EmergencyPhone,
		}
	}

	// Professional Detail
	if req.EmploymentType != "" || req.Skills != "" {
		emp.ProfessionalDetail = &models.ProfessionalDetail{
			EmploymentType:       req.EmploymentType,
			WorkMode:             req.WorkMode,
			TotalExperienceYears: req.TotalExperience,
			PreviousEmployer:     req.PreviousEmployer,
			Skills:               req.Skills,
		}
	}

	if err := s.empRepo.Create(ctx, emp); err != nil {
		return nil, err
	}
	return emp, nil
}

func (s *employeeService) GetByID(ctx context.Context, id int) (*models.Employee, error) {
	return s.empRepo.GetByID(ctx, id)
}

func (s *employeeService) List(ctx context.Context, filter models.EmployeeFilter) ([]*models.Employee, int, error) {
	return s.empRepo.List(ctx, filter)
}

func (s *employeeService) Update(ctx context.Context, id int, req dto.UpdateEmployeeRequest) (*models.Employee, error) {
	emp, err := s.empRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.FirstName != "" {
		emp.FirstName = req.FirstName
	}
	if req.LastName != "" {
		emp.LastName = req.LastName
	}
	if req.PhoneNumber != "" {
		emp.PhoneNumber = req.PhoneNumber
	}
	if req.Designation != "" {
		emp.Designation = req.Designation
	}
	if req.DepartmentID > 0 {
		emp.DepartmentID = req.DepartmentID
	}
	if req.ManagerID != nil {
		emp.ManagerID = req.ManagerID
	}
	if req.OfficeLocation != "" {
		emp.OfficeLocation = req.OfficeLocation
	}
	if req.Status != "" {
		emp.Status = req.Status
	}

	if err := s.empRepo.Update(ctx, emp); err != nil {
		return nil, err
	}
	return emp, nil
}

func (s *employeeService) Delete(ctx context.Context, id int) error {
	return s.empRepo.Delete(ctx, id)
}
