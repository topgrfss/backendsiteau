package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestLoadCatalogFromJSON(t *testing.T) {
	// Создаем временный файл JSON для теста
	content := `[
		{"plu": "12345", "name": "Тестовый товар 1", "weight": 1.25, "shelf_life": 10},
		{"plu": "67890", "name": "Тестовый товар 2", "weight": 0.5, "shelf_life": 5},
		{"plu": "", "name": "Товар без PLU", "weight": 2.0, "shelf_life": 30}
	]`
	tmpFile, err := os.CreateTemp("", "catalog_test_*.json")
	if err != nil {
		t.Fatalf("Не удалось создать временный файл: %v", err)
	}
	defer os.Remove(tmpFile.Name())

	if _, err := tmpFile.Write([]byte(content)); err != nil {
		t.Fatalf("Не удалось записать во временный файл: %v", err)
	}
	tmpFile.Close()

	// Загружаем каталог
	err = LoadCatalogFromJSON(tmpFile.Name())
	if err != nil {
		t.Fatalf("LoadCatalogFromJSON завершилась с ошибкой: %v", err)
	}

	// Проверяем заполнение GlobalCatalog
	if len(GlobalCatalog) != 2 {
		t.Errorf("Ожидалось 2 элемента в каталоге, получено %d", len(GlobalCatalog))
	}

	item1, found1 := GlobalCatalog["12345"]
	if !found1 {
		t.Error("Товар с PLU 12345 не найден")
	} else {
		if item1.Name != "Тестовый товар 1" {
			t.Errorf("Ожидалось имя 'Тестовый товар 1', получено '%s'", item1.Name)
		}
		if item1.Weight != 1.25 {
			t.Errorf("Ожидался вес 1.25, получено %f", item1.Weight)
		}
		if item1.ShelfLife != 10 {
			t.Errorf("Ожидался срок годности 10, получено %d", item1.ShelfLife)
		}
	}

	_, foundEmpty := GlobalCatalog[""]
	if foundEmpty {
		t.Error("Товар с пустым PLU не должен быть добавлен в каталог")
	}
}

func TestScanLookupHandler(t *testing.T) {
	// Настраиваем GlobalCatalog вручную для тестирования обработчика
	GlobalCatalog = map[string]CatalogItem{
		"99999": {
			Name:      "Печенье",
			Weight:    0.3,
			ShelfLife: 180,
		},
	}

	// Сценарий 1: Успешный поиск
	reqFound := httptest.NewRequest("GET", "/api/items/scan?code=99999", nil)
	rrFound := httptest.NewRecorder()
	ScanLookupHandler(rrFound, reqFound)

	if rrFound.Code != http.StatusOK {
		t.Errorf("Ожидался статус 200, получен %d", rrFound.Code)
	}

	var respFound map[string]interface{}
	if err := json.Unmarshal(rrFound.Body.Bytes(), &respFound); err != nil {
		t.Fatalf("Ошибка декодирования ответа: %v", err)
	}

	if respFound["found"] != true {
		t.Errorf("Ожидалось 'found': true, получено %v", respFound["found"])
	}
	if respFound["name"] != "Печенье" {
		t.Errorf("Ожидалось name 'Печенье', получено '%v'", respFound["name"])
	}
	if respFound["weight"] != 0.3 {
		t.Errorf("Ожидался weight 0.3, получен %v", respFound["weight"])
	}
	if respFound["shelf_life"] != float64(180) {
		t.Errorf("Ожидался shelf_life 180, получен %v", respFound["shelf_life"])
	}

	// Сценарий 2: Товар не найден
	reqNotFound := httptest.NewRequest("GET", "/api/items/scan?code=11111", nil)
	rrNotFound := httptest.NewRecorder()
	ScanLookupHandler(rrNotFound, reqNotFound)

	if rrNotFound.Code != http.StatusOK {
		t.Errorf("Ожидался статус 200, получен %d", rrNotFound.Code)
	}

	var respNotFound map[string]interface{}
	if err := json.Unmarshal(rrNotFound.Body.Bytes(), &respNotFound); err != nil {
		t.Fatalf("Ошибка декодирования ответа: %v", err)
	}

	if respNotFound["found"] != false {
		t.Errorf("Ожидалось 'found': false, получено %v", respNotFound["found"])
	}
	if _, exists := respNotFound["name"]; exists {
		t.Error("Ответ не должен содержать 'name', если товар не найден")
	}

	// Сценарий 3: Запрос без параметра code
	reqNoCode := httptest.NewRequest("GET", "/api/items/scan", nil)
	rrNoCode := httptest.NewRecorder()
	ScanLookupHandler(rrNoCode, reqNoCode)

	if rrNoCode.Code != http.StatusBadRequest {
		t.Errorf("Ожидался статус 400, получен %d", rrNoCode.Code)
	}
}
