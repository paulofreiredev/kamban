package main

import (
	"fmt"
	"log"
	"strings"

	"kamban/backend/internal/config"
	"kamban/backend/internal/database"
	"kamban/backend/internal/handlers"
	"kamban/backend/internal/middleware"
	"kamban/backend/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("database connect failed: %v", err)
	}
	if err := database.MigrateAndSeed(db); err != nil {
		log.Fatalf("database migrate/seed failed: %v", err)
	}

	storageProvider, err := storage.NewLocalStorageProvider(cfg.UploadDir, cfg.UploadPublicPrefix)
	if err != nil {
		log.Fatalf("storage init failed: %v", err)
	}

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: strings.ReplaceAll(cfg.CORSOrigins, " ", ""),
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,PATCH,PUT,DELETE,OPTIONS",
	}))

	app.Static(cfg.UploadPublicPrefix, cfg.UploadDir)

	authHandler := &handlers.AuthHandler{DB: db, JWTSecret: cfg.JWTSecret}
	userHandler := &handlers.UserHandler{DB: db}
	cardHandler := &handlers.CardHandler{DB: db, Storage: storageProvider}
	dashboardHandler := &handlers.DashboardHandler{DB: db}

	api := app.Group("/api")
	api.Post("/auth/login", authHandler.Login)

	protected := api.Group("", middleware.AuthRequired(cfg.JWTSecret))
	protected.Get("/me", func(c *fiber.Ctx) error {
		claims := middleware.CurrentClaims(c)
		return c.JSON(claims)
	})

	protected.Get("/users", userHandler.List)
	protected.Post("/users", middleware.AdminOnly(), userHandler.Create)
	protected.Put("/users/:id", middleware.AdminOnly(), userHandler.Update)
	protected.Patch("/users/me/password", userHandler.ChangeMyPassword)
	protected.Post("/users/:id/reset-password", middleware.AdminOnly(), userHandler.ResetPasswordToEmail)
	protected.Patch("/users/:id/toggle", middleware.AdminOnly(), userHandler.ToggleActive)
	protected.Delete("/users/:id", middleware.AdminOnly(), userHandler.Delete)

	protected.Get("/cards", cardHandler.List)
	protected.Post("/cards", cardHandler.Create)
	protected.Get("/cards/:id", cardHandler.GetByID)
	protected.Patch("/cards/:id", cardHandler.Update)
	protected.Get("/dashboard/summary", middleware.AdminOnly(), dashboardHandler.Summary)
	protected.Post("/cards/:id/comments", cardHandler.AddComment)
	protected.Post("/cards/:id/attachments", cardHandler.AddAttachment)
	protected.Delete("/cards/:id", middleware.AdminOnly(), cardHandler.Delete)
	protected.Post("/cards/:parentId/subtasks", cardHandler.CreateSubtask)
	protected.Get("/cards/:id/subtasks", cardHandler.GetSubtasks)

	log.Printf("backend running on :%s", cfg.Port)
	log.Fatal(app.Listen(fmt.Sprintf(":%s", cfg.Port)))
}
