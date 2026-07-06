package dto

import "time"

// Project DTOs
type CreateProjectRequest struct {
	Title       string `json:"title" binding:"required,min=3,max=180"`
	Description string `json:"description"`
	MemberIDs   []uint `json:"memberIds"`
}

type UpdateProjectRequest struct {
	Title       string `json:"title" binding:"required,min=3,max=180"`
	Description string `json:"description"`
}

type AddProjectMemberRequest struct {
	UserID uint `json:"userId" binding:"required"`
}

type ProjectResponse struct {
	ID          uint            `json:"id"`
	Title       string          `json:"title"`
	Description string          `json:"description"`
	OwnerID     uint            `json:"ownerId"`
	OwnerName   string          `json:"ownerName"`
	IsActive    bool            `json:"isActive"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
	Members     []ProjectMemberResponse `json:"members,omitempty"`
	CardCount   int             `json:"cardCount"`
}

type ProjectMemberResponse struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"userId"`
	UserName  string    `json:"userName"`
	UserEmail string    `json:"userEmail"`
	CreatedAt time.Time `json:"createdAt"`
}

// Card DTOs with ProjectID
type CreateCardRequest struct {
	ProjectID   uint   `json:"projectId" binding:"required"`
	Title       string `json:"title" binding:"required,min=3,max=180"`
	Description string `json:"description"`
	AssigneeID  *uint  `json:"assigneeId"`
	ParentID    *uint  `json:"parentId"`
}

type ListCardsRequest struct {
	ProjectID uint   `form:"projectId" binding:"required"`
	Status    string `form:"status"`
	UserID    *uint  `form:"userId"`
}
