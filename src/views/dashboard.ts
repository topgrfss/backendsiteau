import { AppConfig } from '../config.js';

export function renderDashboardHtml(config: AppConfig): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
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
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
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
      padding: 12px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: inherit;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
      box-shadow: 0 4px 10px rgba(2, 132, 199, 0.3);
      flex-shrink: 0;
    }
    .brand h1 { font-size: 1.05rem; font-weight: 700; color: #fff; line-height: 1.2; }
    .brand p { font-size: 0.72rem; color: var(--text-muted); }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-header {
      background: #172133;
      border: 1px solid var(--card-border);
      color: #cbd5e1;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .btn-header:hover { color: #fff; background: #1e293b; border-color: var(--accent); }
    .role-badge {
      font-size: 0.7rem;
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
      padding: 0 16px;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .nav-tabs::-webkit-scrollbar { display: none; }
    .tab-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      padding: 12px 14px;
      font-size: 0.86rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
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
      padding: 16px;
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      margin-bottom: 18px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .stat-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .stat-num { font-size: 1.25rem; font-weight: 700; color: #fff; line-height: 1.1; }
    .stat-label { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }
    .filter-bar {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 16px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
    }
    .search-box { flex: 1; min-width: 220px; position: relative; }
    .search-input {
      width: 100%;
      background: #090d16;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 9px 12px 9px 34px;
      color: #fff;
      font-size: 0.9rem;
      outline: none;
    }
    .search-input:focus { border-color: var(--accent); }
    .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.85rem; }
    .filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
    .chip {
      background: #172133;
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 5px 11px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .chip:hover { color: #fff; border-color: var(--accent); }
    .chip.active { background: var(--accent); color: #090d16; border-color: var(--accent); }

    /* СПИСОК В 1 СТОЛБЕЦ */
    .items-single-col {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .item-row-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
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
      gap: 10px;
      flex-wrap: wrap;
    }
    .row-title {
      font-size: 1.1rem;
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
      font-size: 0.72rem;
      font-family: monospace;
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--accent);
    }
    .cat-tag {
      background: rgba(139, 92, 246, 0.15);
      color: #a78bfa;
      border: 1px solid rgba(139, 92, 246, 0.3);
      font-size: 0.72rem;
      padding: 2px 7px;
      border-radius: 4px;
      font-weight: 600;
    }
    .row-desc {
      font-size: 0.85rem;
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
      gap: 12px;
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
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .expiry-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.76rem;
      font-weight: 700;
    }
    .exp-fresh { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .exp-warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .exp-expired { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .row-actions {
      display: flex;
      gap: 6px;
      align-items: center;
      margin-left: auto;
    }
    .btn-action {
      background: #1e293b;
      border: 1px solid var(--card-border);
      color: #e2e8f0;
      padding: 7px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
      min-height: 36px;
    }
    .btn-action:hover { background: #334155; color: #fff; }
    .btn-danger { color: #f87171; }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.2); border-color: #f87171; }

    /* Сканер и Форма приёмки */
    .form-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 18px;
      max-width: 650px;
      margin: 0 auto;
    }
    .form-group { margin-bottom: 14px; }
    .form-label { display: block; font-size: 0.82rem; font-weight: 600; color: #e2e8f0; margin-bottom: 5px; }
    .form-hint { font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; }
    .form-control {
      width: 100%;
      background: #090d16;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 10px 12px;
      color: #fff;
      font-size: 16px; /* 16px предотвращает масштабирование iOS */
      outline: none;
      transition: border-color 0.2s;
    }
    .form-control:focus { border-color: var(--accent); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    /* Специальный мобильный блок сканера */
    .scanner-box {
      background: #0d1424;
      border: 2px dashed #0284c7;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      text-align: center;
    }
    .scanner-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .scanner-big-input {
      width: 100%;
      background: #090d16;
      border: 2px solid var(--accent);
      border-radius: 10px;
      padding: 14px 44px 14px 48px;
      color: #fff;
      font-size: 1.15rem;
      font-weight: 700;
      font-family: monospace;
      outline: none;
      box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
    }
    .scanner-icon {
      position: absolute;
      left: 14px;
      font-size: 1.3rem;
      color: var(--accent);
      pointer-events: none;
    }
    .btn-clear-input {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.2rem;
      cursor: pointer;
      padding: 6px;
    }
    .quick-plu-chips {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 8px;
    }
    .quick-plu-btn {
      background: #172133;
      border: 1px solid var(--card-border);
      color: #cbd5e1;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 0.74rem;
      font-family: monospace;
      cursor: pointer;
      transition: all 0.2s;
    }
    .quick-plu-btn:hover { background: var(--accent); color: #090d16; font-weight: 700; }
    .catalog-match-alert {
      padding: 12px 14px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.85rem;
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
      padding: 14px 24px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
      width: 100%;
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-primary:hover { background: var(--accent-hover); color: #fff; }
    .catalog-table { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
    .catalog-table th { background: #172133; padding: 10px 12px; text-align: left; font-weight: 600; color: #cbd5e1; border-bottom: 1px solid var(--card-border); }
    .catalog-table td { padding: 10px 12px; border-bottom: 1px solid var(--card-border); color: #f1f5f9; }
    .catalog-table tr:hover td { background: rgba(255, 255, 255, 0.02); }
    .empty-state { text-align: center; padding: 48px 16px; color: var(--text-muted); }
    .empty-state-icon { font-size: 40px; margin-bottom: 8px; opacity: 0.6; }
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      left: 20px;
      max-width: 380px;
      margin: 0 auto;
      padding: 12px 18px;
      border-radius: 8px;
      background: #1e293b;
      color: #fff;
      font-size: 0.88rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      border: 1px solid var(--card-border);
      z-index: 999;
      display: none;
      text-align: center;
    }
    .auth-gate {
      position: fixed;
      inset: 0;
      background: rgba(9, 13, 22, 0.95);
      backdrop-filter: blur(6px);
      z-index: 200;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .auth-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 24px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 20px 45px rgba(0,0,0,0.7);
    }
    /* Мобильная адаптация */
    @media (max-width: 640px) {
      header { padding: 10px 14px; }
      .brand-title { font-size: 0.95rem; }
      .brand-sub { display: none; }
      main { padding: 12px; }
      .form-row { grid-template-columns: 1fr; gap: 10px; }
      .row-actions { width: 100%; justify-content: flex-end; margin-top: 6px; }
      .btn-action { padding: 6px 10px; font-size: 0.78rem; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .stat-card { padding: 10px; }
    }
  </style>
</head>
<body>
  <header>
    <a href="/admin" class="brand">
      <div class="brand-icon">📦</div>
      <div>
        <h1>Siteau Склад</h1>
        <p class="brand-sub">Учет партий и PLU</p>
      </div>
    </a>
    <div class="header-actions">
      <a href="/showcase" class="btn-header">🌟 Витрина</a>
      <span id="roleBadge" class="role-badge" style="display: none;"></span>
      <button id="authBtn" class="btn-action" style="padding:5px 10px;" onclick="showAuthModal(true)">🔑 Войти</button>
    </div>
  </header>

  <nav class="nav-tabs">
    <button class="tab-btn active" data-tab="items" onclick="switchTab('items')">
      <span>📦</span> Склад (<span id="tabCount">0</span>)
    </button>
    <button class="tab-btn" data-tab="scan-add" onclick="switchTab('scan-add')">
      <span>📟</span> Сканер / Приемка
    </button>
    <button class="tab-btn" data-tab="catalog" onclick="switchTab('catalog')">
      <span>📚</span> Справочник (<span id="catCount">0</span>)
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
            <div class="stat-label">Партий</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">⚖️</div>
          <div>
            <div id="statTotalQty" class="stat-num">0 кг</div>
            <div class="stat-label">Всего вес</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">🟢</div>
          <div>
            <div id="statFreshItems" class="stat-num">0</div>
            <div class="stat-label">Свежие</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">🟡</div>
          <div>
            <div id="statWarningItems" class="stat-num">0</div>
            <div class="stat-label">Истекают &le;3д</div>
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="searchInput" class="search-input" placeholder="Поиск по названию, PLU..." oninput="filterItems()" />
        </div>
        <div class="filter-chips">
          <div class="chip active" data-filter="all" onclick="setFilter('all', this)">Все</div>
          <div class="chip" data-filter="fresh" onclick="setFilter('fresh', this)">🟢 Свежие</div>
          <div class="chip" data-filter="warning" onclick="setFilter('warning', this)">🟡 Истекают</div>
          <div class="chip" data-filter="expired" onclick="setFilter('expired', this)">🔴 Просрочено</div>
        </div>
      </div>

      <!-- Список строго в 1 столбец -->
      <div id="itemsContainer" class="items-single-col"></div>
    </section>

    <!-- Вкладка 2: Приемка через сканер / по PLU -->
    <section id="tab-scan-add" style="display: none;">
      <div class="form-card">
        <div class="scanner-box">
          <div style="font-weight:700; font-size:0.95rem; color:#fff; margin-bottom:8px;">
            📟 Сканирование штрихкода / PLU
          </div>
          <div class="scanner-input-wrap">
            <span class="scanner-icon">🔍</span>
            <input type="text" id="addPlu" inputmode="numeric" class="scanner-big-input" placeholder="Введите или отсканируйте PLU..." oninput="onPluInput(this.value)" autofocus />
            <button type="button" class="btn-clear-input" onclick="clearPluInput()">✕</button>
          </div>
          <div class="form-hint" style="color:#94a3b8; font-size:0.75rem;">
            Быстрый выбор для проверки:
          </div>
          <div class="quick-plu-chips">
            <button type="button" class="quick-plu-btn" onclick="quickFillPlu('49393')">49393 Форель</button>
            <button type="button" class="quick-plu-btn" onclick="quickFillPlu('13862')">13862 Треска</button>
            <button type="button" class="quick-plu-btn" onclick="quickFillPlu('60368')">60368 Лосось стейк</button>
            <button type="button" class="quick-plu-btn" onclick="quickFillPlu('50890')">50890 Пикша</button>
            <button type="button" class="quick-plu-btn" onclick="quickFillPlu('23750')">23750 Судак</button>
          </div>
        </div>

        <div id="catalogMatchAlert" class="catalog-match-alert"></div>

        <form id="addItemForm" onsubmit="handleAddItem(event)">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Вес партии (кг) *</label>
              <input type="number" step="0.1" min="0.1" id="addQuantity" class="form-control" placeholder="Напр. 15.5 кг" required />
            </div>
            <div class="form-group">
              <label class="form-label">Срок годности (дней)</label>
              <input type="number" id="addShelfLife" class="form-control" value="10" min="1" oninput="recalcEndDate()" />
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
                <option value="Белая рыба">Белая рыба (Треска, Пикша, Камбала)</option>
                <option value="Филе и стейки">Филе и стейки</option>
                <option value="Речная рыба">Речная рыба (Щука, Судак, Карп)</option>
                <option value="Морепродукты">Морепродукты</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Артикул (необязательно)</label>
              <input type="text" id="addArticul" class="form-control" placeholder="Артикул" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Краткое описание товара</label>
            <textarea id="addDescription" class="form-control" rows="2" placeholder="Оставьте пустым, если нет (не будет выводиться)"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Дата поступления</label>
              <input type="date" id="addDateStart" class="form-control" required onchange="recalcEndDate()" />
            </div>
            <div class="form-group">
              <label class="form-label">Годен до (авторасчет)</label>
              <input type="date" id="addDateEnd" class="form-control" required />
            </div>
          </div>

          <button type="submit" class="btn-primary" style="margin-top: 8px;">
            <span>📥</span> Принять партию на склад (кг)
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
        <div style="display:flex; gap:6px;">
          <button class="btn-action" onclick="openAddCatalogModal()">➕ Новая позиция</button>
          <button class="btn-action" onclick="loadCatalogData()">🔄</button>
        </div>
      </div>

      <div id="catalogCardsContainer" class="items-single-col"></div>
    </section>
  </main>

  <!-- Auth Gate Modal -->
  <div id="authGate" class="auth-gate">
    <div class="auth-card">
      <div style="text-align:center; margin-bottom:18px;">
        <div style="font-size:36px; margin-bottom:6px;">🔒</div>
        <h2 style="color:#fff; font-size:1.25rem;">Вход в панель склада</h2>
        <p style="color:var(--text-muted); font-size:0.82rem; margin-top:4px;">
          Введите пароль сотрудника для доступа к управлению складом
        </p>
      </div>

      <form onsubmit="handleLoginSubmit(event)">
        <div class="form-group">
          <label class="form-label">Пароль доступа</label>
          <input type="password" id="authPassword" class="form-control" placeholder="Введите пароль..." required autofocus autocomplete="current-password" />
        </div>
        <button type="submit" class="btn-primary" style="margin-top:14px;">
          Войти
        </button>
      </form>
      <div style="text-align:center; margin-top:14px;">
        <a href="/showcase" style="color:var(--text-muted); font-size:0.82rem; text-decoration:none;">← Перейти на витрину продукции</a>
      </div>
    </div>
  </div>

  <!-- Edit Batch Modal -->
  <div id="editItemModal" class="auth-gate" onclick="closeEditModal(event)">
    <div class="auth-card" style="max-width:520px;" onclick="event.stopPropagation()">
      <h3 style="color:#fff; margin-bottom:12px; font-size:1.15rem;">Редактирование партии #<span id="editId"></span></h3>
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
          <label class="form-label">Краткое описание (синхронизируется с каталогом)</label>
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
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:14px;">
          <button type="button" class="btn-action" onclick="closeEditModal()">Отмена</button>
          <button type="submit" class="btn-primary" style="width:auto; padding:10px 18px;">Сохранить</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Edit Catalog Item Modal (Редактирование описания и данных из админки) -->
  <div id="editCatalogModal" class="auth-gate" onclick="closeEditCatalogModal(event)">
    <div class="auth-card" style="max-width:520px;" onclick="event.stopPropagation()">
      <h3 style="color:#fff; margin-bottom:12px; font-size:1.15rem;">Позиция каталога: <span id="catEditPlu" style="color:var(--accent);"></span></h3>
      <form onsubmit="handleSaveEditCatalog(event)">
        <div id="catPluInputGroup" class="form-group" style="display:none;">
          <label class="form-label">PLU код *</label>
          <input type="text" id="catNewPlu" class="form-control" placeholder="Напр. 55010" />
        </div>
        <div class="form-group">
          <label class="form-label">Наименование товара *</label>
          <input type="text" id="catEditName" class="form-control" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Категория</label>
            <select id="catEditCategory" class="form-control">
              <option value="Красная рыба">Красная рыба</option>
              <option value="Белая рыба">Белая рыба</option>
              <option value="Филе и стейки">Филе и стейки</option>
              <option value="Речная рыба">Речная рыба</option>
              <option value="Морепродукты">Морепродукты</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Срок годности (дней)</label>
            <input type="number" id="catEditShelfLife" class="form-control" min="1" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Краткое описание (выводится на витрине)</label>
          <textarea id="catEditDescription" class="form-control" rows="3" placeholder="Введите привлекательное описание товара для покупателей..."></textarea>
          <div class="form-hint">Будет сохранено в catalog.json и сразу появится на витрине</div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:14px;">
          <button type="button" class="btn-action" onclick="closeEditCatalogModal()">Отмена</button>
          <button type="submit" class="btn-primary" style="width:auto; padding:10px 18px;">Сохранить в каталог</button>
        </div>
      </form>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    let currentRole = localStorage.getItem('siteau_role') || '';
    let currentToken = localStorage.getItem('siteau_token') || '';
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
      if (!currentToken || !currentRole) {
        showAuthModal(true);
        updateRoleBadge();
        return false;
      }
      updateRoleBadge();
      return true;
    }

    function showAuthModal(show) {
      const gate = document.getElementById('authGate');
      gate.style.display = show ? 'flex' : 'none';
      if (show) {
        setTimeout(() => {
          const passEl = document.getElementById('authPassword');
          if (passEl) passEl.focus();
        }, 50);
      }
    }

    async function handleLoginSubmit(e) {
      e.preventDefault();
      const passEl = document.getElementById('authPassword');
      const pass = passEl.value.trim();
      if (!pass) return;

      try {
        const res = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pass })
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || 'Неверный пароль', true);
          passEl.value = '';
          passEl.focus();
          return;
        }

        currentRole = data.role;
        currentToken = data.token;
        localStorage.setItem('siteau_role', currentRole);
        localStorage.setItem('siteau_token', currentToken);
        passEl.value = '';

        updateRoleBadge();
        showAuthModal(false);
        showToast('Успешный вход: ' + currentRole.toUpperCase());
        loadItems();
        loadCatalogData();
      } catch (err) {
        showToast('Ошибка сети: ' + err.message, true);
      }
    }

    function logout() {
      localStorage.removeItem('siteau_role');
      localStorage.removeItem('siteau_token');
      sessionStorage.removeItem('siteau_role');
      sessionStorage.removeItem('siteau_token');
      currentRole = '';
      currentToken = '';
      allItems = [];
      updateRoleBadge();
      const itemsContainer = document.getElementById('itemsContainer');
      if (itemsContainer) itemsContainer.innerHTML = '';
      const catContainer = document.getElementById('catalogCardsContainer');
      if (catContainer) catContainer.innerHTML = '';
      document.getElementById('tabCount').textContent = '0';
      document.getElementById('catCount').textContent = '0';
      document.getElementById('statTotalItems').textContent = '0';
      document.getElementById('statTotalQty').textContent = '0 кг';
      document.getElementById('statFreshItems').textContent = '0';
      document.getElementById('statWarningItems').textContent = '0';
      showToast('Вы вышли из системы');
      showAuthModal(true);
    }

    function updateRoleBadge() {
      const badge = document.getElementById('roleBadge');
      const authBtn = document.getElementById('authBtn');
      if (!currentToken || !currentRole) {
        badge.style.display = 'none';
        badge.textContent = '';
        badge.className = 'role-badge';
        if (authBtn) {
          authBtn.innerHTML = '🔑 Войти';
          authBtn.onclick = () => showAuthModal(true);
        }
      } else {
        badge.style.display = 'inline-block';
        badge.textContent = currentRole.toUpperCase();
        badge.className = 'role-badge role-' + currentRole;
        if (authBtn) {
          authBtn.innerHTML = '🚪 Выход';
          authBtn.onclick = () => logout();
        }
      }
    }

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
    }

    function recalcEndDate() {
      const startStr = document.getElementById('addDateStart').value;
      const shelfDays = parseInt(document.getElementById('addShelfLife').value, 10) || 10;
      if (!startStr) return;
      const d = new Date(startStr);
      d.setDate(d.getDate() + shelfDays);
      document.getElementById('addDateEnd').value = d.toISOString().split('T')[0];
    }

    function clearPluInput() {
      document.getElementById('addPlu').value = '';
      document.getElementById('catalogMatchAlert').style.display = 'none';
      document.getElementById('addPlu').focus();
    }

    function quickFillPlu(plu) {
      document.getElementById('addPlu').value = plu;
      onPluInput(plu);
      document.getElementById('addQuantity').focus();
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
          alertBox.innerHTML = '<span>✅ Найден в каталоге: <strong>' + data.name + '</strong> (' + (data.category || 'Рыба') + '). Введите вес в кг!</span>';
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
      const container = document.getElementById('catalogCardsContainer');
      if (!list.length) {
        container.innerHTML = \`
          <div class="empty-state">
            <div class="empty-state-icon">📚</div>
            <p style="font-size:1.05rem; color:#fff;">Справочник пуст</p>
            <p style="font-size:0.84rem; margin-top:4px;">Добавьте позиции кнопкой «➕ Новая позиция»</p>
          </div>
        \`;
        return;
      }
      container.innerHTML = list.map(item => \`
        <div class="item-row-card">
          <div class="row-header">
            <div>
              <div class="row-title">\${item.name}</div>
              <div class="row-badges">
                <span class="cat-tag">\${item.category || 'Рыба'}</span>
                \${item.plu ? '<span class="code-tag">PLU: ' + item.plu + '</span>' : ''}
                \${item.articul ? '<span class="code-tag" style="color:#cbd5e1;">АРТ: ' + item.articul + '</span>' : ''}
              </div>
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted); background:#090d16; padding:4px 8px; border-radius:6px; border:1px solid var(--card-border);">
              🕒 Срок: <strong>\${item.shelf_life ? item.shelf_life + ' дн.' : '—'}</strong>
            </div>
          </div>

          <div class="row-desc" style="margin-top:6px;">
            \${item.description && item.description.trim() ? item.description : '<span style="color:#64748b; font-style:italic;">Описание пока не добавлено (нажмите «✏️ Описание», чтобы внести)</span>'}
          </div>

          <div class="row-details">
            <div style="font-size:0.75rem; color:var(--text-muted);">
              Синхронизировано со складом и витриной
            </div>
            <div class="row-actions">
              <button class="btn-action" style="padding:7px 12px; font-weight:700;" onclick="openEditCatalogModal('\${item.plu}')">✏️ Описание и данные</button>
              \${currentRole === 'admin' ? '<button class="btn-action btn-danger" style="padding:7px 10px;" onclick="deleteCatalogItem(\\'' + (item.plu || item.articul) + '\\')">🗑</button>' : ''}
            </div>
          </div>
        </div>
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

    // Редактирование и добавление в каталог
    let editingCatalogPlu = null;

    function openAddCatalogModal() {
      editingCatalogPlu = null;
      document.getElementById('catEditPlu').textContent = 'Новая позиция';
      document.getElementById('catPluInputGroup').style.display = 'block';
      document.getElementById('catNewPlu').value = '';
      document.getElementById('catEditName').value = '';
      document.getElementById('catEditCategory').value = 'Красная рыба';
      document.getElementById('catEditShelfLife').value = 10;
      document.getElementById('catEditDescription').value = '';
      document.getElementById('editCatalogModal').style.display = 'flex';
      setTimeout(() => document.getElementById('catNewPlu').focus(), 50);
    }

    function openEditCatalogModal(plu) {
      const item = catalogList.find(c => c.plu === plu);
      if (!item) return;
      editingCatalogPlu = plu;
      document.getElementById('catEditPlu').textContent = 'PLU: ' + plu;
      document.getElementById('catPluInputGroup').style.display = 'none';
      document.getElementById('catEditName').value = item.name || '';
      document.getElementById('catEditCategory').value = item.category || 'Красная рыба';
      document.getElementById('catEditShelfLife').value = item.shelf_life || 10;
      document.getElementById('catEditDescription').value = item.description || '';
      document.getElementById('editCatalogModal').style.display = 'flex';
    }

    function closeEditCatalogModal(e) {
      if (!e || e.target === document.getElementById('editCatalogModal') || e.type === 'click') {
        document.getElementById('editCatalogModal').style.display = 'none';
        editingCatalogPlu = null;
      }
    }

    async function handleSaveEditCatalog(e) {
      e.preventDefault();
      const isNew = !editingCatalogPlu;
      const plu = isNew ? document.getElementById('catNewPlu').value.trim() : editingCatalogPlu;
      if (!plu) {
        showToast('Укажите PLU код позиции', true);
        return;
      }

      const updates = {
        plu: plu,
        name: document.getElementById('catEditName').value.trim(),
        category: document.getElementById('catEditCategory').value,
        shelf_life: parseInt(document.getElementById('catEditShelfLife').value, 10) || 10,
        description: document.getElementById('catEditDescription').value.trim()
      };

      try {
        const url = isNew ? '/catalog' : ('/catalog/' + encodeURIComponent(editingCatalogPlu));
        const method = isNew ? 'POST' : 'PUT';
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + currentToken
          },
          body: JSON.stringify(updates)
        });

        if (!res.ok) {
          const err = await res.json();
          showToast(err.error || 'Ошибка сохранения в каталог', true);
          return;
        }

        showToast(isNew ? 'Новая позиция добавлена в каталог!' : 'Описание и данные позиции обновлены в каталоге!');
        closeEditCatalogModal();
        loadCatalogData();
        loadItems();
      } catch (err) {
        showToast('Ошибка сети: ' + err.message, true);
      }
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
            logout();
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
            <p style="font-size:1.05rem; color:#fff;">На складе нет партий</p>
            <p style="font-size:0.84rem; margin-top:4px;">Отсканируйте товар на вкладке "Сканер / Приемка"</p>
          </div>
        \`;
        return;
      }

      container.innerHTML = filtered.map(item => {
        const days = getDaysDiff(item.date.end);
        let expClass = 'exp-fresh';
        let expText = '🟢 Еще ' + days + ' дн.';
        if (days < 0) {
          expClass = 'exp-expired';
          expText = '🔴 Истёк (' + Math.abs(days) + ' дн.)';
        } else if (days === 0) {
          expClass = 'exp-warning';
          expText = '🟡 Сегодня';
        } else if (days <= 3) {
          expClass = 'exp-warning';
          expText = '🟡 ' + days + ' дн.';
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
                  <span class="code-tag" style="color:#64748b;">#\${item.id}</span>
                </div>
              </div>
              <div class="expiry-badge \${expClass}">
                \${expText}
              </div>
            </div>

            \${item.description && item.description.trim() ? '<div class="row-desc">' + item.description + '</div>' : ''}

            <div class="row-details">
              <div>
                <span style="font-size:0.72rem; color:var(--text-muted); display:block;">Остаток</span>
                <span class="qty-display">\${item.quantity} кг</span>
              </div>
              <div class="dates-display">
                \${item.date.start} → \${item.date.end}
                \${item.shelf_life ? ' (' + item.shelf_life + ' дн.)' : ''}
              </div>
              <div class="row-actions">
                <button class="btn-action" onclick="quickEditQuantity(\${item.id}, \${item.quantity})">✏️ Вес</button>
                <button class="btn-action" onclick="openEditModal(\${item.id})">⚙️ Правка</button>
                \${currentRole === 'admin' ? '<button class="btn-action btn-danger" onclick="deleteItem(' + item.id + ')">🗑</button>' : ''}
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
        description: descVal !== '' ? descVal : '',
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

        showToast('Партия "' + data.name + '" (' + data.quantity + ' кг) принята!');
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
        showToast('Требуются права Editor или Admin', true);
        return;
      }
      const newQtyStr = prompt('Введите новый вес в кг (текущий: ' + currentQty + ' кг):', currentQty);
      if (newQtyStr === null) return;
      const newQty = parseFloat(newQtyStr);
      if (isNaN(newQty) || newQty <= 0) {
        alert('Вес должен быть больше 0');
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

    function closeEditModal(e) {
      if (!e || e.target === document.getElementById('editItemModal') || e.type === 'click') {
        document.getElementById('editItemModal').style.display = 'none';
        editingItemId = null;
      }
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
        showToast('Удаление разрешено только Администратору', true);
        return;
      }
      if (!confirm('Удалить партию #' + id + '?')) return;

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

    // Инициализация при загрузке
    initAddForm();
    if (checkAuth()) {
      loadItems();
      loadCatalogData();
    } else {
      updateRoleBadge();
      showAuthModal(true);
    }
  </script>
</body>
</html>`;
}
