package middlewares

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"crystalspace/backend/core/interfaces"
	"crystalspace/backend/core/models"
	"crystalspace/backend/pkg/response"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserContextKey contextKey = "currentUser"

// JWTAuth validates the Bearer token in the Authorization header.
func JWTAuth(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				response.Error(w, http.StatusUnauthorized, "Missing Authorization header")
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				response.Error(w, http.StatusUnauthorized, "Invalid Authorization format; must be 'Bearer <token>'")
				return
			}

			tokenString := parts[1]
			claims := &jwt.MapClaims{}

			token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, errors.New("unexpected signing method")
				}
				return []byte(jwtSecret), nil
			})

			if err != nil || !token.Valid {
				response.Error(w, http.StatusUnauthorized, "Invalid or expired access token")
				return
			}

			userID, _ := (*claims)["user_id"].(string)
			email, _ := (*claims)["email"].(string)
			role, _ := (*claims)["role"].(string)

			userClaims := &models.UserClaims{
				UserID: userID,
				Email:  email,
				Role:   role,
			}

			ctx := context.WithValue(r.Context(), UserContextKey, userClaims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireRole checks if the authenticated user has one of the allowed roles.
func RequireRole(allowedRoles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := r.Context().Value(UserContextKey).(*models.UserClaims)
			if !ok || claims == nil {
				response.Error(w, http.StatusUnauthorized, "Unauthenticated")
				return
			}

			allowed := false
			for _, role := range allowedRoles {
				if claims.Role == role || claims.Role == "SuperAdmin" {
					allowed = true
					break
				}
			}

			if !allowed {
				response.Error(w, http.StatusForbidden, "Forbidden: insufficient permissions for this operation")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequirePermission checks if the authenticated user's role has the requested action (view, create, update, delete) on the specified page.
func RequirePermission(permRepo interfaces.PermissionRepository, page string, action string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := r.Context().Value(UserContextKey).(*models.UserClaims)
			if !ok || claims == nil {
				response.Error(w, http.StatusUnauthorized, "Unauthenticated")
				return
			}

			// SuperAdmin always has master bypass privileges
			if claims.Role == "SuperAdmin" {
				next.ServeHTTP(w, r)
				return
			}

			allowed, err := permRepo.HasPermission(r.Context(), claims.Role, page, action)
			if err != nil || !allowed {
				response.Error(w, http.StatusForbidden, "Forbidden: you do not have permission to "+action+" "+page)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
