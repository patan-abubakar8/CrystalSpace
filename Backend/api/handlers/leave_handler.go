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

type LeaveHandler struct {
	leaveService interfaces.LeaveService
	empService   interfaces.EmployeeService
}

func NewLeaveHandler(leaveService interfaces.LeaveService, empService interfaces.EmployeeService) *LeaveHandler {
	return &LeaveHandler{
		leaveService: leaveService,
		empService:   empService,
	}
}

func (h *LeaveHandler) Apply(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middlewares.UserContextKey).(*models.UserClaims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Unauthenticated")
		return
	}

	var req dto.ApplyLeaveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	// Resolve employee ID from authenticated user
	empIDStr := r.URL.Query().Get("employee_id")
	var empID int
	if empIDStr != "" {
		empID, _ = strconv.Atoi(empIDStr)
	}

	if empID == 0 {
		empList, _, _ := h.empService.List(r.Context(), models.EmployeeFilter{SearchQuery: claims.Email, PageSize: 1})
		if len(empList) > 0 {
			empID = empList[0].ID
		}
	}

	if empID == 0 {
		response.Error(w, http.StatusBadRequest, "No employee record associated with current user")
		return
	}

	leave, err := h.leaveService.Apply(r.Context(), empID, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, leave, "Leave applied successfully")
}

func (h *LeaveHandler) ListMyLeaves(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middlewares.UserContextKey).(*models.UserClaims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Unauthenticated")
		return
	}

	empList, _, _ := h.empService.List(r.Context(), models.EmployeeFilter{SearchQuery: claims.Email, PageSize: 1})
	if len(empList) == 0 {
		response.JSON(w, http.StatusOK, []interface{}{}, "No leaves found")
		return
	}

	leaves, err := h.leaveService.ListMyLeaves(r.Context(), empList[0].ID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, leaves, "Leaves retrieved")
}

func (h *LeaveHandler) ListPending(w http.ResponseWriter, r *http.Request) {
	leaves, err := h.leaveService.ListPending(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, leaves, "Pending leaves retrieved")
}

func (h *LeaveHandler) Review(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middlewares.UserContextKey).(*models.UserClaims)

	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid leave ID")
		return
	}

	var req dto.ReviewLeaveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	if err := h.leaveService.ReviewLeave(r.Context(), id, claims.UserID, req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, nil, "Leave status updated successfully")
}

func (h *LeaveHandler) ListTypes(w http.ResponseWriter, r *http.Request) {
	types, err := h.leaveService.ListLeaveTypes(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, types, "Leave types retrieved")
}

func (h *LeaveHandler) GetBalances(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "employee_id")
	empID, err := strconv.Atoi(idStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid employee ID")
		return
	}

	balances, err := h.leaveService.GetBalances(r.Context(), empID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, balances, "Leave balances retrieved")
}
