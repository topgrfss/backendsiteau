package service

import (
	"api-b/internal/models"
	"testing"
)

func TestValidateItem(t *testing.T) {
	// Инициализируем тестовый каталог
	GlobalCatalog.items = []CatalogItem{
		{PLU: "123", Articul: "ART-123", Name: "Test Item"},
	}

	tests := []struct {
		name    string
		item    models.Item
		wantErr bool
	}{
		{
			name: "Valid item",
			item: models.Item{
				PLU:      "123",
				Quantity: 10,
				Date: models.ItemDate{
					Start: "2023-01-01",
					End:   "2023-01-10",
				},
			},
			wantErr: false,
		},
		{
			name: "Invalid quantity",
			item: models.Item{
				PLU:      "123",
				Quantity: 0,
				Date: models.ItemDate{
					Start: "2023-01-01",
					End:   "2023-01-10",
				},
			},
			wantErr: true,
		},
		{
			name: "Missing PLU and Articul",
			item: models.Item{
				Quantity: 10,
				Date: models.ItemDate{
					Start: "2023-01-01",
					End:   "2023-01-10",
				},
			},
			wantErr: true,
		},
		{
			name: "Invalid start date format",
			item: models.Item{
				PLU:      "123",
				Quantity: 10,
				Date: models.ItemDate{
					Start: "01-01-2023",
					End:   "2023-01-10",
				},
			},
			wantErr: true,
		},
		{
			name: "End date before start date",
			item: models.Item{
				PLU:      "123",
				Quantity: 10,
				Date: models.ItemDate{
					Start: "2023-01-10",
					End:   "2023-01-01",
				},
			},
			wantErr: true,
		},
		{
			name: "Auto-fill by PLU",
			item: models.Item{
				PLU:      "123",
				Quantity: 10,
				Date: models.ItemDate{
					Start: "2023-01-01",
					End:   "2023-01-10",
				},
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateItem(&tt.item)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateItem() error = %v, wantErr %v", err, tt.wantErr)
			}

			// Если это тест на автозаполнение, проверяем результат
			if tt.name == "Auto-fill by PLU" && !tt.wantErr {
				if tt.item.Articul != "ART-123" || tt.item.Name != "Test Item" {
					t.Errorf("AutoFill failed: got Articul=%s, Name=%s", tt.item.Articul, tt.item.Name)
				}
			}
		})
	}
}
