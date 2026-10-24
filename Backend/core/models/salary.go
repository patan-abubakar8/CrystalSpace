package models

import "time"

// Salary represents an employee compensation breakdown.
type Salary struct {
	ID               int       `json:"id"`
	EmployeeID       int       `json:"employee_id"`
	BasicSalary      float64   `json:"basic_salary"`
	HRA              float64   `json:"hra"`
	Conveyance       float64   `json:"conveyance"`
	MedicalAllowance float64   `json:"medical_allowance"`
	SpecialAllowance float64   `json:"special_allowance"`
	ProvidentFund    float64   `json:"provident_fund"`
	ProfessionalTax  float64   `json:"professional_tax"`
	TDS              float64   `json:"tds"`
	GrossSalary      float64   `json:"gross_salary"`
	NetSalary        float64   `json:"net_salary"`
	EffectiveDate    time.Time `json:"effective_date"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type SalaryHistory struct {
	ID             int       `json:"id"`
	EmployeeID     int       `json:"employee_id"`
	PreviousSalary float64   `json:"previous_salary"`
	NewSalary      float64   `json:"new_salary"`
	RevisionReason string    `json:"revision_reason"`
	RevisedBy      string    `json:"revised_by"`
	RevisedAt      time.Time `json:"revised_at"`
}
