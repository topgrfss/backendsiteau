import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { catalogService } from './catalog.js';
import { storage } from './storage.js';
import { validateItem } from './validator.js';
import { requireRole } from './middleware/auth.js';
import { Item, CatalogItem } from './models.js';

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

// Главная страница: Веб-панель управления товарами и сроками годности
app.get('/', (req: Request, res: Response) => {
  if (req.accepts('html') && !req.accepts('json')) {
    res.type('html').send(renderDashboardHtml());
    return;
  }

  res.json({
    status: 'ok',
    name: 'backendsiteau',
    version: config.version,
    port: config.port
  });
});

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

  // Если товара нет в каталоге, регистрируем его как новый в каталоге, чтобы в будущем подтягивался
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
      description: item.description || `Товар "${item.name}" (добавлен оператором)`,
      weight: item.weight || 0
    }, true);
  } else if (item.description && !existingCat.description) {
    catalogService.addOrUpdateCatalogItem({
      ...existingCat,
      description: item.description
    }, true);
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

  // Обновляем описание или срок в каталоге при наличии
  if (item.plu || item.articul) {
    const existing = catalogService.findCatalogItem(item.plu, item.articul);
    if (existing && item.description && item.description !== existing.description) {
      catalogService.addOrUpdateCatalogItem({
        ...existing,
        description: item.description
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

// DELETE /items/:id - удаление товара
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

// Ловушки для сканеров / ботов (honeypot)
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

// Генерация HTML для панели управления товарами и сроками годности
function renderDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Управление товарами и сроками годности</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1f293d;
      --card-hover: #172133;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --accent: #38bdf8;
      --accent-hover: #0284c7;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --purple: #8b5cf6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #0d1322;
      border-bottom: 1px solid var(--card-border);
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
    }
    .brand h1 {
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
    }
    .brand p {
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .role-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #172133;
      padding: 4px 10px;
      border-radius: 8px;
      border: 1px solid var(--card-border);
      font-size: 0.85rem;
    }
    .role-selector select {
      background: transparent;
      border: none;
      color: #fff;
      font-weight: 600;
      font-size: 0.85rem;
      outline: none;
      cursor: pointer;
    }
    .role-badge {
      font-size: 0.72rem;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .role-admin { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
    .role-editor { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .role-viewer { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .nav-tabs {
      background: #0f172a;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      padding: 0 24px;
      gap: 8px;
      overflow-x: auto;
    }
    .tab-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      padding: 12px 16px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .tab-btn:hover { color: #fff; }
    .tab-btn.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }
    main {
      flex: 1;
      padding: 24px;
      max-width: 1280px;
      margin: 0 auto;
      width: 100%;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-2px); }
    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }
    .stat-num { font-size: 1.5rem; font-weight: 700; color: #fff; line-height: 1.1; }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }
    .filter-bar {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 20px;
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
    }
    .search-box {
      flex: 1;
      min-width: 260px;
      position: relative;
    }
    .search-input {
      width: 100%;
      background: #090d16;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 9px 12px 9px 36px;
      color: #fff;
      font-size: 0.9rem;
      outline: none;
    }
    .search-input:focus { border-color: var(--accent); }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
    }
    .filter-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .chip {
      background: #172133;
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .chip:hover { color: #fff; border-color: var(--accent); }
    .chip.active { background: var(--accent); color: #090d16; border-color: var(--accent); }
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 16px;
    }
    .item-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;
    }
    .item-card:hover {
      border-color: #334155;
      background: var(--card-hover);
    }
    .item-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
    }
    .item-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
      text-transform: capitalize;
    }
    .item-codes {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 4px;
    }
    .code-tag {
      background: #090d16;
      border: 1px solid var(--card-border);
      font-size: 0.72rem;
      font-family: monospace;
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--accent);
    }
    .item-desc {
      font-size: 0.84rem;
      color: #94a3b8;
      background: #0d1424;
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 3px solid var(--accent);
      line-height: 1.4;
    }
    .item-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      background: #090d16;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid var(--card-border);
    }
    .metric-item { display: flex; flex-direction: column; }
    .metric-title { font-size: 0.72rem; color: var(--text-muted); }
    .metric-val { font-size: 0.95rem; font-weight: 700; color: #fff; }
    .expiry-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.83rem;
      font-weight: 600;
    }
    .exp-fresh { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .exp-warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .exp-expired { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .item-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px solid var(--card-border);
    }
    .btn-action {
      background: #1e293b;
      border: 1px solid var(--card-border);
      color: #e2e8f0;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-action:hover { background: #334155; color: #fff; }
    .btn-danger { color: #f87171; }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.2); border-color: #f87171; }
    .form-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 24px;
      max-width: 680px;
      margin: 0 auto;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 6px;
    }
    .form-hint {
      font-size: 0.76rem;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .form-control {
      width: 100%;
      background: #090d16;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 10px 14px;
      color: #fff;
      font-size: 0.92rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-control:focus { border-color: var(--accent); }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .catalog-match-alert {
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.85rem;
      display: none;
      align-items: center;
      gap: 10px;
    }
    .match-found { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; }
    .match-new { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; }
    .btn-primary {
      background: var(--accent);
      color: #090d16;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      transition: background 0.2s;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-primary:hover { background: var(--accent-hover); color: #fff; }
    .catalog-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    .catalog-table th {
      background: #172133;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #cbd5e1;
      border-bottom: 1px solid var(--card-border);
    }
    .catalog-table td {
      padding: 12px;
      border-bottom: 1px solid var(--card-border);
      color: #f1f5f9;
    }
    .catalog-table tr:hover td { background: rgba(255, 255, 255, 0.02); }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
    }
    .empty-state-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.6; }
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 12px 20px;
      border-radius: 8px;
      background: #1e293b;
      color: #fff;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      border: 1px solid var(--card-border);
      z-index: 999;
      display: none;
      animation: fadeIn 0.3s;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-icon">🐟</div>
      <div>
        <h1>Siteau — Панель товаров</h1>
        <p>Учет остатков, сроков годности и справочник PLU</p>
      </div>
    </div>
    <div class="header-actions">
      <div class="role-selector">
        <span>Роль:</span>
        <select id="activeRoleSelect" onchange="changeActiveRole(this.value)">
          <option value="admin">Администратор (Admin)</option>
          <option value="editor" selected>Редактор (Editor)</option>
          <option value="viewer">Наблюдатель (Viewer)</option>
        </select>
        <span id="roleBadge" class="role-badge role-editor">Editor</span>
      </div>
    </div>
  </header>

  <nav class="nav-tabs">
    <button class="tab-btn active" onclick="switchTab('items')">
      <span>📦</span> Склад и Сроки годности
    </button>
    <button class="tab-btn" onclick="switchTab('add')">
      <span>➕</span> Добавить товар
    </button>
    <button class="tab-btn" onclick="switchTab('scan')">
      <span>🔍</span> Сканер PLU
    </button>
    <button class="tab-btn" onclick="switchTab('catalog')">
      <span>📚</span> Справочник каталога (<span id="catCount">0</span>)
    </button>
  </nav>

  <main>
    <!-- Вкладка: Склад и Сроки годности -->
    <section id="tab-items">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">📦</div>
          <div>
            <div id="statTotalItems" class="stat-num">0</div>
            <div class="stat-label">Всего позиций на складе</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">⚖️</div>
          <div>
            <div id="statTotalQty" class="stat-num">0</div>
            <div class="stat-label">Общее количество (ед/кг)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">🟢</div>
          <div>
            <div id="statFreshItems" class="stat-num">0</div>
            <div class="stat-label">Свежие партии (>3 дн.)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">🟡</div>
          <div>
            <div id="statWarningItems" class="stat-num">0</div>
            <div class="stat-label">Истекают скоро (&le;3 дн.)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(239, 68, 68, 0.15); color: #f87171;">🔴</div>
          <div>
            <div id="statExpiredItems" class="stat-num">0</div>
            <div class="stat-label">Просрочено</div>
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="searchInput" class="search-input" placeholder="Поиск по названию, PLU или артикулу..." oninput="filterItems()" />
        </div>
        <div class="filter-chips">
          <div class="chip active" data-filter="all" onclick="setFilter('all', this)">Все товары</div>
          <div class="chip" data-filter="fresh" onclick="setFilter('fresh', this)">🟢 Свежие</div>
          <div class="chip" data-filter="warning" onclick="setFilter('warning', this)">🟡 Скоро истекают</div>
          <div class="chip" data-filter="expired" onclick="setFilter('expired', this)">🔴 Просроченные</div>
        </div>
      </div>

      <div id="itemsContainer" class="items-grid">
        <!-- Карточки товаров генерируются скриптом -->
      </div>
    </section>

    <!-- Вкладка: Добавить товар -->
    <section id="tab-add" style="display: none;">
      <div class="form-card">
        <h2 style="font-size: 1.25rem; margin-bottom: 6px;">Поступление / Добавление товара</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px;">
          Введите PLU код для автоматического заполнения названия, срока годности и описания из справочника. Новые товары автоматически регистрируются в каталоге!
        </p>

        <div id="catalogMatchAlert" class="catalog-match-alert"></div>

        <form id="addItemForm" onsubmit="handleAddItem(event)">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">PLU код</label>
              <input type="text" id="addPlu" class="form-control" placeholder="Напр. 49393" oninput="onPluInput(this.value)" />
              <div class="form-hint">Поиск в справочнике происходит моментально</div>
            </div>
            <div class="form-group">
              <label class="form-label">Артикул (необязательно)</label>
              <input type="text" id="addArticul" class="form-control" placeholder="Напр. 289649" oninput="onArticulInput(this.value)" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Наименование товара *</label>
            <input type="text" id="addName" class="form-control" placeholder="Напр. Форель Карелия 2+" required />
          </div>

          <div class="form-group">
            <label class="form-label">Краткое описание товара (из каталога)</label>
            <textarea id="addDescription" class="form-control" rows="2" placeholder="Краткое описание, характеристики, вид разделки..."></textarea>
            <div class="form-hint">Будет сохранено в каталог и показано на карточке товара</div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Количество (ед / кг) *</label>
              <input type="number" step="0.1" min="0.1" id="addQuantity" class="form-control" placeholder="10.0" required />
            </div>
            <div class="form-group">
              <label class="form-label">Срок годности (дней)</label>
              <input type="number" id="addShelfLife" class="form-control" value="10" min="1" oninput="recalcEndDate()" />
              <div class="form-hint">Используется для авто-расчета даты окончания</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Дата изготовления / начала (date.start) *</label>
              <input type="date" id="addDateStart" class="form-control" required onchange="recalcEndDate()" />
            </div>
            <div class="form-group">
              <label class="form-label">Годен до (date.end) *</label>
              <input type="date" id="addDateEnd" class="form-control" required />
            </div>
          </div>

          <button type="submit" class="btn-primary" style="margin-top: 10px;">
            <span>➕</span> Сохранить и принять на склад
          </button>
        </form>
      </div>
    </section>

    <!-- Вкладка: Сканер PLU -->
    <section id="tab-scan" style="display: none;">
      <div class="form-card" style="max-width: 550px;">
        <h2 style="font-size: 1.25rem; margin-bottom: 6px;">Быстрый поиск по PLU</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px;">
          Проверка наличия позиции в справочнике <code>catalog.json</code>
        </p>
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <input type="text" id="scanQueryInput" class="form-control" placeholder="Введите PLU (напр. 49393, 13862, 50890)" />
          <button class="btn-primary" style="width: auto; padding: 0 20px;" onclick="performScan()">Найти</button>
        </div>

        <div id="scanResultBox">
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <p>Введите PLU код для проверки данных и описания из каталога</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Вкладка: Справочник каталога -->
    <section id="tab-catalog" style="display: none;">
      <div class="filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="catalogSearchInput" class="search-input" placeholder="Поиск в справочнике каталога..." oninput="filterCatalogTable()" />
        </div>
        <div>
          <button class="btn-action" onclick="loadCatalogData()">🔄 Обновить справочник</button>
        </div>
      </div>

      <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; overflow: hidden;">
        <table class="catalog-table">
          <thead>
            <tr>
              <th>PLU</th>
              <th>Артикул</th>
              <th>Наименование</th>
              <th>Срок (дней)</th>
              <th>Краткое описание (catalog)</th>
            </tr>
          </thead>
          <tbody id="catalogTableBody">
            <!-- Строки каталога -->
          </tbody>
        </table>
      </div>
    </section>
  </main>

  <div id="toast" class="toast"></div>

  <script>
    const TOKENS = {
      admin: "${config.adminToken}",
      editor: "${config.editorToken}",
      viewer: "${config.viewerToken}"
    };

    let currentRole = 'editor';
    let currentToken = TOKENS[currentRole];
    let allItems = [];
    let currentFilter = 'all';
    let catalogList = [];

    function showToast(message, isError = false) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.style.borderColor = isError ? '#ef4444' : '#10b981';
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }

    function changeActiveRole(newRole) {
      currentRole = newRole;
      currentToken = TOKENS[newRole];
      const badge = document.getElementById('roleBadge');
      badge.textContent = newRole.toUpperCase();
      badge.className = 'role-badge role-' + newRole;
      showToast('Активирована роль: ' + newRole);
      loadItems();
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      event.currentTarget.classList.add('active');

      document.getElementById('tab-items').style.display = tabId === 'items' ? 'block' : 'none';
      document.getElementById('tab-add').style.display = tabId === 'add' ? 'block' : 'none';
      document.getElementById('tab-scan').style.display = tabId === 'scan' ? 'block' : 'none';
      document.getElementById('tab-catalog').style.display = tabId === 'catalog' ? 'block' : 'none';

      if (tabId === 'items') loadItems();
      if (tabId === 'catalog') loadCatalogData();
      if (tabId === 'add') initAddForm();
    }

    function initAddForm() {
      const today = new Date().toISOString().split('T')[0];
      const startEl = document.getElementById('addDateStart');
      if (!startEl.value) {
        startEl.value = today;
        recalcEndDate();
      }
    }

    function recalcEndDate() {
      const startStr = document.getElementById('addDateStart').value;
      const shelfDays = parseInt(document.getElementById('addShelfLife').value, 10) || 10;
      if (!startStr) return;
      const d = new Date(startStr);
      d.setDate(d.getDate() + shelfDays);
      document.getElementById('addDateEnd').value = d.toISOString().split('T')[0];
    }

    async function onPluInput(plu) {
      const trimmed = plu.trim();
      const alertBox = document.getElementById('catalogMatchAlert');
      if (!trimmed) {
        alertBox.style.display = 'none';
        return;
      }

      try {
        const res = await fetch('/items/scan?code=' + encodeURIComponent(trimmed));
        const data = await res.json();
        if (data.found) {
          alertBox.className = 'catalog-match-alert match-found';
          alertBox.style.display = 'flex';
          alertBox.innerHTML = '<span>✅ Товар найден в справочнике: <strong>' + data.name + '</strong></span>';
          document.getElementById('addName').value = data.name;
          if (data.shelf_life) {
            document.getElementById('addShelfLife').value = data.shelf_life;
            recalcEndDate();
          }
          if (data.description) {
            document.getElementById('addDescription').value = data.description;
          }
          if (data.articul) {
            document.getElementById('addArticul').value = data.articul;
          }
        } else {
          alertBox.className = 'catalog-match-alert match-new';
          alertBox.style.display = 'flex';
          alertBox.innerHTML = '<span>✨ Новый товар! Будет автоматически добавлен в справочник каталога</span>';
        }
      } catch (err) {
        console.error(err);
      }
    }

    function onArticulInput(articul) {
      // Можно дополнить поиск по артикулу
    }

    async function loadCatalogData() {
      try {
        const res = await fetch('/catalog');
        catalogList = await res.json();
        document.getElementById('catCount').textContent = catalogList.length;
        renderCatalogTable(catalogList);
      } catch (err) {
        console.error('Ошибка загрузки каталога:', err);
      }
    }

    function renderCatalogTable(list) {
      const tbody = document.getElementById('catalogTableBody');
      if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#9ca3af; padding:30px;">Справочник пуст</td></tr>';
        return;
      }
      tbody.innerHTML = list.map(item => \`
        <tr>
          <td><span class="code-tag">\${item.plu || '—'}</span></td>
          <td><span class="code-tag" style="color:#cbd5e1;">\${item.articul || '—'}</span></td>
          <td style="font-weight:600; text-transform:capitalize;">\${item.name}</td>
          <td>\${item.shelf_life ? item.shelf_life + ' дн.' : '—'}</td>
          <td style="color:#94a3b8; font-size:0.83rem;">\${item.description || '—'}</td>
        </tr>
      \`).join('');
    }

    function filterCatalogTable() {
      const q = document.getElementById('catalogSearchInput').value.toLowerCase().trim();
      const filtered = catalogList.filter(item => {
        return (item.name && item.name.toLowerCase().includes(q)) ||
               (item.plu && item.plu.toLowerCase().includes(q)) ||
               (item.articul && item.articul.toLowerCase().includes(q)) ||
               (item.description && item.description.toLowerCase().includes(q));
      });
      renderCatalogTable(filtered);
    }

    function getDaysDiff(endIso) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const end = new Date(endIso);
      end.setHours(0,0,0,0);
      return Math.round((end - today) / (1000 * 60 * 60 * 24));
    }

    async function loadItems() {
      try {
        const res = await fetch('/items', {
          headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        if (!res.ok) {
          const err = await res.json();
          showToast(err.error || 'Ошибка загрузки товаров', true);
          return;
        }
        allItems = await res.json();
        updateStats();
        filterItems();
      } catch (err) {
        showToast('Сетевая ошибка: ' + err.message, true);
      }
    }

    function updateStats() {
      document.getElementById('statTotalItems').textContent = allItems.length;
      const totalQty = allItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      document.getElementById('statTotalQty').textContent = totalQty.toFixed(1);

      let fresh = 0, warning = 0, expired = 0;
      for (const item of allItems) {
        const days = getDaysDiff(item.date.end);
        if (days < 0) expired++;
        else if (days <= 3) warning++;
        else fresh++;
      }
      document.getElementById('statFreshItems').textContent = fresh;
      document.getElementById('statWarningItems').textContent = warning;
      document.getElementById('statExpiredItems').textContent = expired;
    }

    function setFilter(filter, el) {
      currentFilter = filter;
      document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      filterItems();
    }

    function filterItems() {
      const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
      const container = document.getElementById('itemsContainer');

      const filtered = allItems.filter(item => {
        const days = getDaysDiff(item.date.end);
        let matchFilter = true;
        if (currentFilter === 'fresh') matchFilter = days > 3;
        else if (currentFilter === 'warning') matchFilter = days >= 0 && days <= 3;
        else if (currentFilter === 'expired') matchFilter = days < 0;

        if (!matchFilter) return false;
        if (!q) return true;

        return (item.name && item.name.toLowerCase().includes(q)) ||
               (item.plu && item.plu.toLowerCase().includes(q)) ||
               (item.articul && item.articul.toLowerCase().includes(q)) ||
               (item.description && item.description.toLowerCase().includes(q));
      });

      if (!filtered.length) {
        container.innerHTML = \`
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">📦</div>
            <p>Товары не найдены</p>
          </div>
        \`;
        return;
      }

      container.innerHTML = filtered.map(item => {
        const days = getDaysDiff(item.date.end);
        let expClass = 'exp-fresh';
        let expText = '🟢 Свежий — осталось ' + days + ' дн.';
        if (days < 0) {
          expClass = 'exp-expired';
          expText = '🔴 Истёк срок (просрочено на ' + Math.abs(days) + ' дн.)';
        } else if (days === 0) {
          expClass = 'exp-warning';
          expText = '🟡 Внимание! Истекает сегодня';
        } else if (days <= 3) {
          expClass = 'exp-warning';
          expText = '🟡 Внимание! Истекает через ' + days + ' дн.';
        }

        return \`
          <div class="item-card">
            <div class="item-card-top">
              <div>
                <div class="item-title">\${item.name}</div>
                <div class="item-codes">
                  \${item.plu ? '<span class="code-tag">PLU: ' + item.plu + '</span>' : ''}
                  \${item.articul ? '<span class="code-tag">АРТ: ' + item.articul + '</span>' : ''}
                  <span class="code-tag" style="color:#94a3b8;">ID: #\${item.id}</span>
                </div>
              </div>
            </div>

            \${item.description ? '<div class="item-desc">' + item.description + '</div>' : ''}

            <div class="item-metrics">
              <div class="metric-item">
                <span class="metric-title">Количество</span>
                <span class="metric-val" style="color:var(--accent);">\${item.quantity} ед/кг</span>
              </div>
              <div class="metric-item">
                <span class="metric-title">Срок партии</span>
                <span class="metric-val" style="font-size:0.85rem;">\${item.date.start} → \${item.date.end}</span>
              </div>
            </div>

            <div class="expiry-banner \${expClass}">
              <span>\${expText}</span>
              \${item.shelf_life ? '<span style="font-size:0.75rem; opacity:0.8;">(норма: ' + item.shelf_life + ' дн.)</span>' : ''}
            </div>

            <div class="item-actions">
              <button class="btn-action" onclick="quickEditQuantity(\${item.id}, \${item.quantity})">✏️ Кол-во</button>
              <button class="btn-action btn-danger" onclick="deleteItem(\${item.id})">🗑 Удалить</button>
            </div>
          </div>
        \`;
      }).join('');
    }

    async function handleAddItem(e) {
      e.preventDefault();
      const item = {
        name: document.getElementById('addName').value.trim(),
        plu: document.getElementById('addPlu').value.trim(),
        articul: document.getElementById('addArticul').value.trim(),
        quantity: parseFloat(document.getElementById('addQuantity').value),
        description: document.getElementById('addDescription').value.trim(),
        shelf_life: parseInt(document.getElementById('addShelfLife').value, 10) || 10,
        date: {
          start: document.getElementById('addDateStart').value,
          end: document.getElementById('addDateEnd').value
        }
      };

      try {
        const res = await fetch('/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + currentToken
          },
          body: JSON.stringify(item)
        });

        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || 'Ошибка добавления товара', true);
          return;
        }

        showToast('Товар "' + data.name + '" успешно принят на склад!');
        document.getElementById('addItemForm').reset();
        document.getElementById('catalogMatchAlert').style.display = 'none';
        initAddForm();
        loadCatalogData();
        switchTab('items');
      } catch (err) {
        showToast('Ошибка сети: ' + err.message, true);
      }
    }

    async function quickEditQuantity(id, currentQty) {
      if (currentRole === 'viewer') {
        showToast('Для изменения остатков требуются права Editor или Admin', true);
        return;
      }
      const newQtyStr = prompt('Введите новое количество (текущее: ' + currentQty + '):', currentQty);
      if (newQtyStr === null) return;
      const newQty = parseFloat(newQtyStr);
      if (isNaN(newQty) || newQty <= 0) {
        alert('Количество должно быть числом больше 0');
        return;
      }

      const item = allItems.find(i => i.id === id);
      if (!item) return;

      const updatedItem = { ...item, quantity: newQty };
      try {
        const res = await fetch('/items/' + id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + currentToken
          },
          body: JSON.stringify(updatedItem)
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || 'Ошибка обновления', true);
          return;
        }
        showToast('Количество обновлено: ' + newQty);
        loadItems();
      } catch (err) {
        showToast('Ошибка сети: ' + err.message, true);
      }
    }

    async function deleteItem(id) {
      if (currentRole !== 'admin') {
        showToast('Удаление товара разрешено только Администратору (Admin)', true);
        return;
      }
      if (!confirm('Вы уверены, что хотите удалить позицию #' + id + '?')) return;

      try {
        const res = await fetch('/items/' + id, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || 'Ошибка удаления', true);
          return;
        }
        showToast('Товар #' + id + ' удален');
        loadItems();
      } catch (err) {
        showToast('Ошибка сети: ' + err.message, true);
      }
    }

    async function performScan() {
      const code = document.getElementById('scanQueryInput').value.trim();
      const resBox = document.getElementById('scanResultBox');
      if (!code) {
        resBox.innerHTML = '<div class="empty-state"><p style="color:#f87171;">Введите PLU код для поиска</p></div>';
        return;
      }

      resBox.innerHTML = '<div class="empty-state"><p>Поиск в catalog.json...</p></div>';

      try {
        const res = await fetch('/items/scan?code=' + encodeURIComponent(code));
        const data = await res.json();
        if (!data.found) {
          resBox.innerHTML = \`
            <div style="background:#172133; border:1px solid #334155; border-radius:10px; padding:20px; text-align:center;">
              <div style="font-size:32px; margin-bottom:8px;">❌</div>
              <h3 style="color:#f87171; margin-bottom:6px;">Товар с PLU "\${code}" не найден в справочнике</h3>
              <p style="color:#94a3b8; font-size:0.85rem; margin-bottom:14px;">Вы можете добавить его на вкладке "Добавить товар", и он автоматически сохранится в каталог.</p>
              <button class="btn-action" onclick="goToAddWithPlu('\${code}')">➕ Добавить новый товар с этим PLU</button>
            </div>
          \`;
          return;
        }

        resBox.innerHTML = \`
          <div style="background:#172133; border:1px solid rgba(16,185,129,0.3); border-radius:10px; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <span class="role-badge role-viewer">✅ Найден в каталоге</span>
              <span class="code-tag">PLU: \${code}</span>
            </div>
            <h3 style="font-size:1.2rem; color:#fff; text-transform:capitalize; margin-bottom:8px;">\${data.name}</h3>
            \${data.description ? '<div class="item-desc" style="margin-bottom:12px;">' + data.description + '</div>' : ''}
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.85rem; color:#cbd5e1; margin-bottom:16px;">
              <div>Срок годности: <strong>\${data.shelf_life || '—'} дней</strong></div>
              <div>Артикул: <strong>\${data.articul || '—'}</strong></div>
            </div>
            <button class="btn-primary" style="width:100%;" onclick="goToAddWithPlu('\${code}')">
              Принять этот товар на склад
            </button>
          </div>
        \`;
      } catch (err) {
        resBox.innerHTML = '<div class="empty-state"><p style="color:#f87171;">Ошибка: ' + err.message + '</p></div>';
      }
    }

    function goToAddWithPlu(plu) {
      document.querySelectorAll('.tab-btn')[1].click();
      document.getElementById('addPlu').value = plu;
      onPluInput(plu);
    }

    // Инициализация при загрузке
    initAddForm();
    loadItems();
    loadCatalogData();
  </script>
</body>
</html>`;
}

// Запуск сервера на 0.0.0.0:3000
const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  console.info(`=== СЕРВЕР С РОЛЯМИ запущен === Port: ${PORT}, Version: ${config.version}`);
});
