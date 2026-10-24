package models

import "time"

type ProjectStatus string

const (
	ProjectStatusPlanning  ProjectStatus = "Planning"
	ProjectStatusActive    ProjectStatus = "Active"
	ProjectStatusOnHold    ProjectStatus = "OnHold"
	ProjectStatusCompleted ProjectStatus = "Completed"
	ProjectStatusCancelled ProjectStatus = "Cancelled"
)

type TaskStatus string

const (
	TaskStatusBacklog    TaskStatus = "Backlog"
	TaskStatusTodo       TaskStatus = "Todo"
	TaskStatusInProgress TaskStatus = "InProgress"
	TaskStatusReview     TaskStatus = "Review"
	TaskStatusDone       TaskStatus = "Done"
)

type Project struct {
	ID          int           `json:"id"`
	Name        string        `json:"name"`
	Description string        `json:"description,omitempty"`
	StartDate   time.Time     `json:"start_date"`
	EndDate     *time.Time    `json:"end_date,omitempty"`
	Status      ProjectStatus `json:"status"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

type TaskItem struct {
	ID                   int        `json:"id"`
	ProjectID            int        `json:"project_id"`
	ProjectName          string     `json:"project_name,omitempty"`
	Title                string     `json:"title"`
	Description          string     `json:"description,omitempty"`
	Status               TaskStatus `json:"status"`
	Priority             string     `json:"priority"` // Low, Medium, High, Urgent
	AssignedToEmployeeID *int       `json:"assigned_to_employee_id,omitempty"`
	AssigneeName         string     `json:"assignee_name,omitempty"`
	DueDate              *time.Time `json:"due_date,omitempty"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`
}
