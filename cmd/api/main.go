package main

import (
	"api-b/internal/catalog"
	"api-b/internal/config"
	"api-b/internal/handler"
	"api-b/internal/middleware"
	"api-b/internal/service"
	"api-b/internal/storage"
	"log/slog"
	"net/http"
	"os"
)

func main() {
	// Инициализируем структурированный логгер slog
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	cfg := config.Load()

	// 1. Загрузка исходного справочника для автозаполнения (существующая логика)
	service.GlobalCatalog.LoadCatalog("catalog.json")

	// 2. Загрузка справочника для API-эндпоинта сканирования
	if err := catalog.LoadCatalogFromJSON("catalog.json"); err != nil {
		slog.Warn("Не удалось загрузить каталог для сканирования", "error", err)
	}

	store, err := storage.NewStorage(cfg.DBPath)
	if err != nil {
		slog.Error("Не удалось подключиться к БД", "error", err)
		os.Exit(1)
	}
	defer store.Close()

	itemHandler := handler.NewItemHandler(store)
	authHandler := handler.NewAuthHandler(cfg)

	mux := http.NewServeMux()

	mux.HandleFunc("POST /login", authHandler.Login)

	// Новый API эндпоинт для сканирования товаров
	mux.HandleFunc("GET /items/scan", handler.ScanLookupHandler)

	mux.HandleFunc("GET /items", middleware.Auth(cfg, "viewer", itemHandler.GetAll))
	mux.HandleFunc("GET /items/{id}", middleware.Auth(cfg, "viewer", itemHandler.GetByID))

	mux.HandleFunc("POST /items", middleware.Auth(cfg, "editor", itemHandler.Create))
	mux.HandleFunc("PUT /items/{id}", middleware.Auth(cfg, "editor", itemHandler.Update))

	mux.HandleFunc("DELETE /items/{id}", middleware.Auth(cfg, "admin", itemHandler.Delete))

	// Подключение ловушки для ботов-сканеров
	troll := handler.TrollBotHandler()
	mux.HandleFunc("GET /wp-admin", troll)
	mux.HandleFunc("GET /wp-login.php", troll)
	mux.HandleFunc("GET /xmlrpc.php", troll)
	mux.HandleFunc("GET /.env", troll)
	mux.HandleFunc("GET /.git/config", troll)

	handlerWithCORS := middleware.CORS(cfg, mux)
	finalHandler := middleware.Logger(handlerWithCORS)

	slog.Info("=== СЕРВЕР С РОЛЯМИ запущен ===", "port", cfg.Port, "version", cfg.Version)
	if err := http.ListenAndServe(":"+cfg.Port, finalHandler); err != nil {
		slog.Error("Ошибка работы сервера", "error", err)
		os.Exit(1)
	}
}
