package models

// APIError используется для возврата ошибок клиенту в формате JSON
type APIError struct {
	Error string `json:"error"`
}

// APIMessage используется для системных сообщений (например, успешное удаление)
type APIMessage struct {
	Message string `json:"message"`
}
