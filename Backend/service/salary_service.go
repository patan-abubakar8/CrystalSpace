package service

import (
	"context"
	"errors"
	"time"

	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
)

type salaryService struct {
	salaryRepo interfaces.SalaryRepository
}

func NewSalaryService(salaryRepo interfaces.SalaryRepository) interfaces.SalaryService {
	return &salaryService{salaryRepo: salaryRepo}
}

func (s *salaryService) GetByEmployeeID(ctx context.Context, employeeID int) (*models.Salary, error) {
	return s.salaryRepo.GetByEmployeeID(ctx, employeeID)
}

func (s *salaryService) CalculateAndSave(ctx context.Context, employeeID int, req dto.SalaryRequest, revisedBy string) (*models.Salary, error) {
	if req.BasicSalary <= 0 {
		return nil, errors.New("basic salary must be greater than zero")
	}

	// Auto-calculate allowances if omitted
	hra := req.HRA
	if hra <= 0 {
		hra = req.BasicSalary * 0.40 // 40% HRA
	}

	pf := req.ProvidentFund
	if pf <= 0 {
		pf = req.BasicSalary * 0.12 // 12% PF
	}

	gross := req.BasicSalary + hra + req.Conveyance + req.MedicalAllowance + req.SpecialAllowance
	deductions := pf + req.ProfessionalTax + req.TDS
	net := gross - deductions

	var effectiveDate time.Time
	if req.EffectiveDate != "" {
		effectiveDate, _ = time.Parse("2006-01-02", req.EffectiveDate)
	}
	if effectiveDate.IsZero() {
		effectiveDate = time.Now().UTC()
	}

	// Capture previous salary for audit history
	existing, _ := s.salaryRepo.GetByEmployeeID(ctx, employeeID)
	var prevSalary float64
	if existing != nil {
		prevSalary = existing.NetSalary
	}

	salary := &models.Salary{
		EmployeeID:       employeeID,
		BasicSalary:      req.BasicSalary,
		HRA:              hra,
		Conveyance:       req.Conveyance,
		MedicalAllowance: req.MedicalAllowance,
		SpecialAllowance: req.SpecialAllowance,
		ProvidentFund:    pf,
		ProfessionalTax:  req.ProfessionalTax,
		TDS:              req.TDS,
		GrossSalary:      gross,
		NetSalary:        net,
		EffectiveDate:    effectiveDate,
	}

	if err := s.salaryRepo.Upsert(ctx, salary); err != nil {
		return nil, err
	}

	// Record Revision Audit
	if existing != nil && prevSalary != net {
		_ = s.salaryRepo.RecordHistory(ctx, &models.SalaryHistory{
			EmployeeID:     employeeID,
			PreviousSalary: prevSalary,
			NewSalary:      net,
			RevisionReason: req.RevisionReason,
			RevisedBy:      revisedBy,
		})
	}

	return salary, nil
}

func (s *salaryService) GetHistory(ctx context.Context, employeeID int) ([]*models.SalaryHistory, error) {
	return s.salaryRepo.GetHistory(ctx, employeeID)
}
