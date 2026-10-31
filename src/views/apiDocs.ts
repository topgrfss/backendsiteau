import { AppConfig } from '../config.js';

export function renderApiDocsHtml(config: AppConfig): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>API Документация — Siteau Backend</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1f293d;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
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
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }
    .nav-links { display: flex; gap: 12px; }
    .nav-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      padding: 8px 14px;
      border-radius: 8px;
      background: #172133;
      border: 1px solid var(--card-border);
      transition: all 0.2s;
    }
    .nav-link:hover { color: #fff; border-color: var(--accent); }
    main {
      flex: 1;
      max-width: 1000px;
      width: 100%;
      margin: 0 auto;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .doc-section {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 24px;
    }
    h2 { font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 16px; }
    .ep-row {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #090d16;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 10px;
      font-family: monospace;
      font-size: 0.9rem;
      flex-wrap: wrap;
    }
    .method {
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.75rem;
      text-transform: uppercase;
    }
    .m-get { background: #0284c7; color: #fff; }
    .m-post { background: #16a34a; color: #fff; }
    .m-put { background: #d97706; color: #fff; }
    .m-delete { background: #dc2626; color: #fff; }
    .badge-role {
      margin-left: auto;
      font-size: 0.72rem;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .role-admin { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
    .role-editor { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .role-viewer { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    pre {
      background: #090d16;
      border: 1px solid var(--card-border);
      padding: 12px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 0.85rem;
      color: #cbd5e1;
      overflow-x: auto;
      margin-top: 8px;
    }
    code {
      background: #172133;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      color: var(--accent);
    }
  </style>
</head>
<body>
  <header>
    <a href="/" class="brand">
      <div class="brand-icon">🐟</div>
      <div>
        <strong style="color: #fff; font-size: 1.15rem;">Siteau API Docs</strong>
        <div style="font-size: 0.78rem; color: var(--text-muted);">Техническое описание эндпоинтов v${config.version}</div>
      </div>
    </a>
    <div class="nav-links">
      <a href="/showcase" class="nav-link" style="background:var(--accent); color:#090d16;">🌟 Витрина</a>
      <a href="/dashboard" class="nav-link">📦 Склад</a>
      <a href="/" class="nav-link">🏠 Портал</a>
    </div>
  </header>

  <main>
    <div class="doc-section">
      <h2>🔐 Авторизация & Ролевая модель (RBAC)</h2>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 14px;">
        Для доступа к защищенным маршрутам передавайте заголовок <code>Authorization: Bearer &lt;TOKEN&gt;</code>.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
        <div style="background: #090d16; border: 1px solid var(--card-border); padding: 14px; border-radius: 8px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <strong style="color:#f87171;">Администратор (Admin)</strong>
            <span class="badge-role role-admin">Полный доступ</span>
          </div>
          <div style="font-size:0.84rem; color:var(--text-muted);">Пароль: <code>${config.adminPass}</code></div>
          <div style="font-size:0.84rem; color:var(--text-muted); margin-top:4px;">Токен: <code>${config.adminToken}</code></div>
        </div>

        <div style="background: #090d16; border: 1px solid var(--card-border); padding: 14px; border-radius: 8px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <strong style="color:#fbbf24;">Редактор (Editor)</strong>
            <span class="badge-role role-editor">Создание & Правка</span>
          </div>
          <div style="font-size:0.84rem; color:var(--text-muted);">Пароль: <code>${config.editorPass}</code></div>
          <div style="font-size:0.84rem; color:var(--text-muted); margin-top:4px;">Токен: <code>${config.editorToken}</code></div>
        </div>

        <div style="background: #090d16; border: 1px solid var(--card-border); padding: 14px; border-radius: 8px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <strong style="color:#34d399;">Наблюдатель (Viewer)</strong>
            <span class="badge-role role-viewer">Только чтение</span>
          </div>
          <div style="font-size:0.84rem; color:var(--text-muted);">Пароль: <code>${config.viewerPass}</code></div>
          <div style="font-size:0.84rem; color:var(--text-muted); margin-top:4px;">Токен: <code>${config.viewerToken}</code></div>
        </div>
      </div>
    </div>

    <div class="doc-section">
      <h2>📡 Список эндпоинтов</h2>

      <div class="ep-row">
        <span class="method m-post">POST</span>
        <span>/login</span>
        <span style="color:var(--text-muted); font-size:0.85rem;">Авторизация по паролю</span>
      </div>

      <div class="ep-row">
        <span class="method m-get">GET</span>
        <span>/items/scan?code=&lt;PLU&gt;</span>
        <span style="color:var(--text-muted); font-size:0.85rem;">Поиск по PLU коду в каталоге</span>
      </div>

      <div class="ep-row">
        <span class="method m-get">GET</span>
        <span>/items</span>
        <span style="color:var(--text-muted); font-size:0.85rem;">Получение списка партий товаров</span>
        <span class="badge-role role-viewer">Viewer</span>
      </div>

      <div class="ep-row">
        <span class="method m-get">GET</span>
        <span>/items/:id</span>
        <span style="color:var(--text-muted); font-size:0.85rem;">Получение партии по ID</span>
        <span class="badge-role role-viewer">Viewer</span>
      </div>

      <div class="ep-row">
        <span class="method m-post">POST</span>
        <span>/items</span>
        <span style="color:var(--text-muted); font-size:0.85rem;">Добавление партии (с авто-сохранением в каталог)</span>
        <span class="badge-role role-editor">Editor</span>
      </div>

      <div class="ep-row">
        <span class="method m-put">PUT</span>
        <span>/items/:id</span>
        <span style="color:var(--text-muted); font-size:0.85rem;">Обновление партии по ID</span>
        <span class="badge-role role-editor">Editor</span>
      </div>

      <div class="ep-row">
        <span class="method m-delete">DELETE</span>
        <span>/items/:id</span>
        <span style="color:var(--text-muted); font-size:0.85rem;">Удаление партии по ID</span>
        <span class="badge-role role-admin">Admin</span>
      </div>

      <div class="ep-row">
        <span class="method m-get">GET</span>
        <span>/catalog</span>
        <span style="color:var(--text-muted); font-size:0.85rem;">Получение всего справочника каталога</span>
      </div>
    </div>

    <div class="doc-section">
      <h2>💻 Примеры cURL запросов</h2>
      <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 6px;">Сканирование по PLU коду:</p>
      <pre>curl http://localhost:3000/items/scan?code=49393</pre>

      <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 14px; margin-bottom: 6px;">Получение списка партий с токеном Viewer:</p>
      <pre>curl -H "Authorization: Bearer ${config.viewerToken}" http://localhost:3000/items</pre>

      <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 14px; margin-bottom: 6px;">Приемка нового товара с токеном Editor:</p>
      <pre>curl -X POST http://localhost:3000/items \\
  -H "Authorization: Bearer ${config.editorToken}" \\
  -H "Content-Type: application/json" \\
  -d '{"plu":"49393","quantity":15.0,"date":{"start":"2026-10-31","end":"2026-11-14"}}'</pre>
    </div>
  </main>
</body>
</html>`;
}
