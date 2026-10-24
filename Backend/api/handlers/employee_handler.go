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

type EmployeeHandler struct {
	empService interfaces.EmployeeService
}

func NewEmployeeHandler(empService interfaces.EmployeeService) *EmployeeHandler {
	return &EmployeeHandler{empService: empService}
}

func (h *EmployeeHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	page, _ := strconv.Atoi(q.Get("page"))
	pageSize, _ := strconv.Atoi(q.Get("page_size"))

	filter := models.EmployeeFilter{
		Status:         q.Get("status"),
		SearchQuery:    q.Get("search"),
		OfficeLocation: q.Get("location"),
		Page:           page,
		PageSize:       pageSize,
	}

	if deptIDStr := q.Get("department_id"); deptIDStr != "" {
		if id, err := strconv.Atoi(deptIDStr); err == nil {
			filter.DepartmentID = &id
		}
	}

	employees, total, err := h.empService.List(r.Context(), filter)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    employees,
		"meta": map[string]interface{}{
			"page":       filter.Page,
			"page_size":  filter.PageSize,
			"total":      total,
			"total_page": (total + filter.PageSize - 1) / filter.PageSize,
		},
		"message": "Employees retrieved successfully",
	})
}

func (h *EmployeeHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid employee ID")
		return
	}

	emp, err := h.empService.GetByID(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusNotFound, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, emp, "Employee retrieved")
}

func (h *EmployeeHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateEmployeeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid employee payload")
		return
	}

	emp, err := h.empService.Create(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, emp, "Employee created successfully")
}

func (h *EmployeeHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid employee ID")
		return
	}

	var req dto.UpdateEmployeeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid update payload")
		return
	}

	emp, err := h.empService.Update(r.Context(), id, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, emp, "Employee updated successfully")
}

func (h *EmployeeHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid employee ID")
		return
	}

	if err := h.empService.Delete(r.Context(), id); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, nil, "Employee deleted successfully")
}
