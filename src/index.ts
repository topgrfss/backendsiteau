import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { catalogService } from './catalog.js';
import { storage } from './storage.js';
import { validateItem } from './validator.js';
import { requireRole } from './middleware/auth.js';
import { Item } from './models.js';

const app = express();

// Initialize catalog from catalog.json
catalogService.load('catalog.json');

// Middleware
app.use(express.json());

// CORS Middleware
app.use(
  cors({
    origin: config.corsAllowedOrigin === '*' ? true : config.corsAllowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Request Logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.info(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root route: API documentation & Interactive Dashboard for AI Studio Preview
app.get('/', (req: Request, res: Response) => {
  if (req.accepts('html') && !req.accepts('json')) {
    res.type('html').send(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>backendsiteau - API Service</title>
  <style>
    :root {
      --bg: #0f172a;
      --card: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --muted: #94a3b8;
      --primary: #38bdf8;
      --primary-hover: #0284c7;
      --success: #34d399;
      --badge-admin: #f43f5e;
      --badge-editor: #f59e0b;
      --badge-viewer: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 24px;
      line-height: 1.5;
    }
    .container { max-width: 900px; margin: 0 auto; }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    h1 { font-size: 1.5rem; font-weight: 700; color: #fff; }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(52, 211, 153, 0.15);
      color: var(--success);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      border: 1px solid rgba(52, 211, 153, 0.3);
    }
    .status-dot {
      width: 8px; height: 8px; border-radius: 50%; background: var(--success);
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
    }
    .card h2 { font-size: 1.1rem; margin-bottom: 12px; color: var(--primary); }
    .endpoint {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: #090d16;
      border-radius: 6px;
      margin-bottom: 8px;
      font-family: monospace;
      font-size: 0.88rem;
    }
    .method {
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.75rem;
    }
    .method-get { background: #0284c7; color: #fff; }
    .method-post { background: #16a34a; color: #fff; }
    .method-put { background: #d97706; color: #fff; }
    .method-delete { background: #dc2626; color: #fff; }
    .badge {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: auto;
      text-transform: uppercase;
    }
    .badge-admin { background: var(--badge-admin); color: #fff; }
    .badge-editor { background: var(--badge-editor); color: #000; }
    .badge-viewer { background: var(--badge-viewer); color: #000; }
    pre {
      background: #090d16;
      padding: 12px;
      border-radius: 6px;
      font-size: 0.82rem;
      overflow-x: auto;
      color: #cbd5e1;
    }
    button {
      background: var(--primary);
      color: #0f172a;
      border: none;
      padding: 8px 14px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: var(--primary-hover); color: #fff; }
    .output {
      margin-top: 12px;
      max-height: 240px;
      overflow-y: auto;
    }
    .code-input {
      width: 100%;
      background: #090d16;
      border: 1px solid var(--border);
      color: #fff;
      padding: 8px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>backendsiteau API</h1>
        <p style="color: var(--muted); font-size: 0.9rem;">Node.js Express Server v${config.version} (Port: ${config.port})</p>
      </div>
      <div class="status-badge">
        <span class="status-dot"></span> Online
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <h2>Доступы & Роли</h2>
        <p style="font-size: 0.85rem; color: var(--muted); margin-bottom: 8px;">Пароли для авторизации через <code>POST /login</code>:</p>
        <ul style="list-style: none; font-size: 0.9rem; line-height: 1.8;">
          <li><span class="badge badge-admin">Admin</span> Пароль: <code>${config.adminPass}</code></li>
          <li><span class="badge badge-editor">Editor</span> Пароль: <code>${config.editorPass}</code></li>
          <li><span class="badge badge-viewer">Viewer</span> Пароль: <code>${config.viewerPass}</code></li>
        </ul>
      </div>

      <div class="card">
        <h2>Быстрый тест сканирования</h2>
        <p style="font-size: 0.85rem; color: var(--muted); margin-bottom: 8px;">Проверка поиска по PLU из <code>catalog.json</code> (например: 49393, 13862, 59763):</p>
        <div style="display: flex; gap: 8px;">
          <input id="scanInput" class="code-input" value="49393" placeholder="Введите PLU" />
          <button onclick="testScan()">Scan</button>
        </div>
        <div id="scanResult" class="output"></div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <h2>API Эндпоинты</h2>
      <div class="endpoint">
        <span class="method method-post">POST</span>
        <span>/login</span>
        <span style="color: var(--muted); font-size: 0.8rem;">{ "password": "..." }</span>
      </div>
      <div class="endpoint">
        <span class="method method-get">GET</span>
        <span>/items/scan?code=...</span>
        <span style="color: var(--muted); font-size: 0.8rem;">Поиск по каталогу</span>
      </div>
      <div class="endpoint">
        <span class="method method-get">GET</span>
        <span>/items</span>
        <span class="badge badge-viewer">viewer</span>
      </div>
      <div class="endpoint">
        <span class="method method-get">GET</span>
        <span>/items/:id</span>
        <span class="badge badge-viewer">viewer</span>
      </div>
      <div class="endpoint">
        <span class="method method-post">POST</span>
        <span>/items</span>
        <span class="badge badge-editor">editor</span>
      </div>
      <div class="endpoint">
        <span class="method method-put">PUT</span>
        <span>/items/:id</span>
        <span class="badge badge-editor">editor</span>
      </div>
      <div class="endpoint">
        <span class="method method-delete">DELETE</span>
        <span>/items/:id</span>
        <span class="badge badge-admin">admin</span>
      </div>
    </div>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2>Просмотр товаров (/items)</h2>
        <button onclick="fetchItems()">Загрузить список</button>
      </div>
      <div id="itemsResult" class="output"><pre>Нажмите "Загрузить список" для проверки запроса с токеном Viewer</pre></div>
    </div>
  </div>

  <script>
    async function testScan() {
      const code = document.getElementById('scanInput').value.trim();
      const resEl = document.getElementById('scanResult');
      resEl.innerHTML = 'Загрузка...';
      try {
        const res = await fetch('/items/scan?code=' + encodeURIComponent(code));
        const data = await res.json();
        resEl.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      } catch (err) {
        resEl.innerHTML = '<pre style="color:#ef4444">' + err.message + '</pre>';
      }
    }

    async function fetchItems() {
      const resEl = document.getElementById('itemsResult');
      resEl.innerHTML = 'Загрузка товаров...';
      try {
        const res = await fetch('/items', {
          headers: { 'Authorization': 'Bearer ${config.viewerToken}' }
        });
        const data = await res.json();
        resEl.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      } catch (err) {
        resEl.innerHTML = '<pre style="color:#ef4444">' + err.message + '</pre>';
      }
    }
  </script>
</body>
</html>`);
    return;
  }

  res.json({
    status: 'ok',
    name: 'backendsiteau',
    version: config.version,
    port: config.port
  });
});

// Authentication endpoint
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

// Scan item lookup endpoint (supports both /items/scan and /api/items/scan)
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
    shelf_life: entry.shelfLife
  });
};

app.get('/items/scan', scanHandler);
app.get('/api/items/scan', scanHandler);

// GET /items (supports /items and /api/items)
const getAllItemsHandler = (req: Request, res: Response): void => {
  const items = storage.getAllItems();
  res.status(200).json(items);
};

app.get('/items', requireRole('viewer'), getAllItemsHandler);
app.get('/api/items', requireRole('viewer'), getAllItemsHandler);

// GET /items/:id (supports /items/:id and /api/items/:id)
const getItemByIdHandler = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id as string, 10);
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

// POST /items (supports /items and /api/items)
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

  const id = storage.createItem(item);
  item.id = id;
  res.status(201).json(item);
};

app.post('/items', requireRole('editor'), createItemHandler);
app.post('/api/items', requireRole('editor'), createItemHandler);

// PUT /items/:id (supports /items/:id and /api/items/:id)
const updateItemHandler = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id as string, 10);
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

// DELETE /items/:id (supports /items/:id and /api/items/:id)
const deleteItemHandler = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id as string, 10);
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

// Honeypot / Troll bot routes (from Go troll_handler)
const trollBotHandler = (req: Request, res: Response): void => {
  res.status(418).type('text/plain; charset=utf-8');
  res.write("Troll level 1... Holding your thread...\n");
  const interval = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(interval);
      return;
    }
    res.write("Troll level holding your thread...\n");
  }, 10000);

  req.on('close', () => {
    clearInterval(interval);
  });
};

app.get('/wp-admin', trollBotHandler);
app.get('/wp-login.php', trollBotHandler);
app.get('/xmlrpc.php', trollBotHandler);
app.get('/.env', trollBotHandler);
app.get('/.git/config', trollBotHandler);

// Listen on 0.0.0.0:3000
const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  console.info(`=== СЕРВЕР С РОЛЯМИ запущен === Port: ${PORT}, Version: ${config.version}`);
});
