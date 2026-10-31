package config

import (
	"os"
	"strings"
)

type Config struct {
	Version           string
	Port              string
	DBPath            string
	AdminPass         string
	EditorPass        string
	ViewerPass        string
	AdminToken        string
	EditorToken       string
	ViewerToken       string
	CORSAllowedOrigin string
}

func loadEnv(filename string) {
	file, err := os.ReadFile(filename)
	if err != nil {
		return
	}
	lines := strings.Split(string(file), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			val := strings.TrimSpace(parts[1])
			if os.Getenv(key) == "" {
				os.Setenv(key, val)
			}
		}
	}
}

func Load() *Config {
	loadEnv(".env")

	ver := os.Getenv("VERSION")
	port := os.Getenv("PORT")
	if port == "" {
		port = "9080"
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "app.db"
	}

	adminPass := os.Getenv("ADMIN_PASS")
	if adminPass == "" {
		adminPass = "emmamyers"
	}

	editorPass := os.Getenv("EDITOR_PASS")
	if editorPass == "" {
		editorPass = "jisoo"
	}

	viewerPass := os.Getenv("VIEWER_PASS")
	if viewerPass == "" {
		viewerPass = "view"
	}

	adminToken := os.Getenv("ADMIN_TOKEN")
	if adminToken == "" {
		adminToken = "token-admin-secret-777"
	}

	editorToken := os.Getenv("EDITOR_TOKEN")
	if editorToken == "" {
		editorToken = "token-editor-secret-555"
	}

	viewerToken := os.Getenv("VIEWER_TOKEN")
	if viewerToken == "" {
		viewerToken = "token-viewer-secret-111"
	}

	corsOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://auchan.salfetka.pro"
	}

	return &Config{
		Version:           ver,
		Port:              port,
		DBPath:            dbPath,
		AdminPass:         adminPass,
		EditorPass:        editorPass,
		ViewerPass:        viewerPass,
		AdminToken:        adminToken,
		EditorToken:       editorToken,
		ViewerToken:       viewerToken,
		CORSAllowedOrigin: corsOrigin,
	}
}
