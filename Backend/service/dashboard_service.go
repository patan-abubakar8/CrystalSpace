package service

import (
	"context"

	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
)

type dashboardService struct {
	empRepo   interfaces.EmployeeRepository
	leaveRepo interfaces.LeaveRepository
	deptRepo  interfaces.DepartmentRepository
	projRepo  interfaces.ProjectRepository
}

func NewDashboardService(
	empRepo interfaces.EmployeeRepository,
	leaveRepo interfaces.LeaveRepository,
	deptRepo interfaces.DepartmentRepository,
	projRepo interfaces.ProjectRepository,
) interfaces.DashboardService {
	return &dashboardService{
		empRepo:   empRepo,
		leaveRepo: leaveRepo,
		deptRepo:  deptRepo,
		projRepo:  projRepo,
	}
}

func (s *dashboardService) GetStats(ctx context.Context) (*dto.DashboardStats, error) {
	totalEmps, _ := s.empRepo.Count(ctx)
	activeLeaves, _ := s.leaveRepo.CountActive(ctx)
	depts, _ := s.deptRepo.List(ctx)
	projs, _ := s.projRepo.ListProjects(ctx)

	return &dto.DashboardStats{
		TotalEmployees:   totalEmps,
		ActiveLeaves:     activeLeaves,
		TotalDepartments: len(depts),
		TotalProjects:    len(projs),
	}, nil
}
