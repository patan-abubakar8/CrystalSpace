package security_test

import (
	"testing"
	"time"

	"crystalspace/backend/core/models"
	"crystalspace/backend/pkg/security"
)

func TestHashAndCheckPassword(t *testing.T) {
	password := "SecretPass123!"

	hash, err := security.HashPassword(password)
	if err != nil {
		t.Fatalf("expected no error hashing password, got: %v", err)
	}

	if !security.CheckPassword(password, hash) {
		t.Fatalf("expected password verification to pass")
	}

	if security.CheckPassword("WrongPassword", hash) {
		t.Fatalf("expected wrong password to fail verification")
	}
}

func TestGenerateJWT(t *testing.T) {
	user := &models.User{
		ID:    "11111111-2222-3333-4444-555555555555",
		Email: "test@crystalspace.com",
		Role:  "HR",
	}

	token, err := security.GenerateJWT(user, "my-test-secret-key-12345", 1*time.Hour)
	if err != nil {
		t.Fatalf("expected no error generating JWT, got: %v", err)
	}

	if token == "" {
		t.Fatalf("expected non-empty token string")
	}
}
