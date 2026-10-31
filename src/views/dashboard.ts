import { AppConfig } from '../config.js';

export function renderDashboardHtml(config: AppConfig): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Управление складом — Siteau</title>
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
      text-decoration: none;
      color: inherit;
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
    .brand h1 { font-size: 1.15rem; font-weight: 700; color: #fff; line-height: 1.2; }
    .brand p { font-size: 0.78rem; color: var(--text-muted); }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .btn-header {
      background: #172133;
      border: 1px solid var(--card-border);
      color: #cbd5e1;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.84rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-header:hover { color: #fff; background: #1e293b; border-color: var(--accent); }
    .role-badge {
      font-size: 0.72rem;
      padding: 3px 8px;
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
      padding: 12px 18px;
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
      max-width: 1080px;
      margin: 0 auto;
      width: 100%;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .stat-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .stat-num { font-size: 1.4rem; font-weight: 700; color: #fff; line-height: 1.1; }
    .stat-label { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }
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
    .search-box { flex: 1; min-width: 240px; position: relative; }
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
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
    .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
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

    /* СПИСОК В 1 СТОЛБЕЦ (по запросу пользователя) */
    .items-single-col {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .item-row-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s;
    }
    .item-row-card:hover {
      border-color: #334155;
      background: var(--card-hover);
    }
    .row-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      flex-wrap: wrap;
    }
    .row-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      text-transform: capitalize;
    }
    .row-badges {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 4px;
    }
    .code-tag {
      background: #090d16;
      border: 1px solid var(--card-border);
      font-size: 0.74rem;
      font-family: monospace;
      padding: 2px 7px;
      border-radius: 4px;
      color: var(--accent);
    }
    .cat-tag {
      background: rgba(139, 92, 246, 0.15);
      color: #a78bfa;
      border: 1px solid rgba(139, 92, 246, 0.3);
      font-size: 0.74rem;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    .row-desc {
      font-size: 0.86rem;
      color: #94a3b8;
      background: #090d16;
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 3px solid var(--accent);
      line-height: 1.4;
    }
    .row-details {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      padding-top: 6px;
      border-top: 1px solid var(--card-border);
    }
    .qty-display {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--accent);
    }
    .dates-display {
      font-size: 0.82rem;
      color: var(--text-muted);
    }
    .expiry-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .exp-fresh { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .exp-warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .exp-expired { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .row-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-left: auto;
    }
    .btn-action {
      background: #1e293b;
      border: 1px solid var(--card-border);
      color: #e2e8f0;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.82rem;
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

    /* Формы */
    .form-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 24px;
      max-width: 680px;
      margin: 0 auto;
    }
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; font-size: 0.85rem; font-weight: 600; color: #e2e8f0; margin-bottom: 6px; }
    .form-hint { font-size: 0.76rem; color: var(--text-muted); margin-top: 4px; }
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
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .catalog-match-alert {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 18px;
      font-size: 0.88rem;
      display: none;
      align-items: center;
      gap: 10px;
      line-height: 1.4;
    }
    .match-found { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); color: #34d399; }
    .match-new { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; }
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
    .catalog-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    .catalog-table th { background: #172133; padding: 12px; text-align: left; font-weight: 600; color: #cbd5e1; border-bottom: 1px solid var(--card-border); }
    .catalog-table td { padding: 12px; border-bottom: 1px solid var(--card-border); color: #f1f5f9; }
    .catalog-table tr:hover td { background: rgba(255, 255, 255, 0.02); }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
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
    }
    /* Auth Modal */
    .auth-gate {
      position: fixed;
      inset: 0;
      background: rgba(9, 13, 22, 0.92);
      backdrop-filter: blur(8px);
      z-index: 200;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .auth-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 32px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 25px 50px rgba(0,0,0,0.7);
    }
  </style>
</head>
<body>
  <header>
    <a href="/admin" class="brand">
      <div class="brand-icon">📦</div>
      <div>
        <h1>Siteau — Панель управления складом</h1>
        <p>Учет партий, сроков годности и справочник PLU</p>
      </div>
    </a>
    <div class="header-actions">
      <a href="/showcase" class="btn-header">🌟 Открыть витрину</a>
      <span id="roleBadge" class="role-badge role-editor">Editor</span>
      <button class="btn-action" onclick="showAuthModal(true)">🔑 Сменить пароль / роль</button>
    </div>
  </header>

  <nav class="nav-tabs">
    <button class="tab-btn active" data-tab="items" onclick="switchTab('items')">
      <span>📦</span> Склад и партии (<span id="tabCount">0</span>)
    </button>
    <button class="tab-btn" data-tab="scan-add" onclick="switchTab('scan-add')">
      <span>➕</span> Приемка по PLU / Сканер
    </button>
    <button class="tab-btn" data-tab="catalog" onclick="switchTab('catalog')">
      <span>📚</span> Справочник каталога (<span id="catCount">0</span>)
    </button>
  </nav>

  <main>
    <!-- Вкладка 1: Склад в 1 столбец -->
    <section id="tab-items">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">📦</div>
          <div>
            <div id="statTotalItems" class="stat-num">0</div>
            <div class="stat-label">Партий на складе</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">⚖️</div>
          <div>
            <div id="statTotalQty" class="stat-num">0 кг</div>
            <div class="stat-label">Общий вес на складе</div>
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
          <div class="chip active" data-filter="all" onclick="setFilter('all', this)">Все партии</div>
          <div class="chip" data-filter="fresh" onclick="setFilter('fresh', this)">🟢 Свежие</div>
          <div class="chip" data-filter="warning" onclick="setFilter('warning', this)">🟡 Скоро истекают</div>
          <div class="chip" data-filter="expired" onclick="setFilter('expired', this)">🔴 Просроченные</div>
        </div>
      </div>

      <!-- Список строго в 1 столбец -->
      <div id="itemsContainer" class="items-single-col"></div>
    </section>

    <!-- Вкладка 2: Приемка через сканер / по PLU -->
    <section id="tab-scan-add" style="display: none;">
      <div class="form-card">
        <h2 style="font-size: 1.25rem; margin-bottom: 6px;">Приемка товара / Сканер PLU</h2>
        <p style="color: var(--text-muted); font-size: 0.86rem; margin-bottom: 18px;">
          Отсканируйте или введите PLU код. Если товар в каталоге — достаточно ввести только вес (кг). Если товара нет — укажите данные, и он автоматически сохранится в справочник.
        </p>

        <div id="catalogMatchAlert" class="catalog-match-alert"></div>

        <form id="addItemForm" onsubmit="handleAddItem(event)">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Штрихкод / PLU код *</label>
              <input type="text" id="addPlu" class="form-control" placeholder="Напр. 49393, 13862" oninput="onPluInput(this.value)" required autofocus />
              <div class="form-hint">Мгновенный поиск данных в catalog.json</div>
            </div>
            <div class="form-group">
              <label class="form-label">Вес партии (кг) *</label>
              <input type="number" step="0.1" min="0.1" id="addQuantity" class="form-control" placeholder="Вес в кг (напр. 15.5)" required />
              <div class="form-hint">Учет ведется строго в килограммах</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Наименование товара *</label>
            <input type="text" id="addName" class="form-control" placeholder="Подтянется из каталога или введите вручную" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Категория товара</label>
              <select id="addCategory" class="form-control">
                <option value="Красная рыба">Красная рыба (Лосось / Форель)</option>
                <option value="Белая рыба">Белая рыба (Треска, Пикша, Камбала, Минтай)</option>
                <option value="Филе и стейки">Филе и стейки</option>
                <option value="Речная рыба">Речная рыба (Щука, Судак, Карп, Лещ)</option>
                <option value="Морепродукты">Морепродукты</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Артикул (необязательно)</label>
              <input type="text" id="addArticul" class="form-control" placeholder="Артикул поставщика" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Краткое описание товара (для витрины)</label>
            <textarea id="addDescription" class="form-control" rows="2" placeholder="Оставьте пустым, если описания нет (не будет выводиться)"></textarea>
            <div class="form-hint">Если заполнено, будет сохранено в каталог для будущих поставок</div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Срок годности (дней)</label>
              <input type="number" id="addShelfLife" class="form-control" value="10" min="1" oninput="recalcEndDate()" />
            </div>
            <div class="form-group">
              <label class="form-label">Дата поступления (date.start)</label>
              <input type="date" id="addDateStart" class="form-control" required onchange="recalcEndDate()" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Годен до (date.end) — рассчитывается автоматически</label>
            <input type="date" id="addDateEnd" class="form-control" required />
          </div>

          <button type="submit" class="btn-primary" style="margin-top: 10px;">
            <span>📥</span> Принять партию на склад
          </button>
        </form>
      </div>
    </section>

    <!-- Вкладка 3: Справочник каталога -->
    <section id="tab-catalog" style="display: none;">
      <div class="filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="catalogSearchInput" class="search-input" placeholder="Поиск в справочнике по названию, PLU, описанию..." oninput="filterCatalogTable()" />
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn-action" onclick="openAddCatalogModal()">➕ Новая позиция в каталог</button>
          <button class="btn-action" onclick="loadCatalogData()">🔄 Обновить</button>
        </div>
      </div>

      <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; overflow-x: auto;">
        <table class="catalog-table">
          <thead>
            <tr>
              <th>PLU</th>
              <th>Категория</th>
              <th>Наименование</th>
              <th>Срок (дней)</th>
              <th>Описание</th>
              <th style="text-align:right;">Действия</th>
            </tr>
          </thead>
          <tbody id="catalogTableBody"></tbody>
        </table>
      </div>
    </section>
  </main>

  <!-- Auth Gate Modal -->
  <div id="authGate" class="auth-gate">
    <div class="auth-card">
      <div style="text-align:center; margin-bottom:20px;">
        <div style="font-size:38px; margin-bottom:8px;">🔒</div>
        <h2 style="color:#fff; font-size:1.3rem;">Вход на склад Siteau</h2>
        <p style="color:var(--text-muted); font-size:0.86rem; margin-top:4px;">
          Доступ к складскому учету разрешен для ролей Viewer, Editor и Admin
        </p>
      </div>

      <form onsubmit="handleLoginSubmit(event)">
        <div class="form-group">
          <label class="form-label">Пароль доступа</label>
          <input type="password" id="authPassword" class="form-control" placeholder="Введите пароль (view / jisoo / emmamyers)" required autofocus />
          <div class="form-hint" style="margin-top:6px;">
            Подсказка: <code>view</code> (Viewer), <code>jisoo</code> (Editor), <code>emmamyers</code> (Admin)
          </div>
        </div>
        <button type="submit" class="btn-primary" style="margin-top:16px;">
          Войти на склад
        </button>
      </form>
    </div>
  </div>

  <!-- Edit Item Modal -->
  <div id="editItemModal" class="auth-gate" onclick="closeEditModal(event)">
    <div class="auth-card" style="max-width:550px;" onclick="event.stopPropagation()">
      <h3 style="color:#fff; margin-bottom:14px; font-size:1.2rem;">Редактирование партии #<span id="editId"></span></h3>
      <form onsubmit="handleSaveEditItem(event)">
        <div class="form-group">
          <label class="form-label">Наименование</label>
          <input type="text" id="editName" class="form-control" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Вес партии (кг)</label>
            <input type="number" step="0.1" min="0.1" id="editQuantity" class="form-control" required />
          </div>
          <div class="form-group">
            <label class="form-label">Категория</label>
            <select id="editCategory" class="form-control">
              <option value="Красная рыба">Красная рыба</option>
              <option value="Белая рыба">Белая рыба</option>
              <option value="Филе и стейки">Филе и стейки</option>
              <option value="Речная рыба">Речная рыба</option>
              <option value="Морепродукты">Морепродукты</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Краткое описание</label>
          <textarea id="editDescription" class="form-control" rows="2"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Дата начала</label>
            <input type="date" id="editDateStart" class="form-control" required />
          </div>
          <div class="form-group">
            <label class="form-label">Годен до</label>
            <input type="date" id="editDateEnd" class="form-control" required />
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
          <button type="button" class="btn-action" onclick="closeEditModal()">Отмена</button>
          <button type="submit" class="btn-primary" style="width:auto; padding:10px 20px;">Сохранить изменения</button>
        </div>
      </form>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    const TOKENS = {
      admin: "${config.adminToken}",
      editor: "${config.editorToken}",
      viewer: "${config.viewerToken}"
    };

    let currentRole = localStorage.getItem('siteau_role') || 'editor';
    let currentToken = localStorage.getItem('siteau_token') || TOKENS[currentRole];
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

    function checkAuth() {
      if (!currentToken) {
        showAuthModal(true);
        return false;
      }
      updateRoleBadge();
      return true;
    }

    function showAuthModal(show) {
      document.getElementById('authGate').style.display = show ? 'flex' : 'none';
      if (show) document.getElementById('authPassword').focus();
    }

    async function handleLoginSubmit(e) {
      e.preventDefault();
      const pass = document.getElementById('authPassword').value.trim();
      try {
        const res = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pass })
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || 'Неверный пароль', true);
          return;
        }

        currentRole = data.role;
        currentToken = data.token;
        localStorage.setItem('siteau_role', currentRole);
        localStorage.setItem('siteau_token', currentToken);

        updateRoleBadge();
        showAuthModal(false);
        showToast('Успешный вход! Роль: ' + currentRole.toUpperCase());
        loadItems();
        loadCatalogData();
      } catch (err) {
        showToast('Ошибка сети: ' + err.message, true);
      }
    }

    function updateRoleBadge() {
      const badge = document.getElementById('roleBadge');
      badge.textContent = currentRole.toUpperCase();
      badge.className = 'role-badge role-' + currentRole;
    }

    // БЕЗОПАСНОЕ ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК (исправление ошибки event.currentTarget)
    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
      });

      document.getElementById('tab-items').style.display = tabId === 'items' ? 'block' : 'none';
      document.getElementById('tab-scan-add').style.display = tabId === 'scan-add' ? 'block' : 'none';
      document.getElementById('tab-catalog').style.display = tabId === 'catalog' ? 'block' : 'none';

      if (tabId === 'items') loadItems();
      if (tabId === 'catalog') loadCatalogData();
      if (tabId === 'scan-add') initAddForm();
    }

    function initAddForm() {
      const today = new Date().toISOString().split('T')[0];
      const startEl = document.getElementById('addDateStart');
      if (!startEl.value) {
        startEl.value = today;
        recalcEndDate();
      }
      document.getElementById('addPlu').focus();
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
          alertBox.innerHTML = '<span>✅ Товар найден в каталоге: <strong>' + data.name + '</strong> (' + (data.category || 'Рыба') + '). Введите вес в кг!</span>';
          document.getElementById('addName').value = data.name;
          if (data.shelf_life) {
            document.getElementById('addShelfLife').value = data.shelf_life;
            recalcEndDate();
          }
          if (data.description) {
            document.getElementById('addDescription').value = data.description;
          }
          if (data.category) {
            document.getElementById('addCategory').value = data.category;
          }
          if (data.articul) {
            document.getElementById('addArticul').value = data.articul;
          }
        } else {
          alertBox.className = 'catalog-match-alert match-new';
          alertBox.style.display = 'flex';
          alertBox.innerHTML = '<span>✨ Новый товар! Заполните название и вес (кг). Товар автоматически сохранится в каталог.</span>';
        }
      } catch (err) {
        console.error(err);
      }
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
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#9ca3af; padding:30px;">Справочник пуст</td></tr>';
        return;
      }
      tbody.innerHTML = list.map(item => \`
        <tr>
          <td><span class="code-tag">\${item.plu || '—'}</span></td>
          <td><span class="cat-tag">\${item.category || 'Рыба'}</span></td>
          <td style="font-weight:700; text-transform:capitalize;">\${item.name}</td>
          <td>\${item.shelf_life ? item.shelf_life + ' дн.' : '—'}</td>
          <td style="color:#94a3b8; font-size:0.83rem;">\${item.description || '—'}</td>
          <td style="text-align:right;">
            \${currentRole === 'admin' ? '<button class="btn-action btn-danger" style="padding:4px 8px;" onclick="deleteCatalogItem(\\'' + (item.plu || item.articul) + '\\')">🗑</button>' : ''}
          </td>
        </tr>
      \`).join('');
    }

    function filterCatalogTable() {
      const q = document.getElementById('catalogSearchInput').value.toLowerCase().trim();
      const filtered = catalogList.filter(item => {
        return (item.name && item.name.toLowerCase().includes(q)) ||
               (item.plu && item.plu.toLowerCase().includes(q)) ||
               (item.category && item.category.toLowerCase().includes(q)) ||
               (item.description && item.description.toLowerCase().includes(q));
      });
      renderCatalogTable(filtered);
    }

    async function deleteCatalogItem(plu) {
      if (!confirm('Удалить позицию "' + plu + '" из каталога?')) return;
      try {
        const res = await fetch('/catalog/' + encodeURIComponent(plu), {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        if (res.ok) {
          showToast('Позиция удалена из каталога');
          loadCatalogData();
        }
      } catch (err) {
        showToast('Ошибка удаления: ' + err.message, true);
      }
    }

    function getDaysDiff(endIso) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const end = new Date(endIso);
      end.setHours(0,0,0,0);
      return Math.round((end - today) / (1000 * 60 * 60 * 24));
    }

    async function loadItems() {
      if (!checkAuth()) return;
      try {
        const res = await fetch('/items', {
          headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            showAuthModal(true);
            return;
          }
          const err = await res.json();
          showToast(err.error || 'Ошибка загрузки товаров', true);
          return;
        }
        allItems = await res.json();
        document.getElementById('tabCount').textContent = allItems.length;
        updateStats();
        filterItems();
      } catch (err) {
        showToast('Сетевая ошибка: ' + err.message, true);
      }
    }

    function updateStats() {
      document.getElementById('statTotalItems').textContent = allItems.length;
      const totalQty = allItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      document.getElementById('statTotalQty').textContent = totalQty.toFixed(1) + ' кг';

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
               (item.category && item.category.toLowerCase().includes(q)) ||
               (item.description && item.description.toLowerCase().includes(q));
      });

      if (!filtered.length) {
        container.innerHTML = \`
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <p style="font-size:1.1rem; color:#fff;">На складе нет партий</p>
            <p style="font-size:0.86rem; margin-top:4px;">Примите товар на вкладке "Приемка по PLU / Сканер"</p>
          </div>
        \`;
        return;
      }

      // Карточки строго в 1 столбец
      container.innerHTML = filtered.map(item => {
        const days = getDaysDiff(item.date.end);
        let expClass = 'exp-fresh';
        let expText = '🟢 Свежий — еще ' + days + ' дн.';
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
          <div class="item-row-card">
            <div class="row-header">
              <div>
                <div class="row-title">\${item.name}</div>
                <div class="row-badges">
                  \${item.category ? '<span class="cat-tag">' + item.category + '</span>' : ''}
                  \${item.plu ? '<span class="code-tag">PLU: ' + item.plu + '</span>' : ''}
                  \${item.articul ? '<span class="code-tag" style="color:#cbd5e1;">АРТ: ' + item.articul + '</span>' : ''}
                  <span class="code-tag" style="color:#64748b;">ID: #\${item.id}</span>
                </div>
              </div>
              <div class="expiry-badge \${expClass}">
                \${expText}
              </div>
            </div>

            \${item.description && item.description.trim() ? '<div class="row-desc">' + item.description + '</div>' : ''}

            <div class="row-details">
              <div>
                <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Остаток на складе</span>
                <span class="qty-display">\${item.quantity} кг</span>
              </div>
              <div class="dates-display">
                Поступление: <strong>\${item.date.start}</strong> &bull; Годен до: <strong>\${item.date.end}</strong>
                \${item.shelf_life ? ' (' + item.shelf_life + ' дн.)' : ''}
              </div>
              <div class="row-actions">
                <button class="btn-action" onclick="quickEditQuantity(\${item.id}, \${item.quantity})">✏️ Изменить вес</button>
                <button class="btn-action" onclick="openEditModal(\${item.id})">⚙️ Редактировать</button>
                \${currentRole === 'admin' ? '<button class="btn-action btn-danger" onclick="deleteItem(' + item.id + ')">🗑 Удалить</button>' : ''}
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    async function handleAddItem(e) {
      e.preventDefault();
      const descVal = document.getElementById('addDescription').value.trim();
      const item = {
        name: document.getElementById('addName').value.trim(),
        plu: document.getElementById('addPlu').value.trim(),
        articul: document.getElementById('addArticul').value.trim(),
        quantity: parseFloat(document.getElementById('addQuantity').value),
        category: document.getElementById('addCategory').value,
        description: descVal !== '' ? descVal : '', // Никаких 'добавлено оператором'
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

        showToast('Партия "' + data.name + '" (' + data.quantity + ' кг) успешно принята!');
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
      const newQtyStr = prompt('Введите новый вес в кг (текущий: ' + currentQty + ' кг):', currentQty);
      if (newQtyStr === null) return;
      const newQty = parseFloat(newQtyStr);
      if (isNaN(newQty) || newQty <= 0) {
        alert('Вес должен быть числом больше 0');
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
        showToast('Вес обновлен: ' + newQty + ' кг');
        loadItems();
      } catch (err) {
        showToast('Ошибка сети: ' + err.message, true);
      }
    }

    let editingItemId = null;
    function openEditModal(id) {
      const item = allItems.find(i => i.id === id);
      if (!item) return;
      editingItemId = id;
      document.getElementById('editId').textContent = id;
      document.getElementById('editName').value = item.name || '';
      document.getElementById('editQuantity').value = item.quantity || 0;
      document.getElementById('editCategory').value = item.category || 'Красная рыба';
      document.getElementById('editDescription').value = item.description || '';
      document.getElementById('editDateStart').value = item.date.start || '';
      document.getElementById('editDateEnd').value = item.date.end || '';
      document.getElementById('editItemModal').style.display = 'flex';
    }

    function closeEditModal() {
      document.getElementById('editItemModal').style.display = 'none';
      editingItemId = null;
    }

    async function handleSaveEditItem(e) {
      e.preventDefault();
      if (!editingItemId) return;
      const item = allItems.find(i => i.id === editingItemId);
      if (!item) return;

      const updated = {
        ...item,
        name: document.getElementById('editName').value.trim(),
        quantity: parseFloat(document.getElementById('editQuantity').value),
        category: document.getElementById('editCategory').value,
        description: document.getElementById('editDescription').value.trim(),
        date: {
          start: document.getElementById('editDateStart').value,
          end: document.getElementById('editDateEnd').value
        }
      };

      try {
        const res = await fetch('/items/' + editingItemId, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + currentToken
          },
          body: JSON.stringify(updated)
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || 'Ошибка сохранения', true);
          return;
        }
        showToast('Партия #' + editingItemId + ' обновлена');
        closeEditModal();
        loadItems();
        loadCatalogData();
      } catch (err) {
        showToast('Ошибка сети: ' + err.message, true);
      }
    }

    async function deleteItem(id) {
      if (currentRole !== 'admin') {
        showToast('Удаление товара разрешено только Администратору (Admin)', true);
        return;
      }
      if (!confirm('Вы уверены, что хотите удалить партию #' + id + '?')) return;

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
        showToast('Партия #' + id + ' удалена');
        loadItems();
      } catch (err) {
        showToast('Ошибка сети: ' + err.message, true);
      }
    }

    function openAddCatalogModal() {
      const plu = prompt('Введите PLU код для новой позиции каталога:');
      if (!plu) return;
      const name = prompt('Введите наименование товара:');
      if (!name) return;
      const cat = prompt('Категория (Красная рыба / Белая рыба / Филе и стейки / Речная рыба):', 'Красная рыба');
      const desc = prompt('Краткое описание (необязательно):', '');

      fetch('/catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + currentToken
        },
        body: JSON.stringify({
          plu,
          name,
          category: cat || 'Рыба и морепродукты',
          description: desc || '',
          shelf_life: 10
        })
      }).then(r => r.json()).then(() => {
        showToast('Позиция добавлена в каталог');
        loadCatalogData();
      });
    }

    // Инициализация при загрузке
    checkAuth();
    loadItems();
    loadCatalogData();
    initAddForm();
  </script>
</body>
</html>`;
}
