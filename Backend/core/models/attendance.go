package models

import "time"

type AttendanceStatus string

const (
	AttendanceStatusPresent AttendanceStatus = "Present"
	AttendanceStatusLate    AttendanceStatus = "Late"
	AttendanceStatusHalfDay AttendanceStatus = "HalfDay"
	AttendanceStatusAbsent  AttendanceStatus = "Absent"
	AttendanceStatusOnLeave AttendanceStatus = "OnLeave"
)

type WorkMode string

const (
	WorkModeOffice WorkMode = "Office"
	WorkModeRemote WorkMode = "Remote"
	WorkModeField  WorkMode = "Field"
)

// Attendance represents a daily employee attendance record.
type Attendance struct {
	ID             int              `json:"id"`
	EmployeeID     int              `json:"employee_id"`
	EmployeeName   string           `json:"employee_name,omitempty"`
	EmployeeCode   string           `json:"employee_code,omitempty"`
	DepartmentName string           `json:"department_name,omitempty"`
	Date           time.Time        `json:"date"`
	ClockIn        time.Time        `json:"clock_in"`
	ClockOut       *time.Time       `json:"clock_out,omitempty"`
	TotalMinutes   int              `json:"total_minutes"`
	Status         AttendanceStatus `json:"status"`
	WorkMode       WorkMode         `json:"work_mode"`
	Notes          string           `json:"notes,omitempty"`
	CreatedAt      time.Time        `json:"created_at"`
	UpdatedAt      time.Time        `json:"updated_at"`
}

// AttendanceFilter defines criteria for querying attendance records.
type AttendanceFilter struct {
	EmployeeID   int
	DepartmentID int
	FromDate     string
	ToDate       string
	Status       string
	SearchQuery  string
	Page         int
	PageSize     int
}
