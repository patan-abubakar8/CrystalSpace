package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"crystalspace/backend/api/middlewares"
	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
	"crystalspace/backend/pkg/response"
	"crystalspace/backend/service"

	"github.com/go-chi/chi/v5"
)

type EmployeeOnboardingHandler struct {
	svc interfaces.EmployeeOnboardingService
}

func NewEmployeeOnboardingHandler(svc interfaces.EmployeeOnboardingService) *EmployeeOnboardingHandler {
	return &EmployeeOnboardingHandler{svc: svc}
}

func actorFromRequest(r *http.Request) models.Actor {
	claims, _ := r.Context().Value(middlewares.UserContextKey).(*models.UserClaims)
	if claims == nil {
		return models.Actor{}
	}
	return models.Actor{UserID: claims.UserID, Email: claims.Email, Role: claims.Role}
}

func writeOnboardingError(w http.ResponseWriter, err error) {
	var validationErr *service.DraftValidationError
	switch {
	case errors.As(err, &validationErr):
		response.JSON(w, http.StatusUnprocessableEntity, validationErr.Validation, "Draft validation failed")
	case errors.Is(err, service.ErrDraftForbidden):
		response.Error(w, http.StatusForbidden, err.Error())
	case errors.Is(err, service.ErrDraftConflict), errors.Is(err, interfaces.ErrVersionConflict):
		response.Error(w, http.StatusConflict, err.Error())
	default:
		response.Error(w, http.StatusBadRequest, err.Error())
	}
}

func draftIDFromRequest(r *http.Request) (int, bool) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id <= 0 {
		return 0, false
	}
	return id, true
}

func (h *EmployeeOnboardingHandler) ReferenceData(w http.ResponseWriter, r *http.Request) {
	data, err := h.svc.ReferenceData(r.Context(), actorFromRequest(r))
	if err != nil {
		writeOnboardingError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data, "Onboarding reference data retrieved")
}

func (h *EmployeeOnboardingHandler) ListDrafts(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	page, _ := strconv.Atoi(q.Get("page"))
	pageSize, _ := strconv.Atoi(q.Get("page_size"))
	filter := models.EmployeeDraftFilter{
		Search:   q.Get("search"),
		Status:   q.Get("status"),
		Page:     page,
		PageSize: pageSize,
	}
	drafts, total, err := h.svc.ListDrafts(r.Context(), actorFromRequest(r), filter)
	if err != nil {
		writeOnboardingError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]interface{}{
		"items":     drafts,
		"total":     total,
		"page":      max(page, 1),
		"page_size": pageSize,
	}, "Employee drafts retrieved")
}

func (h *EmployeeOnboardingHandler) CreateDraft(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateEmployeeDraftRequest
	_ = json.NewDecoder(r.Body).Decode(&req)
	result, err := h.svc.CreateDraft(r.Context(), actorFromRequest(r), req)
	if err != nil {
		writeOnboardingError(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, result, "Onboarding draft started")
}

func (h *EmployeeOnboardingHandler) GetDraft(w http.ResponseWriter, r *http.Request) {
	id, ok := draftIDFromRequest(r)
	if !ok {
		response.Error(w, http.StatusBadRequest, "Invalid draft ID")
		return
	}
	result, err := h.svc.GetDraft(r.Context(), actorFromRequest(r), id)
	if err != nil {
		writeOnboardingError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, result, "Draft retrieved")
}

func (h *EmployeeOnboardingHandler) SaveSection(w http.ResponseWriter, r *http.Request) {
	id, ok := draftIDFromRequest(r)
	if !ok {
		response.Error(w, http.StatusBadRequest, "Invalid draft ID")
		return
	}
	var req dto.SaveDraftSectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid section payload")
		return
	}
	result, err := h.svc.SaveSection(r.Context(), actorFromRequest(r), id, chi.URLParam(r, "section"), req)
	if err != nil {
		writeOnboardingError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, result, "Draft saved")
}

func (h *EmployeeOnboardingHandler) UpdateDraft(w http.ResponseWriter, r *http.Request) {
	id, ok := draftIDFromRequest(r)
	if !ok {
		response.Error(w, http.StatusBadRequest, "Invalid draft ID")
		return
	}
	var req dto.UpdateDraftRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid draft payload")
		return
	}
	result, err := h.svc.UpdateDraft(r.Context(), actorFromRequest(r), id, req)
	if err != nil {
		writeOnboardingError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, result, "Draft updated")
}

func (h *EmployeeOnboardingHandler) DeleteDraft(w http.ResponseWriter, r *http.Request) {
	id, ok := draftIDFromRequest(r)
	if !ok {
		response.Error(w, http.StatusBadRequest, "Invalid draft ID")
		return
	}
	if err := h.svc.DeleteDraft(r.Context(), actorFromRequest(r), id); err != nil {
		writeOnboardingError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, nil, "Draft discarded")
}

func (h *EmployeeOnboardingHandler) ValidateDraft(w http.ResponseWriter, r *http.Request) {
	id, ok := draftIDFromRequest(r)
	if !ok {
		response.Error(w, http.StatusBadRequest, "Invalid draft ID")
		return
	}
	validation, err := h.svc.ValidateDraft(r.Context(), actorFromRequest(r), id)
	if err != nil {
		writeOnboardingError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, validation, "Draft validated")
}

func (h *EmployeeOnboardingHandler) SubmitDraft(w http.ResponseWriter, r *http.Request) {
	id, ok := draftIDFromRequest(r)
	if !ok {
		response.Error(w, http.StatusBadRequest, "Invalid draft ID")
		return
	}
	var req models.SubmitDraftRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid submission payload")
		return
	}
	result, err := h.svc.SubmitDraft(r.Context(), actorFromRequest(r), id, req)
	if err != nil {
		writeOnboardingError(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, result, "Employee submitted successfully")
}

func (h *EmployeeOnboardingHandler) History(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id <= 0 {
		response.Error(w, http.StatusBadRequest, "Invalid employee ID")
		return
	}
	logs, err := h.svc.History(r.Context(), actorFromRequest(r), id)
	if err != nil {
		writeOnboardingError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, logs, "Employee history retrieved")
}

func (h *EmployeeOnboardingHandler) Extras(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id <= 0 {
		response.Error(w, http.StatusBadRequest, "Invalid employee ID")
		return
	}
	extras, err := h.svc.Extras(r.Context(), actorFromRequest(r), id)
	if err != nil {
		writeOnboardingError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, extras, "Employee profile details retrieved")
}
