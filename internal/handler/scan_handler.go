package handler

import (
	"api-b/internal/catalog"
	"net/http"
)

// ScanLookupHandler обрабатывает GET /api/items/scan
func ScanLookupHandler(w http.ResponseWriter, r *http.Request) {
	// Получаем параметр запроса "code"
	code := r.URL.Query().Get("code")
	if code == "" {
		respondError(w, http.StatusBadRequest, "Параметр 'code' (PLU код) является обязательным")
		return
	}

	item, found := catalog.GlobalCatalog[code]

	if !found {
		// Если товар не найден в каталоге
		respondJSON(w, http.StatusOK, map[string]interface{}{"found": false})
		return
	}

	// Если товар успешно найден
	response := struct {
		Found     bool    `json:"found"`
		Name      string  `json:"name"`
		Weight    float64 `json:"weight"`
		ShelfLife int     `json:"shelf_life"`
	}{
		Found:     true,
		Name:      item.Name,
		Weight:    item.Weight,
		ShelfLife: item.ShelfLife,
	}

	respondJSON(w, http.StatusOK, response)
}
