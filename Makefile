# Название выходного бинарного файла
APP_NAME := main
# Директория для сборки
BUILD_DIR := bin

# Флаги линковщика для уменьшения размера бинарника (опционально)
LDFLAGS := -w -s

.PHONY: all build run clean test tidy build-linux

# Команда по умолчанию (вызывается просто через `make`)
all: clean tidy build

# Сборка проекта
build:
	@echo "==> Собираем приложение..."
	@mkdir -p $(BUILD_DIR)
	CGO_ENABLED=1 go build -ldflags="$(LDFLAGS)" -o $(BUILD_DIR)/$(APP_NAME) ./cmd/api
	@echo "==> Сборка завершена: $(BUILD_DIR)/$(APP_NAME)"

push:
	@echo "==> Собираем приложение..."
	@mkdir -p $(BUILD_DIR)
	CGO_ENABLED=1 go build -ldflags="$(LDFLAGS)" -o $(BUILD_DIR)/$(APP_NAME) ./cmd/api
	@echo "==> Сборка завершена: $(BUILD_DIR)/$(APP_NAME)"
	ssh root@206.188.196.145 systemctl stop au-backend
	scp .env root@206.188.196.145:/root/repos/backend/au/
	scp catalog.json root@206.188.196.145:/root/repos/backend/au/
	scp bin/main root@206.188.196.145:/root/repos/backend/au
	ssh root@206.188.196.145 systemctl start au-backend

# Запуск приложения (собирает и сразу запускает)
run: build
	@echo "==> Запускаем приложение..."
	@PORT=9080 ./$(BUILD_DIR)/$(APP_NAME)

# Очистка сгенерированных файлов
clean:
	@echo "==> Очищаем старые билды..."
	@rm -rf $(BUILD_DIR)

# Запуск тестов
test:
	@echo "==> Запускаем тесты..."
	go test -v ./...

# Обновление зависимостей (go.mod / go.sum)
tidy:
	@echo "==> Обновляем модули (go mod tidy)..."
	go mod tidy

# Сборка для Linux (полезно, если ты разрабатываешь на Mac/Windows, а деплоишь на Linux сервер)
# Внимание: для кросс-компиляции CGO (sqlite3) может потребоваться установить mingw/gcc кросс-компиляторы.
build-linux:
	@echo "==> Собираем приложение для Linux (amd64)..."
	@mkdir -p $(BUILD_DIR)
	GOOS=linux GOARCH=amd64 CGO_ENABLED=1 go build -ldflags="$(LDFLAGS)" -o $(BUILD_DIR)/$(APP_NAME)-linux ./cmd/api
	@echo "==> Сборка для Linux завершена!"
