package models

// ItemDate представляет вложенный объект дат в JSON
type ItemDate struct {
	Start string `json:"start"`
	End   string `json:"end"`
}

// Item представляет основную структуру товара
type Item struct {
	ID       int64    `json:"id,omitempty"`
	Name     string   `json:"name"`
	PLU      string   `json:"plu"`
	Articul  string   `json:"articul"`
	Quantity float64  `json:"quantity"`
	Date     ItemDate `json:"date"`
}
