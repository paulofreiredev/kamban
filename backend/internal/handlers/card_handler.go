package handlers

import (
	"mime"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"kamban/backend/internal/middleware"
	"kamban/backend/internal/models"
	"kamban/backend/internal/storage"
	"kamban/backend/internal/services"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CardHandler struct {
	DB      *gorm.DB
	Storage storage.Provider
}

type createCardRequest struct {
	ProjectID   uint              `json:"projectId"`
	Title       string            `json:"title"`
	Description string            `json:"description"`
	Status      models.CardStatus `json:"status"`
	AssigneeID  *uint             `json:"assigneeId"`
}

type createSubtaskRequest struct {
	Title      string `json:"title"`
	Description string `json:"description"`
}

type updateCardRequest struct {
	Title       *string            `json:"title"`
	Description *string            `json:"description"`
	Status      *models.CardStatus `json:"status"`
	AssigneeID  *uint              `json:"assigneeId"`
	Justification *string          `json:"justification"`
}

type createCommentRequest struct {
	Content string `json:"content"`
}

func canManageCardItem(claims *services.Claims, ownerID uint) bool {
	return claims != nil && (claims.Role == "admin" || claims.UserID == ownerID)
}

func isValidStatus(s models.CardStatus) bool {
	switch s {
	case models.StatusBacklog, models.StatusTodo, models.StatusInProgress, models.StatusInReview, models.StatusDone, models.StatusCancelled:
		return true
	default:
		return false
	}
}

// countSubtasks returns the total count of subtasks for a card
func (h *CardHandler) countSubtasks(cardID uint) (int64, error) {
	var count int64
	if err := h.DB.Model(&models.Card{}).Where("parent_id = ?", cardID).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// countDoneOrCancelledSubtasks returns count of subtasks that are done or cancelled
func (h *CardHandler) countDoneOrCancelledSubtasks(cardID uint) (int64, error) {
	var count int64
	if err := h.DB.Model(&models.Card{}).
		Where("parent_id = ?", cardID).
		Where("status IN ?", []models.CardStatus{models.StatusDone, models.StatusCancelled}).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// canCompleteCard checks if card can be moved to done/cancelled status
func (h *CardHandler) canCompleteCard(cardID uint) (bool, error) {
	// If card has no subtasks, it can always be completed
	total, err := h.countSubtasks(cardID)
	if err != nil {
		return false, err
	}
	if total == 0 {
		return true, nil
	}

	// If card has subtasks, all must be done or cancelled
	completed, err := h.countDoneOrCancelledSubtasks(cardID)
	if err != nil {
		return false, err
	}
	return completed == total, nil
}

// canMoveSubtask checks if subtask can be moved to a new status
func (h *CardHandler) canMoveSubtask(subtaskID uint) (bool, error) {
	var subtask models.Card
	if err := h.DB.First(&subtask, subtaskID).Error; err != nil {
		return false, err
	}

	// If this is not a subtask, always allow
	if !subtask.IsSubtask || subtask.ParentID == nil {
		return true, nil
	}

	// Subtask can only be moved if parent is in progress
	var parent models.Card
	if err := h.DB.First(&parent, *subtask.ParentID).Error; err != nil {
		return false, err
	}

	return parent.Status == models.StatusInProgress, nil
}

func (h *CardHandler) List(c *fiber.Ctx) error {
	fromStr := c.Query("from")
	toStr := c.Query("to")
	assigneeIdStr := c.Query("assigneeId")
	projectIDStr := c.Query("projectId")
	
	// projectId is required
	if projectIDStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "projectId is required"})
	}

	to := time.Now()
	from := to.AddDate(0, 0, -30)
	var err error
	if fromStr != "" {
		from, err = time.Parse("2006-01-02", fromStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid from date"})
		}
	}
	if toStr != "" {
		to, err = time.Parse("2006-01-02", toStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid to date"})
		}
		to = to.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
	}
	if from.After(to) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "from must be <= to"})
	}

	query := h.DB.
		Preload("Assignee").
		Preload("CreatedBy").
		Where("project_id = ?", projectIDStr).
		Where("created_at BETWEEN ? AND ?", from, to)
	
	if assigneeIdStr != "" && assigneeIdStr != "0" {
		query = query.Where("assignee_id = ?", assigneeIdStr)
	}

	var cards []models.Card
	if err := query.Order("created_at desc").Find(&cards).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not list cards"})
	}

	return c.JSON(cards)
}

func (h *CardHandler) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var card models.Card
	if err := h.DB.
		Preload("Assignee").
		Preload("CreatedBy").
		Preload("Comments").
		Preload("Comments.Author").
		Preload("Attachments").
		Preload("Attachments.Uploader").
		First(&card, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "card not found"})
	}
	return c.JSON(card)
}

func (h *CardHandler) Create(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	var req createCardRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid payload"})
	}
	
	// Validate projectId
	if req.ProjectID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "projectId is required"})
	}
	
	// Verify user has access to project
	var projectMember models.ProjectMember
	if err := h.DB.
		Where("project_id = ? AND user_id = ?", req.ProjectID, claims.UserID).
		First(&projectMember).Error; err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"message": "you don't have access to this project"})
	}
	
	if strings.TrimSpace(req.Title) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "title is required"})
	}
	if req.Status == "" {
		req.Status = models.StatusBacklog
	}
	if !isValidStatus(req.Status) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid status"})
	}
	if req.AssigneeID != nil {
		var assignee models.User
		if err := h.DB.First(&assignee, *req.AssigneeID).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid assignee"})
		}
	}

	// Fetch names for denormalized storage
	assigneeName := ""
	if req.AssigneeID != nil {
		var a models.User
		h.DB.First(&a, *req.AssigneeID)
		assigneeName = a.Name
	}
	var creator models.User
	createdByName := ""
	if err := h.DB.First(&creator, claims.UserID).Error; err == nil {
		createdByName = creator.Name
	}

	now := time.Now()
	creatorID := claims.UserID
	card := models.Card{
		ProjectID:       req.ProjectID,
		Title:           req.Title,
		Description:     req.Description,
		Status:          req.Status,
		StatusChangedAt: &now,
		AssigneeID:      req.AssigneeID,
		AssigneeName:    assigneeName,
		CreatedByID:     &creatorID,
		CreatedByName:   createdByName,
	}
	if err := h.DB.Create(&card).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not create card"})
	}

	if err := h.DB.Preload("Assignee").Preload("CreatedBy").First(&card, card.ID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not load created card"})
	}
	return c.Status(fiber.StatusCreated).JSON(card)
}

func (h *CardHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var card models.Card
	if err := h.DB.First(&card, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "card not found"})
	}

	var req updateCardRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid payload"})
	}

	if req.Title != nil {
		if strings.TrimSpace(*req.Title) == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "title cannot be empty"})
		}
		card.Title = *req.Title
	}
	if req.Description != nil {
		card.Description = *req.Description
	}
	if req.Status != nil {
		if !isValidStatus(*req.Status) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid status"})
		}
		if card.Status != *req.Status {
			// Check subtask transition rules
			newStatus := *req.Status
			
			// Rule 1: If this is a subtask trying to transition to done/cancelled, parent must be in progress
			if card.IsSubtask && (newStatus == models.StatusDone || newStatus == models.StatusCancelled) {
				if card.ParentID != nil {
					var parent models.Card
					if err := h.DB.First(&parent, *card.ParentID).Error; err == nil {
						if parent.Status == models.StatusCancelled || parent.Status == models.StatusDone {
							return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "subtask can only be completed/cancelled if parent is in progress"})
						}
					}
				}
			}
			
			// Rule 2: If trying to move parent to done/cancelled, all subtasks must be done or cancelled
			if !card.IsSubtask && (newStatus == models.StatusDone || newStatus == models.StatusCancelled) {
				canComplete, err := h.canCompleteCard(card.ID)
				if err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not validate subtasks"})
				}
				if !canComplete {
					return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "cannot complete task: all subtasks must be done or cancelled"})
				}
			}

			card.Status = *req.Status
			now := time.Now()
			card.StatusChangedAt = &now
		}
	}
	if req.AssigneeID != nil {
		var assignee models.User
		if err := h.DB.First(&assignee, *req.AssigneeID).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid assignee"})
		}
		card.AssigneeID = req.AssigneeID
		card.AssigneeName = assignee.Name
	}
	if req.Justification != nil {
		card.Justification = req.Justification
	}

	if err := h.DB.Save(&card).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not update card"})
	}
	if err := h.DB.Preload("Assignee").Preload("CreatedBy").First(&card, card.ID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not load updated card"})
	}
	return c.JSON(card)
}

func (h *CardHandler) AddComment(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	id := c.Params("id")
	var card models.Card
	if err := h.DB.First(&card, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "card not found"})
	}

	var req createCommentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid payload"})
	}
	if strings.TrimSpace(req.Content) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "content is required"})
	}

	comment := models.Comment{CardID: card.ID, Content: req.Content, CreatedBy: claims.UserID}
	if err := h.DB.Create(&comment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not add comment"})
	}
	if err := h.DB.Preload("Author").First(&comment, comment.ID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not load comment"})
	}
	return c.Status(fiber.StatusCreated).JSON(comment)
}

func (h *CardHandler) DeleteComment(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	commentID, err := strconv.ParseUint(c.Params("commentId"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid comment id"})
	}

	var comment models.Comment
	if err := h.DB.First(&comment, uint(commentID)).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "comment not found"})
	}

	if !canManageCardItem(claims, comment.CreatedBy) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"message": "forbidden"})
	}

	if err := h.DB.Delete(&comment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not delete comment"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func isSupportedMime(m string) bool {
	return strings.HasPrefix(m, "image/") || strings.HasPrefix(m, "video/")
}

func (h *CardHandler) AddAttachment(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	id := c.Params("id")
	var card models.Card
	if err := h.DB.First(&card, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "card not found"})
	}

	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "file is required"})
	}

	mimeType := fileHeader.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = mime.TypeByExtension(filepath.Ext(fileHeader.Filename))
	}
	if !isSupportedMime(mimeType) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "only image/video are allowed"})
	}

	res, err := h.Storage.Save(fileHeader)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not save file"})
	}

	attachment := models.Attachment{
		CardID:       card.ID,
		OriginalName: fileHeader.Filename,
		MimeType:     mimeType,
		Size:         fileHeader.Size,
		StoragePath:  res.StoragePath,
		PublicURL:    res.PublicURL,
		UploadedBy:   claims.UserID,
	}
	if err := h.DB.Create(&attachment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not persist attachment"})
	}
	if err := h.DB.Preload("Uploader").First(&attachment, attachment.ID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not load attachment"})
	}
	return c.Status(fiber.StatusCreated).JSON(attachment)
}

func (h *CardHandler) DeleteAttachment(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	attachmentID, err := strconv.ParseUint(c.Params("attachmentId"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid attachment id"})
	}

	var attachment models.Attachment
	if err := h.DB.First(&attachment, uint(attachmentID)).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "attachment not found"})
	}

	if !canManageCardItem(claims, attachment.UploadedBy) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"message": "forbidden"})
	}

	if err := h.Storage.Delete(attachment.StoragePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not delete file"})
	}

	if err := h.DB.Delete(&attachment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not delete attachment"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *CardHandler) Delete(c *fiber.Ctx) error {
	if middleware.CurrentClaims(c) == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	id := c.Params("id")
	var card models.Card
	if err := h.DB.First(&card, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "card not found"})
	}
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("card_id = ?", card.ID).Delete(&models.Comment{}).Error; err != nil {
			return err
		}
		if err := tx.Where("card_id = ?", card.ID).Delete(&models.Attachment{}).Error; err != nil {
			return err
		}
		return tx.Delete(&card).Error
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not delete card"})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

func (h *CardHandler) CreateSubtask(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	parentID, err := strconv.ParseUint(c.Params("parentId"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid parent id"})
	}

	// Verify parent exists and is not itself a subtask
	var parent models.Card
	if err := h.DB.First(&parent, uint(parentID)).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "parent card not found"})
	}
	if parent.IsSubtask {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "cannot create subtask of subtask"})
	}

	// Rule: Cannot create subtasks for finished or cancelled tasks
	if parent.Status == models.StatusDone || parent.Status == models.StatusCancelled {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "cannot create subtasks for finished or cancelled tasks"})
	}

	// Parse request
	var req createSubtaskRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid payload"})
	}
	if strings.TrimSpace(req.Title) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "title is required"})
	}

	// Create subtask
	createdByID := claims.UserID
	now := time.Now()
	parentIDUint := uint(parentID)

	subtask := models.Card{
		ProjectID:       parent.ProjectID,
		Title:           req.Title,
		Description:     req.Description,
		Status:          models.StatusBacklog,
		StatusChangedAt: &now,
		ParentID:        &parentIDUint,
		IsSubtask:       true,
		CreatedByID:     &createdByID,
		CreatedByName:    func() string {
			var creator models.User
			if err := h.DB.First(&creator, createdByID).Error; err == nil {
				return creator.Name
			}
			return ""
		}(),
	}

	if err := h.DB.Create(&subtask).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not create subtask"})
	}

	return c.Status(fiber.StatusCreated).JSON(subtask)
}

func (h *CardHandler) GetSubtasks(c *fiber.Ctx) error {
	cardID := c.Params("id")
	var subtasks []models.Card
	if err := h.DB.Where("parent_id = ?", cardID).Order("created_at asc").Find(&subtasks).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not load subtasks"})
	}
	return c.JSON(subtasks)
}
