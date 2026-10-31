package catalog

import (
	"api-b/internal/models"
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
)

// GlobalCatalog — глобальная переменная (карта), где ключом является PLU
var GlobalCatalog map[string]models.CatalogItem

// LoadCatalogFromJSON загружает данные каталога из указанного JSON-файла
func LoadCatalogFromJSON(filePath string) error {
	file, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("ошибка чтения файла каталога: %w", err)
	}

	// Вспомогательная структура для разбора исходного JSON-файла,
	// так как нам нужно считать PLU для использования его в качестве ключа карты.
	type rawCatalogItem struct {
		PLU       string  `json:"plu"`
		Name      string  `json:"name"`
		Weight    float64 `json:"weight"`
		ShelfLife int     `json:"shelf_life"`
	}

	var rawItems []rawCatalogItem
	if err := json.Unmarshal(file, &rawItems); err != nil {
		return fmt.Errorf("ошибка декодирования JSON: %w", err)
	}

	// Инициализируем глобальную карту
	GlobalCatalog = make(map[string]models.CatalogItem)

	for _, item := range rawItems {
		// Ключом выступает PLU. Игнорируем пустые PLU, так как по ним нельзя сделать поиск.
		if item.PLU != "" {
			GlobalCatalog[item.PLU] = models.CatalogItem{
				Name:      item.Name,
				Weight:    item.Weight,
				ShelfLife: item.ShelfLife,
			}
		}
	}

	slog.Info("Успешно инициализирован GlobalCatalog для сканирования", "items_count", len(GlobalCatalog))
	return nil
}
