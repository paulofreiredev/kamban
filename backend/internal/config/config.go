package config

import (
	"os"
)

type Config struct {
	Port               string
	DatabaseURL        string
	JWTSecret          string
	UploadDir          string
	UploadPublicPrefix string
	CORSOrigins        string
}

func getEnv(key, fallback string) string {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	return v
}

func Load() Config {
	return Config{
		Port:               getEnv("PORT", "8080"),
		DatabaseURL:        getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/kamban?sslmode=disable"),
		JWTSecret:          getEnv("JWT_SECRET", "change-me-secret"),
		UploadDir:          getEnv("UPLOAD_DIR", "./uploads"),
		UploadPublicPrefix: getEnv("UPLOAD_PUBLIC_PREFIX", "/uploads"),
		CORSOrigins:        getEnv("CORS_ORIGINS", "http://localhost:4200,http://localhost:8081"),
	}
}
