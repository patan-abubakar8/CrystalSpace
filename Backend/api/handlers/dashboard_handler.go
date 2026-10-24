package handlers

import (
	"net/http"

	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/pkg/response"
)

type DashboardHandler struct {
	dashboardService interfaces.DashboardService
}

func NewDashboardHandler(dashboardService interfaces.DashboardService) *DashboardHandler {
	return &DashboardHandler{dashboardService: dashboardService}
}

func (h *DashboardHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.dashboardService.GetStats(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, stats, "Dashboard statistics retrieved")
}
