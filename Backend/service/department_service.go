package service

import (
	"context"
	"errors"
	"strings"

	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
)

type departmentService struct {
	deptRepo interfaces.DepartmentRepository
}

func NewDepartmentService(deptRepo interfaces.DepartmentRepository) interfaces.DepartmentService {
	return &departmentService{deptRepo: deptRepo}
}

func (s *departmentService) Create(ctx context.Context, req dto.CreateDepartmentRequest) (*models.Department, error) {
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return nil, errors.New("department name is required")
	}
	code := strings.TrimSpace(strings.ToUpper(req.Code))
	if code == "" {
		if len(name) >= 3 {
			code = strings.ToUpper(name[:3])
		} else {
			code = "DEP"
		}
	}

	dept := &models.Department{
		Name:        name,
		Description: req.Description,
		Code:        code,
		ManagerID:   req.ManagerID,
	}

	if err := s.deptRepo.Create(ctx, dept); err != nil {
		return nil, err
	}
	return dept, nil
}

func (s *departmentService) GetByID(ctx context.Context, id int) (*models.Department, error) {
	return s.deptRepo.GetByID(ctx, id)
}

func (s *departmentService) List(ctx context.Context) ([]*models.Department, error) {
	return s.deptRepo.List(ctx)
}

func (s *departmentService) Update(ctx context.Context, id int, req dto.UpdateDepartmentRequest) (*models.Department, error) {
	dept, err := s.deptRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Name != "" {
		dept.Name = strings.TrimSpace(req.Name)
	}
	if req.Description != "" {
		dept.Description = req.Description
	}
	if req.Code != "" {
		dept.Code = strings.TrimSpace(strings.ToUpper(req.Code))
	}
	if req.ManagerID != nil {
		dept.ManagerID = req.ManagerID
	}

	if err := s.deptRepo.Update(ctx, dept); err != nil {
		return nil, err
	}
	return dept, nil
}

func (s *departmentService) Delete(ctx context.Context, id int) error {
	return s.deptRepo.Delete(ctx, id)
}
