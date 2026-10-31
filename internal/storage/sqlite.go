package storage

import (
	"api-b/internal/models"
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type Storage struct {
	db *sql.DB
}

func NewStorage(dbPath string) (*Storage, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("ошибка открытия БД: %w", err)
	}

	// Настройки для надежной работы SQLite
	db.SetMaxOpenConns(1)                // SQLite плохо держит параллельную запись, ограничим до 1
	db.SetMaxIdleConns(1)                // Держим одно соединение открытым
	db.SetConnMaxLifetime(time.Hour * 1) // Время жизни соединения

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("ошибка соединения с БД: %w", err)
	}

	// Включаем WAL-режим и таймаут ожидания блокировки
	_, _ = db.Exec("PRAGMA journal_mode=WAL;")
	_, _ = db.Exec("PRAGMA busy_timeout=5000;")

	migrationSQL := `
	CREATE TABLE IF NOT EXISTS items (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT DEFAULT '',
		plu TEXT DEFAULT '',
		articul TEXT DEFAULT '',
		quantity INTEGER NOT NULL,
		date_start TEXT NOT NULL,
		date_end TEXT NOT NULL
	);
	`
	if _, err = db.Exec(migrationSQL); err != nil {
		return nil, fmt.Errorf("ошибка выполнения миграции: %w", err)
	}

	// Пытаемся добавить колонку, если её вдруг нет (игнорируем ошибку)
	_, _ = db.Exec(`ALTER TABLE items ADD COLUMN articul TEXT DEFAULT '';`)

	slog.Info("Успешная инициализация БД и миграции Таблицы 'items'")
	return &Storage{db: db}, nil
}

func (s *Storage) Close() error {
	return s.db.Close()
}

func (s *Storage) GetAllItems(ctx context.Context) ([]models.Item, error) {
	query := "SELECT id, name, plu, articul, quantity, date_start, date_end FROM items ORDER BY date(date_end) ASC, id DESC"
	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.Item, 0)
	for rows.Next() {
		var i models.Item
		err := rows.Scan(&i.ID, &i.Name, &i.PLU, &i.Articul, &i.Quantity, &i.Date.Start, &i.Date.End)
		if err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, nil
}

func (s *Storage) GetItemByID(ctx context.Context, id int64) (models.Item, error) {
	var i models.Item
	query := "SELECT id, name, plu, articul, quantity, date_start, date_end FROM items WHERE id = ?"
	err := s.db.QueryRowContext(ctx, query, id).Scan(&i.ID, &i.Name, &i.PLU, &i.Articul, &i.Quantity, &i.Date.Start, &i.Date.End)
	return i, err
}

func (s *Storage) CreateItem(ctx context.Context, item *models.Item) (int64, error) {
	query := `INSERT INTO items (name, plu, articul, quantity, date_start, date_end) VALUES (?, ?, ?, ?, ?, ?)`
	result, err := s.db.ExecContext(ctx, query, item.Name, item.PLU, item.Articul, item.Quantity, item.Date.Start, item.Date.End)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (s *Storage) UpdateItem(ctx context.Context, id int64, item *models.Item) (bool, error) {
	var exists bool
	err := s.db.QueryRowContext(ctx, "SELECT EXISTS(SELECT 1 FROM items WHERE id = ?)", id).Scan(&exists)
	if err != nil || !exists {
		return exists, err
	}

	query := `UPDATE items SET name = ?, plu = ?, articul = ?, quantity = ?, date_start = ?, date_end = ? WHERE id = ?`
	_, err = s.db.ExecContext(ctx, query, item.Name, item.PLU, item.Articul, item.Quantity, item.Date.Start, item.Date.End, id)
	return true, err
}

func (s *Storage) DeleteItem(ctx context.Context, id int64) (bool, error) {
	result, err := s.db.ExecContext(ctx, "DELETE FROM items WHERE id = ?", id)
	if err != nil {
		return false, err
	}
	rowsAffected, _ := result.RowsAffected()
	return rowsAffected > 0, nil
}
