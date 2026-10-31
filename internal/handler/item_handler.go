package handler

import (
	"api-b/internal/models"
	"api-b/internal/service"
	"api-b/internal/storage"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

type ItemHandler struct {
	store *storage.Storage
}

func NewItemHandler(store *storage.Storage) *ItemHandler {
	return &ItemHandler{store: store}
}

func (h *ItemHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	items, err := h.store.GetAllItems(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Ошибка чтения из базы данных: "+err.Error())
		return
	}
	respondJSON(w, http.StatusOK, items)
}

func (h *ItemHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || id <= 0 {
		respondError(w, http.StatusBadRequest, "Невалидный ID записи")
		return
	}

	item, err := h.store.GetItemByID(r.Context(), id)
	if err == sql.ErrNoRows {
		respondError(w, http.StatusNotFound, fmt.Sprintf("Запись с ID=%d не найдена", id))
		return
	} else if err != nil {
		respondError(w, http.StatusInternalServerError, "Ошибка обращения к БД: "+err.Error())
		return
	}

	respondJSON(w, http.StatusOK, item)
}

func (h *ItemHandler) Create(w http.ResponseWriter, r *http.Request) {
	var item models.Item
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		respondError(w, http.StatusBadRequest, "Неверный формат JSON в теле запроса")
		return
	}

	if err := service.ValidateItem(&item); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	lastID, err := h.store.CreateItem(r.Context(), &item)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Ошибка сохранения в БД: "+err.Error())
		return
	}
	item.ID = lastID
	respondJSON(w, http.StatusCreated, item)
}

func (h *ItemHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || id <= 0 {
		respondError(w, http.StatusBadRequest, "Невалидный ID записи")
		return
	}

	var item models.Item
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		respondError(w, http.StatusBadRequest, "Неверный формат JSON в теле запроса")
		return
	}

	if err := service.ValidateItem(&item); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	exists, err := h.store.UpdateItem(r.Context(), id, &item)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Ошибка обновления в БД: "+err.Error())
		return
	}
	if !exists {
		respondError(w, http.StatusNotFound, fmt.Sprintf("Запись с ID=%d не найдена для обновления", id))
		return
	}

	item.ID = id
	respondJSON(w, http.StatusOK, item)
}

func (h *ItemHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || id <= 0 {
		respondError(w, http.StatusBadRequest, "Невалидный ID записи")
		return
	}

	deleted, err := h.store.DeleteItem(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Ошибка удаления записи: "+err.Error())
		return
	}
	if !deleted {
		respondError(w, http.StatusNotFound, fmt.Sprintf("Запись с ID=%d не найдена для удаления", id))
		return
	}

	respondJSON(w, http.StatusOK, models.APIMessage{
		Message: fmt.Sprintf("Запись с ID=%d успешно удалена", id),
	})
}
