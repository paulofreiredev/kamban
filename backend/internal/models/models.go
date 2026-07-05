package models

import "time"

type UserRole string

const (
	RoleAdmin  UserRole = "admin"
	RoleMember UserRole = "member"
)

type CardStatus string

const (
	StatusBacklog    CardStatus = "backlog"
	StatusTodo       CardStatus = "todo"
	StatusInProgress CardStatus = "in_progress"
	StatusInReview   CardStatus = "in_review"
	StatusDone       CardStatus = "done"
	StatusCancelled  CardStatus = "cancelled"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"size:120;not null" json:"name"`
	Email        string    `gorm:"size:180;uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	Role         UserRole  `gorm:"size:20;not null;default:member" json:"role"`
	Active       bool      `gorm:"not null;default:true" json:"active"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Card struct {
	ID              uint         `gorm:"primaryKey" json:"id"`
	Title           string       `gorm:"size:180;not null" json:"title"`
	Description     string       `gorm:"type:text" json:"description"`
	Status          CardStatus   `gorm:"size:32;not null;default:backlog" json:"status"`
	StatusChangedAt *time.Time   `json:"statusChangedAt"`
	Justification   *string      `gorm:"type:text" json:"justification"`
	AssigneeID      *uint        `json:"assigneeId"`
	AssigneeName    string       `gorm:"size:120" json:"assigneeName"`
	Assignee        *User        `json:"assignee,omitempty"`
	CreatedByID     *uint        `json:"createdById"`
	CreatedByName   string       `gorm:"size:120" json:"createdByName"`
	CreatedBy       *User        `json:"createdBy,omitempty"`
	CreatedAt       time.Time    `json:"createdAt"`
	UpdatedAt       time.Time    `json:"updatedAt"`
	Comments        []Comment    `json:"comments,omitempty"`
	Attachments     []Attachment `json:"attachments,omitempty"`
}

type Comment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CardID    uint      `gorm:"index;not null" json:"cardId"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	CreatedBy uint      `gorm:"not null" json:"createdBy"`
	Author    User      `gorm:"foreignKey:CreatedBy" json:"author"`
	CreatedAt time.Time `json:"createdAt"`
}

type Attachment struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	CardID       uint      `gorm:"index;not null" json:"cardId"`
	OriginalName string    `gorm:"size:255;not null" json:"originalName"`
	MimeType     string    `gorm:"size:120;not null" json:"mimeType"`
	Size         int64     `gorm:"not null" json:"size"`
	StoragePath  string    `gorm:"size:400;not null" json:"-"`
	PublicURL    string    `gorm:"size:500;not null" json:"url"`
	UploadedBy   uint      `gorm:"not null" json:"uploadedBy"`
	Uploader     User      `gorm:"foreignKey:UploadedBy" json:"uploader"`
	CreatedAt    time.Time `json:"createdAt"`
}
