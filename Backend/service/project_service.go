package service

import (
	"context"
	"errors"
	"strings"

	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
)

type projectService struct {
	projRepo interfaces.ProjectRepository
}

func NewProjectService(projRepo interfaces.ProjectRepository) interfaces.ProjectService {
	return &projectService{projRepo: projRepo}
}

func (s *projectService) CreateProject(ctx context.Context, req dto.CreateProjectRequest) (*models.Project, error) {
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return nil, errors.New("project name is required")
	}

	status := models.ProjectStatus(req.Status)
	if status == "" {
		status = models.ProjectStatusPlanning
	}

	p := &models.Project{
		Name:        name,
		Description: req.Description,
		StartDate:   req.StartDate,
		EndDate:     req.EndDate,
		Status:      status,
	}

	if err := s.projRepo.CreateProject(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *projectService) ListProjects(ctx context.Context) ([]*models.Project, error) {
	return s.projRepo.ListProjects(ctx)
}

func (s *projectService) CreateTask(ctx context.Context, req dto.CreateTaskRequest) (*models.TaskItem, error) {
	title := strings.TrimSpace(req.Title)
	if title == "" {
		return nil, errors.New("task title is required")
	}

	priority := req.Priority
	if priority == "" {
		priority = "Medium"
	}

	t := &models.TaskItem{
		ProjectID:            req.ProjectID,
		Title:                title,
		Description:          req.Description,
		Status:               models.TaskStatusTodo,
		Priority:             priority,
		AssignedToEmployeeID: req.AssignedToEmployeeID,
		DueDate:              req.DueDate,
	}

	if err := s.projRepo.CreateTask(ctx, t); err != nil {
		return nil, err
	}
	return t, nil
}

func (s *projectService) ListTasks(ctx context.Context, projectID int) ([]*models.TaskItem, error) {
	return s.projRepo.ListTasksByProject(ctx, projectID)
}

func (s *projectService) UpdateTaskStatus(ctx context.Context, taskID int, status models.TaskStatus) error {
	return s.projRepo.UpdateTaskStatus(ctx, taskID, status)
}
