package service

import (
	"context"
	"errors"
	"fmt"
	"math"
	"time"

	"crystalspace/backend/core/dto"
	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
)

type attendanceService struct {
	attRepo interfaces.AttendanceRepository
}

func NewAttendanceService(attRepo interfaces.AttendanceRepository) interfaces.AttendanceService {
	return &attendanceService{attRepo: attRepo}
}

func (s *attendanceService) Punch(ctx context.Context, employeeID int, req dto.PunchRequest) (*models.Attendance, error) {
	now := time.Now().UTC()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)

	existing, err := s.attRepo.GetTodayByEmployeeID(ctx, employeeID, today)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing attendance: %w", err)
	}

	mode := models.WorkModeOffice
	if req.WorkMode != "" {
		mode = models.WorkMode(req.WorkMode)
	}

	// Determine action
	action := req.Action
	if action == "toggle" || action == "" {
		if existing == nil {
			action = "in"
		} else if existing.ClockOut == nil {
			action = "out"
		} else {
			// Already clocked out today - allow re-punching in (update / re-open)
			action = "in"
		}
	}

	if action == "in" {
		// Calculate initial status based on arrival time (Standard 9:30 AM cutoff)
		status := models.AttendanceStatusPresent
		// Check hour/minute in local or standard work time
		if now.Hour() > 9 || (now.Hour() == 9 && now.Minute() > 30) {
			status = models.AttendanceStatusLate
		}

		att := &models.Attendance{
			EmployeeID: employeeID,
			Date:       today,
			ClockIn:    now,
			Status:     status,
			WorkMode:   mode,
			Notes:      req.Notes,
		}

		if err := s.attRepo.PunchIn(ctx, att); err != nil {
			return nil, err
		}
		return att, nil
	}

	if action == "out" {
		if existing == nil {
			return nil, errors.New("cannot clock out without clocking in first")
		}

		totalMinutes := int(now.Sub(existing.ClockIn).Minutes())
		if totalMinutes < 0 {
			totalMinutes = 0
		}

		status := existing.Status
		if totalMinutes < 240 { // Less than 4 hours is HalfDay
			status = models.AttendanceStatusHalfDay
		}

		if err := s.attRepo.PunchOut(ctx, existing.ID, now, totalMinutes, status, req.Notes); err != nil {
			return nil, err
		}

		existing.ClockOut = &now
		existing.TotalMinutes = totalMinutes
		existing.Status = status
		return existing, nil
	}

	return nil, fmt.Errorf("invalid punch action: %s", action)
}

func (s *attendanceService) GetToday(ctx context.Context, employeeID int) (*dto.AttendanceTodayResponse, error) {
	now := time.Now().UTC()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)

	att, err := s.attRepo.GetTodayByEmployeeID(ctx, employeeID, today)
	if err != nil {
		return nil, err
	}

	resp := &dto.AttendanceTodayResponse{
		TodayDate: today.Format("2006-01-02"),
		CanPunch:  true,
	}

	if att != nil {
		resp.Attendance = att
		if att.ClockOut == nil {
			resp.IsClockedIn = true
			resp.ActiveSeconds = int64(now.Sub(att.ClockIn).Seconds())
			if resp.ActiveSeconds < 0 {
				resp.ActiveSeconds = 0
			}
		} else {
			resp.IsClockedIn = false
			resp.ActiveSeconds = int64(att.TotalMinutes * 60)
		}
	} else {
		resp.IsClockedIn = false
		resp.ActiveSeconds = 0
	}

	return resp, nil
}

func (s *attendanceService) GetHeatmap(ctx context.Context, employeeID int, months int) ([]dto.HeatmapCell, error) {
	if months <= 0 {
		months = 3 // Default past 3 months for crisp grid
	}
	if months > 12 {
		months = 12
	}

	now := time.Now().UTC()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	startDate := today.AddDate(0, -months, 0)

	// Align startDate to Monday for clean GitHub-style grid alignment
	for startDate.Weekday() != time.Monday {
		startDate = startDate.AddDate(0, 0, -1)
	}

	records, err := s.attRepo.GetRangeByEmployee(ctx, employeeID, startDate, today)
	if err != nil {
		return nil, err
	}

	recordMap := make(map[string]*models.Attendance)
	for _, r := range records {
		dStr := r.Date.Format("2006-01-02")
		recordMap[dStr] = r
	}

	var cells []dto.HeatmapCell
	curr := startDate

	for !curr.After(today) {
		dStr := curr.Format("2006-01-02")
		isWeekend := curr.Weekday() == time.Saturday || curr.Weekday() == time.Sunday

		cell := dto.HeatmapCell{
			Date:       dStr,
			TotalHours: 0,
			Level:      0,
			Status:     "Weekend",
		}

		if !isWeekend {
			cell.Status = "Absent"
		}

		if rec, found := recordMap[dStr]; found {
			hours := float64(rec.TotalMinutes) / 60.0
			// If clocked in today without clock_out yet, compute elapsed hours
			if rec.ClockOut == nil && dStr == today.Format("2006-01-02") {
				hours = math.Round((float64(time.Now().UTC().Sub(rec.ClockIn).Minutes())/60.0)*10) / 10
			}

			cell.TotalHours = math.Round(hours*100) / 100
			cell.Status = string(rec.Status)
			cell.ClockIn = rec.ClockIn.Format("03:04 PM")
			if rec.ClockOut != nil {
				cell.ClockOut = rec.ClockOut.Format("03:04 PM")
			}
			cell.WorkMode = string(rec.WorkMode)

			// Determine intensity level (0 to 4)
			if hours <= 0 {
				cell.Level = 0
			} else if hours < 4.0 {
				cell.Level = 1 // Half day or short
			} else if hours < 7.5 {
				cell.Level = 2 // Medium
			} else if hours <= 8.5 {
				cell.Level = 3 // Standard full day
			} else {
				cell.Level = 4 // Overtime
			}
		}

		cells = append(cells, cell)
		curr = curr.AddDate(0, 0, 1)
	}

	return cells, nil
}

func (s *attendanceService) GetSummary(ctx context.Context, employeeID int, days int) (*dto.AttendanceSummaryResponse, error) {
	if days <= 0 {
		days = 30
	}

	now := time.Now().UTC()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	startDate := today.AddDate(0, 0, -days)

	records, err := s.attRepo.GetRangeByEmployee(ctx, employeeID, startDate, today)
	if err != nil {
		return nil, err
	}

	recordMap := make(map[string]*models.Attendance)
	for _, r := range records {
		dStr := r.Date.Format("2006-01-02")
		recordMap[dStr] = r
	}

	var workDaysCount, presentDays, lateDays int
	var totalMinutes int
	var overtimeMinutes int
	var dailyTrends []dto.HeatmapCell

	curr := startDate
	for !curr.After(today) {
		dStr := curr.Format("2006-01-02")
		isWeekend := curr.Weekday() == time.Saturday || curr.Weekday() == time.Sunday

		if !isWeekend {
			workDaysCount++
		}

		cell := dto.HeatmapCell{
			Date:       dStr,
			TotalHours: 0,
			Level:      0,
			Status:     "Weekend",
		}
		if !isWeekend {
			cell.Status = "Absent"
		}

		if rec, found := recordMap[dStr]; found {
			hours := float64(rec.TotalMinutes) / 60.0
			totalMinutes += rec.TotalMinutes

			if rec.TotalMinutes > 480 { // Greater than 8 hours
				overtimeMinutes += (rec.TotalMinutes - 480)
			}

			if rec.Status == models.AttendanceStatusPresent || rec.Status == models.AttendanceStatusLate || rec.Status == models.AttendanceStatusHalfDay {
				presentDays++
			}
			if rec.Status == models.AttendanceStatusLate {
				lateDays++
			}

			cell.TotalHours = math.Round(hours*100) / 100
			cell.Status = string(rec.Status)
			cell.ClockIn = rec.ClockIn.Format("03:04 PM")
			if rec.ClockOut != nil {
				cell.ClockOut = rec.ClockOut.Format("03:04 PM")
			}
			cell.WorkMode = string(rec.WorkMode)
			if hours < 4 {
				cell.Level = 1
			} else if hours < 7.5 {
				cell.Level = 2
			} else if hours <= 8.5 {
				cell.Level = 3
			} else {
				cell.Level = 4
			}
		}

		dailyTrends = append(dailyTrends, cell)
		curr = curr.AddDate(0, 0, 1)
	}

	attendanceRate := 0.0
	if workDaysCount > 0 {
		attendanceRate = math.Round((float64(presentDays)/float64(workDaysCount))*1000) / 10
	}

	avgHours := 0.0
	if presentDays > 0 {
		avgHours = math.Round((float64(totalMinutes)/60.0/float64(presentDays))*10) / 10
	}

	onTimeRate := 0.0
	if presentDays > 0 {
		onTimeRate = math.Round((float64(presentDays-lateDays)/float64(presentDays))*1000) / 10
	}

	return &dto.AttendanceSummaryResponse{
		AttendanceRate:     attendanceRate,
		AvgDailyHours:      avgHours,
		OnTimeArrivalRate:  onTimeRate,
		TotalWorkDays:      workDaysCount,
		TotalPresentDays:   presentDays,
		TotalLateDays:      lateDays,
		TotalLeaveDays:     0,
		TotalHours:         math.Round((float64(totalMinutes)/60.0)*10) / 10,
		TotalOvertimeHours: math.Round((float64(overtimeMinutes)/60.0)*10) / 10,
		DailyTrends:        dailyTrends,
	}, nil
}

func (s *attendanceService) ListRecords(ctx context.Context, filter models.AttendanceFilter) ([]*models.Attendance, int, error) {
	return s.attRepo.List(ctx, filter)
}

func (s *attendanceService) GetTodayOverview(ctx context.Context) (*dto.OrgAttendanceTodayOverview, error) {
	now := time.Now().UTC()
	return s.attRepo.GetTodayOverview(ctx, now)
}
