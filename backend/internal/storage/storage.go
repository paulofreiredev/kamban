package storage

import (
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type SaveResult struct {
	StoragePath string
	PublicURL   string
}

type Provider interface {
	Save(fileHeader *multipart.FileHeader) (SaveResult, error)
	Delete(storagePath string) error
}

type LocalStorageProvider struct {
	UploadDir    string
	PublicPrefix string
}

func NewLocalStorageProvider(uploadDir, publicPrefix string) (*LocalStorageProvider, error) {
	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		return nil, err
	}
	return &LocalStorageProvider{UploadDir: uploadDir, PublicPrefix: publicPrefix}, nil
}

func sanitizeFileName(name string) string {
	name = strings.ReplaceAll(name, " ", "_")
	name = strings.ReplaceAll(name, "/", "_")
	name = strings.ReplaceAll(name, "\\", "_")
	return name
}

func (l *LocalStorageProvider) Save(fileHeader *multipart.FileHeader) (SaveResult, error) {
	src, err := fileHeader.Open()
	if err != nil {
		return SaveResult{}, err
	}
	defer src.Close()

	finalName := fmt.Sprintf("%d_%s", time.Now().UnixNano(), sanitizeFileName(fileHeader.Filename))
	storagePath := filepath.Join(l.UploadDir, finalName)

	dst, err := os.Create(storagePath)
	if err != nil {
		return SaveResult{}, err
	}
	defer dst.Close()

	if _, err := dst.ReadFrom(src); err != nil {
		return SaveResult{}, err
	}

	publicPrefix := strings.TrimSuffix(l.PublicPrefix, "/")
	return SaveResult{
		StoragePath: storagePath,
		PublicURL:   fmt.Sprintf("%s/%s", publicPrefix, finalName),
	}, nil
}

func (l *LocalStorageProvider) Delete(storagePath string) error {
	if storagePath == "" {
		return nil
	}
	if err := os.Remove(storagePath); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}
