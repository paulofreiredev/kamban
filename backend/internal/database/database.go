package database

import (
	"embed"
	"kamban/backend/internal/config"
	"kamban/backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

//go:embed scripts/*.sql
var seedScripts embed.FS

func Connect(cfg config.Config) (*gorm.DB, error) {
	return gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
}

func MigrateAndSeed(db *gorm.DB) error {
	if err := db.AutoMigrate(&models.User{}, &models.Project{}, &models.ProjectMember{}, &models.Card{}, &models.Comment{}, &models.Attachment{}); err != nil {
		return err
	}

	// Make created_by_id nullable to allow user deletion without losing card data
	db.Exec("ALTER TABLE cards ALTER COLUMN created_by_id DROP NOT NULL")

	// Backfill denormalized name columns for existing cards that predate this migration
	db.Exec(`
		UPDATE cards c
		SET created_by_name = u.name
		FROM users u
		WHERE c.created_by_id = u.id
		  AND (c.created_by_name IS NULL OR c.created_by_name = '')
	`)
	db.Exec(`
		UPDATE cards c
		SET assignee_name = u.name
		FROM users u
		WHERE c.assignee_id = u.id
		  AND (c.assignee_name IS NULL OR c.assignee_name = '')
	`)

	seedSQL, err := seedScripts.ReadFile("scripts/001_seed_admin.sql")
	if err != nil {
		return err
	}
	if err := db.Exec(string(seedSQL)).Error; err != nil {
		return err
	}

	// Seed default project and migrate existing cards
	seedProjectSQL, err := seedScripts.ReadFile("scripts/002_seed_default_project.sql")
	if err != nil {
		return err
	}
	if err := db.Exec(string(seedProjectSQL)).Error; err != nil {
		return err
	}

	return nil
}
