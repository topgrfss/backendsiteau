package models

// CatalogItem описывает структуру одного товара из каталога.
//
// КОММЕНТАРИЙ ДЛЯ ПОЛЬЗОВАТЕЛЯ:
// Если структура вашего JSON-файла отличается от этой стандартной структуры,
// вы можете изменить теги `json:"..."` ниже. Например, если в вашем JSON-файле
// поле имени называется "title", а не "name", измените тег на `json:"title"`.
//
// Обратите внимание: в вашем текущем файле catalog.json отсутствуют поля 'weight' и 'shelf_life'.
// Если вы добавите их в catalog.json в будущем, например:
//
//	{"plu": "49393", "articul": null, "name": "форель карелия 2+", "weight": 1.5, "shelf_life": 14}
//
// то этот код автоматически их распарсит и сохранит.
type CatalogItem struct {
	Name      string  `json:"name"`
	Weight    float64 `json:"weight"`
	ShelfLife int     `json:"shelf_life"`
}
