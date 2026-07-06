package handlers

import (
	"kamban/backend/internal/dto"
	"kamban/backend/internal/middleware"
	"kamban/backend/internal/models"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ProjectHandler struct {
	db *gorm.DB
}

func NewProjectHandler(db *gorm.DB) *ProjectHandler {
	return &ProjectHandler{db: db}
}

// GetUserProjects - Lista projetos que o usuário participa (ou todos se admin)
func (h *ProjectHandler) GetUserProjects(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := claims.UserID
	role := claims.Role

	var projects []models.Project

	if role == "admin" {
		// Admin vê todos os projetos
		if err := h.db.
			Preload("Members").
			Preload("Owner").
			Order("created_at DESC").
			Find(&projects).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao buscar projetos"})
		}
	} else {
		// Usuário comum vê apenas projetos que participa
		if err := h.db.
			Joins("JOIN project_members pm ON projects.id = pm.project_id").
			Where("pm.user_id = ?", userID).
			Where("projects.is_active = true").
			Preload("Members").
			Preload("Owner").
			Order("projects.created_at DESC").
			Find(&projects).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao buscar projetos"})
		}
	}

	// Se não tem projetos, retorna array vazio
	if len(projects) == 0 {
		return c.JSON([]dto.ProjectResponse{})
	}

	responses := make([]dto.ProjectResponse, len(projects))
	for i, p := range projects {
		responses[i] = h.projectToResponse(p)
	}

	return c.JSON(responses)
}

// GetProject - Busca um projeto específico
func (h *ProjectHandler) GetProject(c *fiber.Ctx) error {
	projectID, err := strconv.ParseUint(c.Params("projectId"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "ID do projeto inválido"})
	}

	claims := middleware.CurrentClaims(c)
	if claims == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID := claims.UserID
	role := claims.Role

	// Verificar acesso
	if !h.userCanAccessProject(userID, uint(projectID), role) {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "Acesso negado"})
	}

	var project models.Project
	if err := h.db.
		Preload("Members.User").
		Preload("Owner").
		Where("id = ?", uint(projectID)).
		First(&project).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Projeto não encontrado"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao buscar projeto"})
	}

	return c.JSON(h.projectToResponse(project))
}

// CreateProject - Cria novo projeto (admin only)
func (h *ProjectHandler) CreateProject(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil || claims.Role != "admin" {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "Apenas administradores podem criar projetos"})
	}

	userID := claims.UserID
	var req dto.CreateProjectRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Dados inválidos"})
	}

	project := models.Project{
		Title:       req.Title,
		Description: req.Description,
		OwnerID:     userID,
		IsActive:    true,
	}

	if err := h.db.Create(&project).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao criar projeto"})
	}

	// Adicionar membros ao projeto
	if len(req.MemberIDs) > 0 {
		for _, memberID := range req.MemberIDs {
			member := models.ProjectMember{
				ProjectID: project.ID,
				UserID:    memberID,
			}
			h.db.Create(&member)
		}
	}

	// Adicionar owner como membro automaticamente
	ownerMember := models.ProjectMember{
		ProjectID: project.ID,
		UserID:    userID,
	}
	h.db.Create(&ownerMember)

	if err := h.db.
		Preload("Members.User").
		Preload("Owner").
		First(&project, project.ID).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao carregar projeto"})
	}

	return c.Status(http.StatusCreated).JSON(h.projectToResponse(project))
}

// UpdateProject - Atualiza projeto (admin only)
func (h *ProjectHandler) UpdateProject(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil || claims.Role != "admin" {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "Apenas administradores podem atualizar projetos"})
	}

	projectID, err := strconv.ParseUint(c.Params("projectId"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "ID do projeto inválido"})
	}

	var req dto.UpdateProjectRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Dados inválidos"})
	}

	var project models.Project
	if err := h.db.First(&project, uint(projectID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Projeto não encontrado"})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao buscar projeto"})
	}

	project.Title = req.Title
	project.Description = req.Description

	if err := h.db.Save(&project).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao atualizar projeto"})
	}

	if err := h.db.
		Preload("Members.User").
		Preload("Owner").
		First(&project, project.ID).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao carregar projeto"})
	}

	return c.JSON(h.projectToResponse(project))
}

// DeactivateProject - Inativa projeto (admin only)
func (h *ProjectHandler) DeactivateProject(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil || claims.Role != "admin" {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "Apenas administradores podem inativar projetos"})
	}

	projectID, err := strconv.ParseUint(c.Params("projectId"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "ID do projeto inválido"})
	}

	if err := h.db.Model(&models.Project{}).
		Where("id = ?", uint(projectID)).
		Update("is_active", false).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao inativar projeto"})
	}

	return c.JSON(fiber.Map{"success": true})
}

// DeleteProject - Deleta projeto (admin only)
func (h *ProjectHandler) DeleteProject(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil || claims.Role != "admin" {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "Apenas administradores podem deletar projetos"})
	}

	projectID, err := strconv.ParseUint(c.Params("projectId"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "ID do projeto inválido"})
	}

	// Inicia uma transação para garantir integridade
	tx := h.db.Begin()

	// Deleta todos os comentários das cards do projeto
	if err := tx.Where("card_id IN (SELECT id FROM cards WHERE project_id = ?)", uint(projectID)).
		Delete(&models.Comment{}).Error; err != nil {
		tx.Rollback()
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao deletar comentários"})
	}

	// Deleta todos os anexos das cards do projeto
	if err := tx.Where("card_id IN (SELECT id FROM cards WHERE project_id = ?)", uint(projectID)).
		Delete(&models.Attachment{}).Error; err != nil {
		tx.Rollback()
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao deletar anexos"})
	}

	// Deleta todas as cards do projeto
	if err := tx.Where("project_id = ?", uint(projectID)).Delete(&models.Card{}).Error; err != nil {
		tx.Rollback()
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao deletar tarefas"})
	}

	// Deleta todos os membros do projeto
	if err := tx.Where("project_id = ?", uint(projectID)).Delete(&models.ProjectMember{}).Error; err != nil {
		tx.Rollback()
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao deletar membros"})
	}

	// Deleta o projeto
	if err := tx.Delete(&models.Project{}, uint(projectID)).Error; err != nil {
		tx.Rollback()
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao deletar projeto"})
	}

	// Confirma a transação
	if err := tx.Commit().Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao confirmar deleção"})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Projeto e todas as suas tarefas foram deletados com sucesso"})
}

// AddProjectMember - Adiciona membro ao projeto (admin only)
func (h *ProjectHandler) AddProjectMember(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil || claims.Role != "admin" {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "Apenas administradores podem adicionar membros"})
	}

	projectID, err := strconv.ParseUint(c.Params("projectId"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "ID do projeto inválido"})
	}

	var req dto.AddProjectMemberRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Dados inválidos"})
	}

	// Verificar se membro já existe
	var existing models.ProjectMember
	if err := h.db.
		Where("project_id = ? AND user_id = ?", uint(projectID), req.UserID).
		First(&existing).Error; err == nil {
		return c.Status(http.StatusConflict).JSON(fiber.Map{"error": "Usuário já é membro do projeto"})
	}

	member := models.ProjectMember{
		ProjectID: uint(projectID),
		UserID:    req.UserID,
	}

	if err := h.db.Create(&member).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao adicionar membro"})
	}

	if err := h.db.Preload("User").First(&member, member.ID).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao carregar membro"})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"id":       member.ID,
		"userId":   member.UserID,
		"userName": member.User.Name,
		"userEmail": member.User.Email,
		"createdAt": member.CreatedAt,
	})
}

// RemoveProjectMember - Remove membro do projeto (admin only)
func (h *ProjectHandler) RemoveProjectMember(c *fiber.Ctx) error {
	claims := middleware.CurrentClaims(c)
	if claims == nil || claims.Role != "admin" {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "Apenas administradores podem remover membros"})
	}

	projectID, err := strconv.ParseUint(c.Params("projectId"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "ID do projeto inválido"})
	}

	memberID, err := strconv.ParseUint(c.Params("memberId"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "ID do membro inválido"})
	}

	if err := h.db.
		Where("project_id = ? AND id = ?", uint(projectID), uint(memberID)).
		Delete(&models.ProjectMember{}).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Erro ao remover membro"})
	}

	return c.JSON(fiber.Map{"success": true})
}

// Helper functions
func (h *ProjectHandler) userCanAccessProject(userID, projectID uint, role string) bool {
	if role == "admin" {
		return true
	}

	var count int64
	h.db.Model(&models.ProjectMember{}).
		Where("project_id = ? AND user_id = ?", projectID, userID).
		Count(&count)

	return count > 0
}

func (h *ProjectHandler) projectToResponse(p models.Project) dto.ProjectResponse {
	members := make([]dto.ProjectMemberResponse, 0)
	if len(p.Members) > 0 {
		for _, m := range p.Members {
			if m.User == nil {
				continue
			}
			members = append(members, dto.ProjectMemberResponse{
				ID:        m.ID,
				UserID:    m.UserID,
				UserName:  m.User.Name,
				UserEmail: m.User.Email,
				CreatedAt: m.CreatedAt,
			})
		}
	}

	ownerName := ""
	if p.Owner != nil {
		ownerName = p.Owner.Name
	}

	cardCount := int64(0)
	h.db.Model(&models.Card{}).Where("project_id = ?", p.ID).Count(&cardCount)

	return dto.ProjectResponse{
		ID:          p.ID,
		Title:       p.Title,
		Description: p.Description,
		OwnerID:     p.OwnerID,
		OwnerName:   ownerName,
		IsActive:    p.IsActive,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
		Members:     members,
		CardCount:   int(cardCount),
	}
}
