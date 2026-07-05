package handlers

import (
	"time"

	"kamban/backend/internal/middleware"
	"kamban/backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type DashboardHandler struct {
	DB *gorm.DB
}

type dashboardStatusCount struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
}

type dashboardUserProductivity struct {
	UserID          uint   `json:"userId"`
	UserName        string `json:"userName"`
	InProgressCount int64  `json:"inProgressCount"`
	DoneCount       int64  `json:"doneCount"`
}

type dashboardSummaryResponse struct {
	From             string                      `json:"from"`
	To               string                      `json:"to"`
	StatusCounts     []dashboardStatusCount      `json:"statusCounts"`
	UserProductivity []dashboardUserProductivity `json:"userProductivity"`
}

func parseDashboardPeriod(c *fiber.Ctx) (time.Time, time.Time, error) {
	const layout = "2006-01-02"
	fromRaw := c.Query("from")
	toRaw := c.Query("to")

	now := time.Now()
	location := now.Location()

	var fromDate time.Time
	var toDate time.Time
	var err error

	if fromRaw == "" {
		fromDate = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, location).AddDate(0, 0, -30)
	} else {
		fromDate, err = time.ParseInLocation(layout, fromRaw, location)
		if err != nil {
			return time.Time{}, time.Time{}, err
		}
	}

	if toRaw == "" {
		toDate = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, location)
	} else {
		toDate, err = time.ParseInLocation(layout, toRaw, location)
		if err != nil {
			return time.Time{}, time.Time{}, err
		}
	}

	if fromDate.After(toDate) {
		return time.Time{}, time.Time{}, fiber.NewError(fiber.StatusBadRequest, "invalid period: from must be before or equal to to")
	}

	return fromDate, toDate, nil
}

func (h *DashboardHandler) Summary(c *fiber.Ctx) error {
	if middleware.CurrentClaims(c) == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	fromDate, toDate, err := parseDashboardPeriod(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid period format, use YYYY-MM-DD"})
	}

	endExclusive := toDate.AddDate(0, 0, 1)

	type statusRow struct {
		Status string
		Count  int64
	}
	var statusRows []statusRow
	if err := h.DB.Model(&models.Card{}).
		Select("status, COUNT(*) as count").
		Where("created_at >= ? AND created_at < ?", fromDate, endExclusive).
		Group("status").
		Scan(&statusRows).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not load status summary"})
	}

	statusMap := map[string]int64{}
	for _, row := range statusRows {
		statusMap[row.Status] = row.Count
	}

	orderedStatuses := []models.CardStatus{
		models.StatusBacklog,
		models.StatusTodo,
		models.StatusInProgress,
		models.StatusInReview,
		models.StatusDone,
		models.StatusCancelled,
	}

	statusCounts := make([]dashboardStatusCount, 0, len(orderedStatuses))
	for _, status := range orderedStatuses {
		statusCounts = append(statusCounts, dashboardStatusCount{
			Status: string(status),
			Count:  statusMap[string(status)],
		})
	}

	type userRow struct {
		UserID          uint
		UserName        string
		InProgressCount int64
		DoneCount       int64
	}
	var userRows []userRow

	if err := h.DB.Table("users u").
		Select(`
			u.id as user_id,
			u.name as user_name,
			COALESCE(SUM(CASE WHEN c.status = 'in_progress' THEN 1 ELSE 0 END), 0) as in_progress_count,
			COALESCE(SUM(CASE WHEN c.status = 'done' THEN 1 ELSE 0 END), 0) as done_count
		`).
		Joins("LEFT JOIN cards c ON c.assignee_id = u.id AND c.created_at >= ? AND c.created_at < ?", fromDate, endExclusive).
		Where("u.role <> ?", models.RoleAdmin).
		Group("u.id, u.name").
		Order("done_count DESC, in_progress_count DESC, u.name ASC").
		Scan(&userRows).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not load productivity summary"})
	}

	userProductivity := make([]dashboardUserProductivity, 0, len(userRows))
	for _, row := range userRows {
		userProductivity = append(userProductivity, dashboardUserProductivity{
			UserID:          row.UserID,
			UserName:        row.UserName,
			InProgressCount: row.InProgressCount,
			DoneCount:       row.DoneCount,
		})
	}

	return c.JSON(dashboardSummaryResponse{
		From:             fromDate.Format("2006-01-02"),
		To:               toDate.Format("2006-01-02"),
		StatusCounts:     statusCounts,
		UserProductivity: userProductivity,
	})
}
