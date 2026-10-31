package storage

import (
	"api-b/internal/models"
	"context"
	"testing"
)

func TestStorage(t *testing.T) {
	// Используем БД в памяти для тестов
	s, err := NewStorage(":memory:")
	if err != nil {
		t.Fatalf("Failed to create storage: %v", err)
	}
	defer s.Close()

	ctx := context.Background()

	// Тест создания
	item := &models.Item{
		Name:     "Test Item",
		PLU:      "123",
		Quantity: 5,
		Date: models.ItemDate{
			Start: "2023-01-01",
			End:   "2023-01-10",
		},
	}

	id, err := s.CreateItem(ctx, item)
	if err != nil {
		t.Fatalf("CreateItem failed: %v", err)
	}
	if id <= 0 {
		t.Errorf("Expected positive ID, got %d", id)
	}

	// Тест получения по ID
	got, err := s.GetItemByID(ctx, id)
	if err != nil {
		t.Fatalf("GetItemByID failed: %v", err)
	}
	if got.Name != item.Name {
		t.Errorf("Expected name %s, got %s", item.Name, got.Name)
	}

	// Тест получения всех
	items, err := s.GetAllItems(ctx)
	if err != nil {
		t.Fatalf("GetAllItems failed: %v", err)
	}
	if len(items) != 1 {
		t.Errorf("Expected 1 item, got %d", len(items))
	}

	// Тест обновления
	item.Name = "Updated Name"
	ok, err := s.UpdateItem(ctx, id, item)
	if err != nil || !ok {
		t.Fatalf("UpdateItem failed: %v, ok=%v", err, ok)
	}

	updated, _ := s.GetItemByID(ctx, id)
	if updated.Name != "Updated Name" {
		t.Errorf("Update failed to change name")
	}

	// Тест удаления
	deleted, err := s.DeleteItem(ctx, id)
	if err != nil || !deleted {
		t.Fatalf("DeleteItem failed: %v, deleted=%v", err, deleted)
	}

	_, err = s.GetItemByID(ctx, id)
	if err == nil {
		t.Errorf("Expected error when getting deleted item, got nil")
	}
}
