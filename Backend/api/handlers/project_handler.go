package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
	"crystalspace/backend/pkg/response"

	"github.com/go-chi/chi/v5"
)

type ProjectHandler struct {
	projService interfaces.ProjectService
}

func NewProjectHandler(projService interfaces.ProjectService) *ProjectHandler {
	return &ProjectHandler{projService: projService}
}

func (h *ProjectHandler) ListProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := h.projService.ListProjects(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, projects, "Projects retrieved successfully")
}

func (h *ProjectHandler) CreateProject(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	p, err := h.projService.CreateProject(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, p, "Project created successfully")
}

func (h *ProjectHandler) ListTasks(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	projectID, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid project ID")
		return
	}

	tasks, err := h.projService.ListTasks(r.Context(), projectID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, tasks, "Tasks retrieved")
}

func (h *ProjectHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	task, err := h.projService.CreateTask(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, task, "Task created successfully")
}

func (h *ProjectHandler) UpdateTaskStatus(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "task_id")
	taskID, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid task ID")
		return
	}

	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	if err := h.projService.UpdateTaskStatus(r.Context(), taskID, models.TaskStatus(body.Status)); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, nil, "Task status updated")
}
