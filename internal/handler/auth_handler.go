package handler

import (
	"api-b/internal/config"
	"encoding/json"
	"net/http"
)

type AuthRequest struct {
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	Role  string `json:"role"`
}

type AuthHandler struct {
	cfg *config.Config
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	return &AuthHandler{cfg: cfg}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Неверный формат запроса")
		return
	}

	// Проверяем пароль и определяем роль
	var role, token string
	switch req.Password {
	case h.cfg.AdminPass:
		role = "admin"
		token = h.cfg.AdminToken
	case h.cfg.EditorPass:
		role = "editor"
		token = h.cfg.EditorToken
	case h.cfg.ViewerPass:
		role = "viewer"
		token = h.cfg.ViewerToken
	default:
		respondError(w, http.StatusUnauthorized, "Неверный пароль")
		return
	}

	respondJSON(w, http.StatusOK, AuthResponse{
		Token: token,
		Role:  role,
	})
}
