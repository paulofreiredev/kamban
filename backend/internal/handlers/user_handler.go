package handlers

import (
	"strings"

	"kamban/backend/internal/middleware"
	"kamban/backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserHandler struct {
	DB *gorm.DB
}

type createUserRequest struct {
	Name     string          `json:"name"`
	Email    string          `json:"email"`
	Password string          `json:"password"`
	Role     models.UserRole `json:"role"`
}

type updateUserRequest struct {
	Name     *string          `json:"name"`
	Email    *string          `json:"email"`
	Password *string          `json:"password"`
	Role     *models.UserRole `json:"role"`
}

type changeMyPasswordRequest struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

func (h *UserHandler) List(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	// All authenticated users can list users (not admin-only anymore)

	var users []models.User
	if err := h.DB.Order("name asc").Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not load users"})
	}
	return c.JSON(users)
}

func (h *UserHandler) Create(c *fiber.Ctx) error {
	if middleware.CurrentClaims(c) == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	var req createUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid payload"})
	}
	if req.Name == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "name, email and password are required"})
	}
	if req.Role == "" {
		req.Role = models.RoleMember
	}
	if req.Role != models.RoleAdmin && req.Role != models.RoleMember {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid role"})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not hash password"})
	}
	user := models.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: string(hash),
		Role:         req.Role,
		Active:       true,
	}
	if err := h.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "could not create user", "error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(user)
}

func (h *UserHandler) Update(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	id := c.Params("id")
	var user models.User
	if err := h.DB.First(&user, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "user not found"})
	}

	var req updateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid payload"})
	}

	isSelf := claims.UserID == user.ID
	isAdmin := claims.Role == string(models.RoleAdmin)

	if !isAdmin && !isSelf {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"message": "forbidden"})
	}

	if isSelf && req.Role != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"message": "you cannot change your own role"})
	}

	if !isAdmin && req.Name != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"message": "non-admin users can only change email and password"})
	}

	if req.Name != nil {
		if strings.TrimSpace(*req.Name) == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "name cannot be empty"})
		}
		user.Name = *req.Name
	}
	if req.Email != nil {
		if strings.TrimSpace(*req.Email) == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "email cannot be empty"})
		}
		user.Email = *req.Email
	}
	if req.Role != nil {
		if !isAdmin {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"message": "only admins can change roles"})
		}
		if *req.Role != models.RoleAdmin && *req.Role != models.RoleMember {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid role"})
		}
		user.Role = *req.Role
	}
	if req.Password != nil && strings.TrimSpace(*req.Password) != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not hash password"})
		}
		user.PasswordHash = string(hash)
	}

	if err := h.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "could not update user", "error": err.Error()})
	}
	return c.JSON(user)
}

func (h *UserHandler) ChangeMyPassword(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	var req changeMyPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "invalid payload"})
	}

	req.CurrentPassword = strings.TrimSpace(req.CurrentPassword)
	req.NewPassword = strings.TrimSpace(req.NewPassword)

	if req.CurrentPassword == "" || req.NewPassword == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "currentPassword and newPassword are required"})
	}
	if len(req.NewPassword) < 8 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "new password must have at least 8 characters"})
	}
	if req.CurrentPassword == req.NewPassword {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "new password must be different from current password"})
	}

	var user models.User
	if err := h.DB.First(&user, claims.UserID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "user not found"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "current password is invalid"})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not hash password"})
	}

	if err := h.DB.Model(&user).Update("password_hash", string(hash)).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not update password"})
	}

	return c.JSON(fiber.Map{"message": "password updated successfully"})
}

func (h *UserHandler) ResetPasswordToEmail(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	id := c.Params("id")
	var user models.User
	if err := h.DB.First(&user, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "user not found"})
	}

	if claims.UserID == user.ID {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "use the change password flow for your own account"})
	}

	resetPassword := strings.TrimSpace(user.Email)
	if resetPassword == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "user email is invalid for reset"})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(resetPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not hash password"})
	}

	if err := h.DB.Model(&user).Update("password_hash", string(hash)).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not reset password"})
	}

	return c.JSON(fiber.Map{"message": "password reset successfully", "defaultPassword": user.Email})
}

func (h *UserHandler) ToggleActive(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	id := c.Params("id")
	var user models.User
	if err := h.DB.First(&user, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "user not found"})
	}
	// Prevent admin from deactivating themselves
	if claims.UserID == user.ID {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "cannot change your own active status"})
	}
	user.Active = !user.Active
	if err := h.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not update user"})
	}
	return c.JSON(user)
}

func (h *UserHandler) Delete(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}
	id := c.Params("id")
	var user models.User
	if err := h.DB.First(&user, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "user not found"})
	}
	// Prevent admin from deleting themselves
	if claims.UserID == user.ID {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "cannot delete your own account"})
	}
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		// Nullify assignee FK on cards
		if err := tx.Model(&models.Card{}).Where("assignee_id = ?", user.ID).
			Updates(map[string]interface{}{"assignee_id": nil}).Error; err != nil {
			return err
		}
		// Nullify creator FK on cards
		if err := tx.Model(&models.Card{}).Where("created_by_id = ?", user.ID).
			Updates(map[string]interface{}{"created_by_id": nil}).Error; err != nil {
			return err
		}
		// Delete comments authored by this user
		if err := tx.Where("created_by = ?", user.ID).Delete(&models.Comment{}).Error; err != nil {
			return err
		}
		// Delete attachments uploaded by this user
		if err := tx.Where("uploaded_by = ?", user.ID).Delete(&models.Attachment{}).Error; err != nil {
			return err
		}
		return tx.Delete(&user).Error
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not delete user"})
	}
	return c.SendStatus(fiber.StatusNoContent)
}
