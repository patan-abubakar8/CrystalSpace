package models

import "time"

type LeaveStatus string

const (
	LeaveStatusPending  LeaveStatus = "Pending"
	LeaveStatusApproved LeaveStatus = "Approved"
	LeaveStatusRejected LeaveStatus = "Rejected"
)

// Leave represents a leave request.
type Leave struct {
	ID              int         `json:"id"`
	EmployeeID      int         `json:"employee_id"`
	EmployeeName    string      `json:"employee_name,omitempty"`
	LeaveTypeID     int         `json:"leave_type_id"`
	LeaveTypeName   string      `json:"leave_type_name,omitempty"`
	StartDate       time.Time   `json:"start_date"`
	EndDate         time.Time   `json:"end_date"`
	TotalDays       float64     `json:"total_days"`
	Reason          string      `json:"reason"`
	Status          LeaveStatus `json:"status"`
	AppliedAt       time.Time   `json:"applied_at"`
	ReviewedAt      *time.Time  `json:"reviewed_at,omitempty"`
	ReviewedByID    *string     `json:"reviewed_by_id,omitempty"`
	RejectionReason string      `json:"rejection_reason,omitempty"`
}

type LeaveType struct {
	ID           int     `json:"id"`
	Name         string  `json:"name"`
	DefaultDays  float64 `json:"default_days"`
	Description  string  `json:"description,omitempty"`
}

type LeaveBalance struct {
	LeaveTypeID int     `json:"leave_type_id"`
	TypeName    string  `json:"type_name"`
	TotalDays   float64 `json:"total_days"`
	UsedDays    float64 `json:"used_days"`
	BalanceDays float64 `json:"balance_days"`
}
