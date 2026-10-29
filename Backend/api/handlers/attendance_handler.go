package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"crystalspace/backend/api/middlewares"
	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
	"crystalspace/backend/pkg/response"
)

type AttendanceHandler struct {
	attService interfaces.AttendanceService
	empService interfaces.EmployeeService
}

func NewAttendanceHandler(attService interfaces.AttendanceService, empService interfaces.EmployeeService) *AttendanceHandler {
	return &AttendanceHandler{
		attService: attService,
		empService: empService,
	}
}

// resolveEmployeeID gets the employee ID corresponding to the authenticated user claims.
func (h *AttendanceHandler) resolveEmployeeID(r *http.Request, claims *models.UserClaims) int {
	// Look up employee by user email or user ID
	empList, _, err := h.empService.List(r.Context(), models.EmployeeFilter{
		SearchQuery: claims.Email,
		PageSize:    1,
	})
	if err == nil && len(empList) > 0 {
		return empList[0].ID
	}

	// Auto-provision minimal employee record for authenticated user if missing
	nameParts := strings.Split(claims.Email, "@")
	firstName := "User"
	if len(nameParts) > 0 && nameParts[0] != "" {
		firstName = strings.Title(nameParts[0])
	}
	emp, err := h.empService.Create(r.Context(), dto.CreateEmployeeRequest{
		FirstName:      firstName,
		LastName:       claims.Role,
		Email:          claims.Email,
		Designation:    claims.Role,
		DepartmentID:   1,
		OfficeLocation: "Headquarters",
	})
	if err == nil && emp != nil {
		return emp.ID
	}

	return 0
}

func (h *AttendanceHandler) canViewAll(role string) bool {
	return role == "SuperAdmin" || role == "Admin" || role == "HR" || role == "Manager"
}

// Punch handles clocking in or clocking out.
func (h *AttendanceHandler) Punch(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middlewares.UserContextKey).(*models.UserClaims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Unauthenticated")
		return
	}

	empID := h.resolveEmployeeID(r, claims)
	if empID == 0 {
		response.Error(w, http.StatusBadRequest, "No employee record associated with current account")
		return
	}

	var req dto.PunchRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	att, err := h.attService.Punch(r.Context(), empID, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, att, "Attendance timestamp registered successfully")
}

// GetToday returns the active timer and today's status for the logged-in user.
func (h *AttendanceHandler) GetToday(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middlewares.UserContextKey).(*models.UserClaims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Unauthenticated")
		return
	}

	empID := h.resolveEmployeeID(r, claims)
	if empID == 0 {
		// Return empty today state without error so UI still loads gracefully
		response.JSON(w, http.StatusOK, &dto.AttendanceTodayResponse{
			IsClockedIn:   false,
			ActiveSeconds: 0,
			CanPunch:      false,
		}, "No employee profile found")
		return
	}

	today, err := h.attService.GetToday(r.Context(), empID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, today, "Today's attendance status retrieved")
}

// GetHeatmap returns GitHub-style contribution cells for attendance.
func (h *AttendanceHandler) GetHeatmap(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middlewares.UserContextKey).(*models.UserClaims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Unauthenticated")
		return
	}

	targetEmpID := 0
	empIDParam := r.URL.Query().Get("employee_id")
	if empIDParam != "" && h.canViewAll(claims.Role) {
		targetEmpID, _ = strconv.Atoi(empIDParam)
	}

	if targetEmpID == 0 {
		targetEmpID = h.resolveEmployeeID(r, claims)
	}

	if targetEmpID == 0 {
		response.JSON(w, http.StatusOK, []dto.HeatmapCell{}, "No employee record found")
		return
	}

	months := 3
	if mParam := r.URL.Query().Get("months"); mParam != "" {
		if m, err := strconv.Atoi(mParam); err == nil && m > 0 {
			months = m
		}
	}

	cells, err := h.attService.GetHeatmap(r.Context(), targetEmpID, months)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, cells, "Attendance heatmap retrieved")
}

// GetSummary returns attendance analytics and graph data.
func (h *AttendanceHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middlewares.UserContextKey).(*models.UserClaims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Unauthenticated")
		return
	}

	targetEmpID := 0
	empIDParam := r.URL.Query().Get("employee_id")
	if empIDParam != "" && h.canViewAll(claims.Role) {
		targetEmpID, _ = strconv.Atoi(empIDParam)
	}

	if targetEmpID == 0 {
		targetEmpID = h.resolveEmployeeID(r, claims)
	}

	if targetEmpID == 0 {
		response.JSON(w, http.StatusOK, &dto.AttendanceSummaryResponse{}, "No employee record found")
		return
	}

	days := 30
	if dParam := r.URL.Query().Get("days"); dParam != "" {
		if d, err := strconv.Atoi(dParam); err == nil && d > 0 {
			days = d
		}
	}

	summary, err := h.attService.GetSummary(r.Context(), targetEmpID, days)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, summary, "Attendance summary retrieved")
}

// List returns attendance records. Admins see all; regular employees only see their own.
func (h *AttendanceHandler) List(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middlewares.UserContextKey).(*models.UserClaims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Unauthenticated")
		return
	}

	q := r.URL.Query()
	page, _ := strconv.Atoi(q.Get("page"))
	pageSize, _ := strconv.Atoi(q.Get("page_size"))

	filter := models.AttendanceFilter{
		FromDate:    q.Get("from"),
		ToDate:      q.Get("to"),
		Status:      q.Get("status"),
		SearchQuery: q.Get("query"),
		Page:        page,
		PageSize:    pageSize,
	}

	if deptID, _ := strconv.Atoi(q.Get("department_id")); deptID > 0 {
		filter.DepartmentID = deptID
	}

	if h.canViewAll(claims.Role) {
		if empID, _ := strconv.Atoi(q.Get("employee_id")); empID > 0 {
			filter.EmployeeID = empID
		}
	} else {
		callerEmpID := h.resolveEmployeeID(r, claims)
		filter.EmployeeID = callerEmpID
	}

	records, total, err := h.attService.ListRecords(r.Context(), filter)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	totalPages := 1
	if filter.PageSize > 0 && total > 0 {
		totalPages = (total + filter.PageSize - 1) / filter.PageSize
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    records,
		"meta": map[string]interface{}{
			"page":       filter.Page,
			"page_size":  filter.PageSize,
			"total":      total,
			"total_page": totalPages,
		},
		"message": "Attendance records retrieved",
	})
}

// GetOrgOverview returns organization-level today's attendance stats for Admin/HR.
func (h *AttendanceHandler) GetOrgOverview(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middlewares.UserContextKey).(*models.UserClaims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Unauthenticated")
		return
	}

	if !h.canViewAll(claims.Role) {
		response.Error(w, http.StatusForbidden, "Unauthorized to view organization overview")
		return
	}

	overview, err := h.attService.GetTodayOverview(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, overview, "Organization attendance overview retrieved")
}
