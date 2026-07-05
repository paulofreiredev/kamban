package middleware

import (
	"strings"

	"kamban/backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

const userClaimsKey = "userClaims"

func AuthRequired(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		if auth == "" || !strings.HasPrefix(strings.ToLower(auth), "bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "missing token"})
		}
		token := strings.TrimSpace(auth[7:])
		claims, err := services.ParseToken(jwtSecret, token)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "invalid token"})
		}
		c.Locals(userClaimsKey, claims)
		return c.Next()
	}
}

func AdminOnly() fiber.Handler {
	return func(c *fiber.Ctx) error {
		claims := CurrentClaims(c)
		if claims == nil || claims.Role != "admin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"message": "admin only"})
		}
		return c.Next()
	}
}

func CurrentClaims(c *fiber.Ctx) *services.Claims {
	v := c.Locals(userClaimsKey)
	if v == nil {
		return nil
	}
	claims, ok := v.(*services.Claims)
	if !ok {
		return nil
	}
	return claims
}
