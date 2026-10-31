package service

import (
	"api-b/internal/models"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"sync"
	"time"
)

// CatalogItem описывает структуру одного товара в JSON
type CatalogItem struct {
	PLU     string `json:"plu"`
	Articul string `json:"articul"`
	Name    string `json:"name"`
}

// CatalogService управляет справочником товаров с защитой от гонки данных
type CatalogService struct {
	mu    sync.RWMutex
	items []CatalogItem
}

var GlobalCatalog = &CatalogService{}

// LoadCatalog загружает справочник из файла при старте сервера
func (cs *CatalogService) LoadCatalog(filePath string) {
	file, err := os.ReadFile(filePath)
	if err != nil {
		slog.Warn("Файл справочника не найден. Автозаполнение отключено.", "path", filePath)
		return
	}

	cs.mu.Lock()
	defer cs.mu.Unlock()

	if err := json.Unmarshal(file, &cs.items); err != nil {
		slog.Error("Не удалось прочитать JSON из справочника", "path", filePath, "error", err)
		return
	}

	slog.Info("Справочник успешно загружен", "count", len(cs.items))
}

// AutoFill проверяет справочник и подставляет недостающие данные
func (cs *CatalogService) AutoFill(item *models.Item) {
	item.PLU = strings.TrimSpace(item.PLU)
	item.Articul = strings.TrimSpace(item.Articul)

	cs.mu.RLock()
	defer cs.mu.RUnlock()

	for _, c := range cs.items {
		// Если пользователь ввел PLU, и он совпал с каталогом
		if item.PLU != "" && item.PLU == c.PLU {
			// Если Артикул пустой - заполняем из каталога
			if item.Articul == "" {
				item.Articul = c.Articul
			}
			// Если Имя пустое - заполняем из каталога
			if item.Name == "" {
				item.Name = c.Name
			}
			return // Нашли совпадение - выходим
		}

		// Если пользователь ввел Артикул, и он совпал с каталогом
		if item.Articul != "" && item.Articul == c.Articul {
			// Если PLU пустой - заполняем из каталога
			if item.PLU == "" {
				item.PLU = c.PLU
			}
			if item.Name == "" {
				item.Name = c.Name
			}
			return // Нашли совпадение - выходим
		}
	}
}

// ValidateItem проверяет данные перед сохранением в БД
func ValidateItem(item *models.Item) error {
	// 1. МАГИЯ ЗДЕСЬ: Сначала пытаемся автозаполнить пустые поля
	GlobalCatalog.AutoFill(item)

	// 2. Стандартные проверки
	if item.Quantity <= 0 {
		return fmt.Errorf("количество ('quantity') должно быть больше 0 (получено: %d)", item.Quantity)
	}

	if item.PLU == "" && item.Articul == "" {
		return fmt.Errorf("необходимо указать хотя бы PLU или Артикул")
	}

	// 3. Жесткое форматирование дат для правильной работы SQLite
	startDate, err := time.Parse("2006-01-02", strings.TrimSpace(item.Date.Start))
	if err != nil {
		return fmt.Errorf("неверный формат 'date.start' ('%s'). Ожидается формат YYYY-MM-DD", item.Date.Start)
	}
	item.Date.Start = startDate.Format("2006-01-02")

	endDate, err := time.Parse("2006-01-02", strings.TrimSpace(item.Date.End))
	if err != nil {
		return fmt.Errorf("неверный формат 'date.end' ('%s'). Ожидается формат YYYY-MM-DD", item.Date.End)
	}
	item.Date.End = endDate.Format("2006-01-02")

	if endDate.Before(startDate) {
		return fmt.Errorf("дата окончания 'date.end' (%s) не может быть раньше даты начала 'date.start' (%s)", item.Date.End, item.Date.Start)
	}

	return nil
}
