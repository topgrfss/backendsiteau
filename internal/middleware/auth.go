package middleware

import (
	"api-b/internal/config"
	"net/http"
	"strings"
)

// Auth проверяет наличие правильного Bearer токена и разграничивает роли
func Auth(cfg *config.Config, minRole string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error":"Необходима авторизация"}`, http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, `{"error":"Неверный формат авторизации"}`, http.StatusUnauthorized)
			return
		}

		token := parts[1]
		userRole := ""

		switch token {
		case cfg.AdminToken:
			userRole = "admin"
		case cfg.EditorToken:
			userRole = "editor"
		case cfg.ViewerToken:
			userRole = "viewer"
		default:
			http.Error(w, `{"error":"Сессия устарела или неверный токен"}`, http.StatusUnauthorized)
			return
		}

		// Проверка уровня доступа (RBAC)
		if !hasPermission(userRole, minRole) {
			http.Error(w, `{"error":"Недостаточно прав для этой операции"}`, http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	}
}

func hasPermission(userRole, minRole string) bool {
	if userRole == "admin" {
		return true
	}
	if userRole == "editor" {
		return minRole == "editor" || minRole == "viewer"
	}
	if userRole == "viewer" {
		return minRole == "viewer"
	}
	return false
}
