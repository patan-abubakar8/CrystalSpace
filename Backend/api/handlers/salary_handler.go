package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"crystalspace/backend/api/middlewares"
	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
	"crystalspace/backend/pkg/response"

	"github.com/go-chi/chi/v5"
)

type SalaryHandler struct {
	salaryService interfaces.SalaryService
}

func NewSalaryHandler(salaryService interfaces.SalaryService) *SalaryHandler {
	return &SalaryHandler{salaryService: salaryService}
}

func (h *SalaryHandler) GetByEmployeeID(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "employee_id")
	empID, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid employee ID")
		return
	}

	salary, err := h.salaryService.GetByEmployeeID(r.Context(), empID)
	if err != nil {
		response.Error(w, http.StatusNotFound, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, salary, "Salary details retrieved")
}

func (h *SalaryHandler) Save(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middlewares.UserContextKey).(*models.UserClaims)

	idStr := chi.URLParam(r, "employee_id")
	empID, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid employee ID")
		return
	}

	var req dto.SalaryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	salary, err := h.salaryService.CalculateAndSave(r.Context(), empID, req, claims.UserID)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, salary, "Salary structure updated")
}

func (h *SalaryHandler) GetHistory(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "employee_id")
	empID, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid employee ID")
		return
	}

	histories, err := h.salaryService.GetHistory(r.Context(), empID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, histories, "Salary history retrieved")
}
