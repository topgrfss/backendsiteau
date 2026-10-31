import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { catalogService } from './catalog.js';
import { storage } from './storage.js';
import { validateItem } from './validator.js';
import { requireRole } from './middleware/auth.js';
import { Item, CatalogItem } from './models.js';
import { renderShowcaseHtml } from './views/showcase.js';
import { renderDashboardHtml } from './views/dashboard.js';

const app = express();

// Инициализация каталога из catalog.json
catalogService.load('catalog.json');

// Middleware
app.use(express.json());

// CORS
app.use(
  cors({
    origin: config.corsAllowedOrigin === '*' ? true : config.corsAllowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Логирование запросов
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.info(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 1. Главный вход: перенаправление на витрину для покупателей
app.get('/', (req: Request, res: Response) => {
  if (req.query.json === 'true' || (req.header('Accept') === 'application/json' && !req.accepts('html'))) {
    res.json({
      status: 'ok',
      name: 'backendsiteau',
      version: config.version,
      port: config.port
    });
    return;
  }
  res.redirect('/showcase');
});

// 2. Витрина товаров (/showcase, /vitrine, /storefront) — чисто клиентская
const showcaseHandler = (_req: Request, res: Response): void => {
  res.type('html').send(renderShowcaseHtml(config));
};
app.get('/showcase', showcaseHandler);
app.get('/vitrine', showcaseHandler);
app.get('/storefront', showcaseHandler);

// 3. Панель управления складом (/admin, /dashboard) — доступ с авторизацией
const dashboardHandler = (_req: Request, res: Response): void => {
  res.type('html').send(renderDashboardHtml(config));
};
app.get('/admin', dashboardHandler);
app.get('/dashboard', dashboardHandler);

// ======================= REST API =======================

// POST /login - авторизация
app.post('/login', (req: Request, res: Response) => {
  const password = req.body?.password;
  if (typeof password !== 'string') {
    res.status(400).json({ error: 'Неверный формат запроса' });
    return;
  }

  let role: 'admin' | 'editor' | 'viewer';
  let token: string;

  switch (password) {
    case config.adminPass:
      role = 'admin';
      token = config.adminToken;
      break;
    case config.editorPass:
      role = 'editor';
      token = config.editorToken;
      break;
    case config.viewerPass:
      role = 'viewer';
      token = config.viewerToken;
      break;
    default:
      res.status(401).json({ error: 'Неверный пароль' });
      return;
  }

  res.status(200).json({ token, role });
});

// GET /catalog & GET /api/catalog - получение всего каталога
const getCatalogHandler = (_req: Request, res: Response): void => {
  res.status(200).json(catalogService.getAllCatalogItems());
};
app.get('/catalog', getCatalogHandler);
app.get('/api/catalog', getCatalogHandler);

// POST /catalog & POST /api/catalog - добавление/обновление товара в каталоге
const addCatalogHandler = (req: Request, res: Response): void => {
  const body = req.body as CatalogItem;
  if (!body || (!body.plu && !body.articul)) {
    res.status(400).json({ error: 'Необходимо указать хотя бы PLU или Артикул для каталога' });
    return;
  }
  const entry = catalogService.addOrUpdateCatalogItem(body, true);
  res.status(200).json(entry);
};
app.post('/catalog', requireRole('editor'), addCatalogHandler);
app.post('/api/catalog', requireRole('editor'), addCatalogHandler);

// DELETE /catalog/:plu - удаление позиции из каталога (Admin)
app.delete('/catalog/:plu', requireRole('admin'), (req: Request, res: Response) => {
  const plu = String(req.params.plu);
  const deleted = catalogService.deleteCatalogItem(plu);
  if (!deleted) {
    res.status(404).json({ error: 'Позиция не найдена в каталоге' });
    return;
  }
  res.status(200).json({ message: 'Позиция успешно удалена из каталога' });
});

// PUT /catalog/:plu - обновление описания, категории и данных позиции в каталоге (Editor+)
app.put('/catalog/:plu', requireRole('editor'), (req: Request, res: Response) => {
  const plu = String(req.params.plu);
  const updates = req.body as Partial<CatalogItem>;
  const updated = catalogService.updateCatalogItem(plu, updates);
  if (!updated) {
    res.status(404).json({ error: 'Позиция не найдена в каталоге' });
    return;
  }

  // Обновляем описание и категорию у существующих партий на складе с этим PLU
  const items = storage.getAllItems();
  for (const it of items) {
    if (it.id && it.plu === plu) {
      storage.updateItem(it.id, {
        ...it,
        name: updated.name || it.name,
        category: updated.category || it.category,
        description: updated.description !== undefined ? updated.description : it.description
      });
    }
  }

  res.status(200).json(updated);
});

// GET /items/scan - поиск товара в каталоге по PLU
const scanHandler = (req: Request, res: Response): void => {
  const code = req.query.code;
  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: "Параметр 'code' (PLU код) является обязательным" });
    return;
  }

  const entry = catalogService.getScanEntry(code);
  if (!entry) {
    res.status(200).json({ found: false });
    return;
  }

  res.status(200).json({
    found: true,
    name: entry.name,
    weight: entry.weight,
    shelf_life: entry.shelfLife,
    description: entry.description,
    category: entry.category,
    articul: entry.articul
  });
};

app.get('/items/scan', scanHandler);
app.get('/api/items/scan', scanHandler);

// GET /items - список всех товаров
const getAllItemsHandler = (_req: Request, res: Response): void => {
  const items = storage.getAllItems();
  res.status(200).json(items);
};

app.get('/items', requireRole('viewer'), getAllItemsHandler);
app.get('/api/items', requireRole('viewer'), getAllItemsHandler);

// GET /items/:id - получение товара по ID
const getItemByIdHandler = (req: Request, res: Response): void => {
  const idStr = String(req.params.id);
  const id = parseInt(idStr, 10);
  if (isNaN(id) || id <= 0) {
    res.status(400).json({ error: 'Невалидный ID записи' });
    return;
  }

  const item = storage.getItemById(id);
  if (!item) {
    res.status(404).json({ error: `Запись с ID=${id} не найдена` });
    return;
  }

  res.status(200).json(item);
};

app.get('/items/:id', requireRole('viewer'), getItemByIdHandler);
app.get('/api/items/:id', requireRole('viewer'), getItemByIdHandler);

// POST /items - создание товара с автоматической регистрацией в каталоге
const createItemHandler = (req: Request, res: Response): void => {
  const item: Item = req.body;
  if (!item || typeof item !== 'object') {
    res.status(400).json({ error: 'Неверный формат JSON в теле запроса' });
    return;
  }

  try {
    validateItem(item);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: message });
    return;
  }

  // Если товара нет в каталоге, регистрируем его как новый в каталоге без заглушек
  const existingCat = catalogService.findCatalogItem(item.plu, item.articul);
  if (!existingCat) {
    let calculatedShelfLife = 10;
    try {
      const dStart = new Date(item.date.start).getTime();
      const dEnd = new Date(item.date.end).getTime();
      const days = Math.round((dEnd - dStart) / 86400000);
      if (days > 0) calculatedShelfLife = days;
    } catch {}

    catalogService.addOrUpdateCatalogItem({
      plu: item.plu || null,
      articul: item.articul || null,
      name: item.name,
      shelf_life: item.shelf_life || calculatedShelfLife,
      description: item.description && item.description.trim() ? item.description.trim() : '',
      category: item.category || 'Рыба и морепродукты',
      weight: item.weight || 0
    }, true);
  } else {
    // Обновляем описание или категорию, если оператор заполнил их
    let updated = false;
    const catUpdate = { ...existingCat };
    if (item.description && item.description.trim() !== (existingCat.description || '')) {
      catUpdate.description = item.description.trim();
      updated = true;
    }
    if (item.category && item.category !== existingCat.category) {
      catUpdate.category = item.category;
      updated = true;
    }
    if (updated) {
      catalogService.addOrUpdateCatalogItem(catUpdate, true);
    }
  }

  const id = storage.createItem(item);
  item.id = id;
  res.status(201).json(item);
};

app.post('/items', requireRole('editor'), createItemHandler);
app.post('/api/items', requireRole('editor'), createItemHandler);

// PUT /items/:id - обновление товара
const updateItemHandler = (req: Request, res: Response): void => {
  const idStr = String(req.params.id);
  const id = parseInt(idStr, 10);
  if (isNaN(id) || id <= 0) {
    res.status(400).json({ error: 'Невалидный ID записи' });
    return;
  }

  const item: Item = req.body;
  if (!item || typeof item !== 'object') {
    res.status(400).json({ error: 'Неверный формат JSON в теле запроса' });
    return;
  }

  try {
    validateItem(item);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: message });
    return;
  }

  if (item.plu || item.articul) {
    const existing = catalogService.findCatalogItem(item.plu, item.articul);
    if (existing) {
      catalogService.addOrUpdateCatalogItem({
        ...existing,
        name: item.name || existing.name,
        category: item.category || existing.category,
        description: item.description !== undefined ? item.description : (existing.description || '')
      }, true);
    }
  }

  const updated = storage.updateItem(id, item);
  if (!updated) {
    res.status(404).json({ error: `Запись с ID=${id} не найдена для обновления` });
    return;
  }

  item.id = id;
  res.status(200).json(item);
};

app.put('/items/:id', requireRole('editor'), updateItemHandler);
app.put('/api/items/:id', requireRole('editor'), updateItemHandler);

// DELETE /items/:id - удаление товара со склада
const deleteItemHandler = (req: Request, res: Response): void => {
  const idStr = String(req.params.id);
  const id = parseInt(idStr, 10);
  if (isNaN(id) || id <= 0) {
    res.status(400).json({ error: 'Невалидный ID записи' });
    return;
  }

  const deleted = storage.deleteItem(id);
  if (!deleted) {
    res.status(404).json({ error: `Запись с ID=${id} не найдена для удаления` });
    return;
  }

  res.status(200).json({
    message: `Запись с ID=${id} успешно удалена`
  });
};

app.delete('/items/:id', requireRole('admin'), deleteItemHandler);
app.delete('/api/items/:id', requireRole('admin'), deleteItemHandler);

// Ловушки для ботов (honeypot)
const trollBotHandler = (_req: Request, res: Response): void => {
  res.status(418).type('text/plain; charset=utf-8');
  res.write("Troll level 1... Holding your thread...\n");
  const interval = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(interval);
      return;
    }
    res.write("Troll level holding your thread...\n");
  }, 10000);

  _req.on('close', () => {
    clearInterval(interval);
  });
};

app.get('/wp-admin', trollBotHandler);
app.get('/wp-login.php', trollBotHandler);
app.get('/xmlrpc.php', trollBotHandler);
app.get('/.env', trollBotHandler);
app.get('/.git/config', trollBotHandler);

// Запуск сервера на 0.0.0.0:3000
const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  console.info(`=== СЕРВЕР С РОЛЯМИ запущен === Port: ${PORT}, Version: ${config.version}`);
});
