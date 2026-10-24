package service

import (
	"context"
	"errors"
	"fmt"

	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
)

type leaveService struct {
	leaveRepo interfaces.LeaveRepository
}

func NewLeaveService(leaveRepo interfaces.LeaveRepository) interfaces.LeaveService {
	return &leaveService{leaveRepo: leaveRepo}
}

func (s *leaveService) Apply(ctx context.Context, employeeID int, req dto.ApplyLeaveRequest) (*models.Leave, error) {
	if req.LeaveTypeID <= 0 {
		return nil, errors.New("valid leave type is required")
	}

	if req.EndDate.Before(req.StartDate) {
		return nil, errors.New("end date cannot be before start date")
	}

	days := req.TotalDays
	if days <= 0 {
		diff := req.EndDate.Sub(req.StartDate)
		days = float64(int(diff.Hours()/24)) + 1
	}

	// Balance verification
	balances, err := s.leaveRepo.GetBalances(ctx, employeeID)
	if err == nil {
		for _, b := range balances {
			if b.LeaveTypeID == req.LeaveTypeID {
				if b.BalanceDays < days {
					return nil, fmt.Errorf("insufficient leave balance: requested %.1f days, but only %.1f days remaining", days, b.BalanceDays)
				}
				break
			}
		}
	}

	leave := &models.Leave{
		EmployeeID:  employeeID,
		LeaveTypeID: req.LeaveTypeID,
		StartDate:   req.StartDate,
		EndDate:     req.EndDate,
		TotalDays:   days,
		Reason:      req.Reason,
		Status:      models.LeaveStatusPending,
	}

	if err := s.leaveRepo.Create(ctx, leave); err != nil {
		return nil, err
	}
	return leave, nil
}

func (s *leaveService) ListMyLeaves(ctx context.Context, employeeID int) ([]*models.Leave, error) {
	return s.leaveRepo.ListByEmployeeID(ctx, employeeID)
}

func (s *leaveService) ListPending(ctx context.Context) ([]*models.Leave, error) {
	return s.leaveRepo.ListPending(ctx)
}

func (s *leaveService) ReviewLeave(ctx context.Context, id int, reviewerID string, req dto.ReviewLeaveRequest) error {
	if req.Status != models.LeaveStatusApproved && req.Status != models.LeaveStatusRejected {
		return errors.New("status must be either Approved or Rejected")
	}

	if req.Status == models.LeaveStatusRejected && req.RejectionReason == "" {
		return errors.New("rejection reason is mandatory when rejecting leave")
	}

	return s.leaveRepo.UpdateStatus(ctx, id, req.Status, reviewerID, req.RejectionReason)
}

func (s *leaveService) ListLeaveTypes(ctx context.Context) ([]*models.LeaveType, error) {
	return s.leaveRepo.ListLeaveTypes(ctx)
}

func (s *leaveService) GetBalances(ctx context.Context, employeeID int) ([]*models.LeaveBalance, error) {
	return s.leaveRepo.GetBalances(ctx, employeeID)
}
