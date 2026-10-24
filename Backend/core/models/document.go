package models

import "time"

type EmployeeDocument struct {
	ID           int       `json:"id"`
	EmployeeID   int       `json:"employee_id"`
	DocumentType string    `json:"document_type"`
	FileName     string    `json:"file_name"`
	FilePath     string    `json:"file_path"`
	FileSize     int64     `json:"file_size"`
	UploadedAt   time.Time `json:"uploaded_at"`
}
