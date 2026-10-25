package handlers

import (
	"encoding/json"
	"net/http"

	"crystalspace/backend/api/middlewares"
	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
	"crystalspace/backend/pkg/response"

	"github.com/go-chi/chi/v5"
)

type PermissionHandler struct {
	svc interfaces.PermissionService
}

func NewPermissionHandler(svc interfaces.PermissionService) *PermissionHandler {
	return &PermissionHandler{svc: svc}
}

// GetMyPermissions returns the permission matrix for the currently authenticated user's role.
func (h *PermissionHandler) GetMyPermissions(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middlewares.UserContextKey).(*models.UserClaims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Unauthenticated")
		return
	}

	perms, err := h.svc.GetMyPermissions(r.Context(), claims.Role)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, perms, "User permissions fetched successfully")
}

// ListRoles returns all roles and their complete page permission matrices (System Admin).
func (h *PermissionHandler) ListRoles(w http.ResponseWriter, r *http.Request) {
	matrix, err := h.svc.ListRolesWithPermissions(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, matrix, "Roles and permissions retrieved successfully")
}

// UpdatePermissions updates can_view, can_create, can_update, can_delete for a role.
func (h *PermissionHandler) UpdatePermissions(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateRolePermissionsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// If role was passed in URL parameter, ensure it matches
	roleParam := chi.URLParam(r, "name")
	if roleParam != "" {
		req.Role = roleParam
	}

	if err := h.svc.UpdateRolePermissions(r.Context(), req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, nil, "Role permissions updated successfully")
}

// CreateRole adds a new custom role to the system.
func (h *PermissionHandler) CreateRole(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	role, err := h.svc.CreateRole(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, role, "Custom role created successfully")
}

// DeleteRole removes a custom role from the system.
func (h *PermissionHandler) DeleteRole(w http.ResponseWriter, r *http.Request) {
	roleName := chi.URLParam(r, "name")
	if roleName == "" {
		response.Error(w, http.StatusBadRequest, "Missing role name parameter")
		return
	}

	if err := h.svc.DeleteRole(r.Context(), roleName); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, nil, "Role deleted successfully")
}
