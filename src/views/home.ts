import { AppConfig } from '../config.js';

export function renderHomeHtml(config: AppConfig, itemsCount: number, catalogCount: number): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Siteau — Рыбная продукция и управление складом</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1f293d;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --accent-hover: #0284c7;
      --success: #10b981;
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
      padding: 18px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      text-decoration: none;
      color: inherit;
    }
    .brand-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
    }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #fff;
    }
    .brand-sub {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .nav-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      padding: 8px 14px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .nav-link:hover { color: #fff; background: rgba(255,255,255,0.05); }
    .btn-showcase {
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      color: #090d16 !important;
      font-weight: 700 !important;
    }
    .btn-showcase:hover { filter: brightness(1.1); }
    main {
      flex: 1;
      max-width: 1180px;
      width: 100%;
      margin: 0 auto;
      padding: 48px 24px;
    }
    .hero {
      text-align: center;
      margin-bottom: 56px;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(56, 189, 248, 0.12);
      color: var(--accent);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;
      border: 1px solid rgba(56, 189, 248, 0.3);
      margin-bottom: 20px;
    }
    .hero-title {
      font-size: 2.6rem;
      font-weight: 800;
      line-height: 1.2;
      color: #fff;
      margin-bottom: 16px;
      letter-spacing: -0.03em;
    }
    .hero-desc {
      font-size: 1.12rem;
      color: var(--text-muted);
      max-width: 680px;
      margin: 0 auto 32px;
      line-height: 1.6;
    }
    .hero-buttons {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .hero-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 1rem;
      text-decoration: none;
      transition: all 0.2s;
    }
    .hero-btn-primary {
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      color: #090d16;
      box-shadow: 0 4px 18px rgba(56, 189, 248, 0.35);
    }
    .hero-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(56, 189, 248, 0.45); }
    .hero-btn-secondary {
      background: #172133;
      color: #fff;
      border: 1px solid var(--card-border);
    }
    .hero-btn-secondary:hover { background: #1e293b; border-color: #38bdf8; }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }
    .portal-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 32px 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.25s;
      position: relative;
      text-decoration: none;
      color: inherit;
    }
    .portal-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
    }
    .portal-card-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
    }
    .portal-card-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: #fff;
    }
    .portal-card-desc {
      font-size: 0.92rem;
      color: var(--text-muted);
      line-height: 1.5;
    }
    .portal-card-footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--accent);
    }
    .system-status-box {
      background: #0d1322;
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 10px var(--success);
    }
    footer {
      border-top: 1px solid var(--card-border);
      padding: 24px;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <header>
    <a href="/" class="brand">
      <div class="brand-icon">🐟</div>
      <div>
        <div class="brand-title">Siteau</div>
        <div class="brand-sub">Рыбная витрина и складской учет</div>
      </div>
    </a>
    <nav class="nav-links">
      <a href="/showcase" class="nav-link btn-showcase">🌟 Витрина продуктов</a>
      <a href="/dashboard" class="nav-link">📦 Панель склада</a>
      <a href="/api-docs" class="nav-link">📡 API Документация</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <div class="hero-badge">
        <span>⚡</span> Сервер онлайн • Порт ${config.port} • v${config.version}
      </div>
      <h1 class="hero-title">
        Управление рыбной продукцией,<br />витрина и контроль сроков годности
      </h1>
      <p class="hero-desc">
        Единая платформа для демонстрации ассортимента свежей рыбы покупателям, отслеживания остатков на складе и автоматической синхронизации со справочником PLU.
      </p>
      <div class="hero-buttons">
        <a href="/showcase" class="hero-btn hero-btn-primary">
          <span>🌟</span> Открыть витрину (/showcase)
        </a>
        <a href="/dashboard" class="hero-btn hero-btn-secondary">
          <span>📦</span> Панель склада (/dashboard)
        </a>
      </div>
    </section>

    <div class="cards-grid">
      <a href="/showcase" class="portal-card">
        <div class="portal-card-icon" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
          🐟
        </div>
        <div class="portal-card-title">Витрина товаров (/showcase)</div>
        <div class="portal-card-desc">
          Красивый каталог продукции для покупателей и менеджеров: форель, лосось, треска, филе, стейки, краткие описания, нормативные сроки годности, фильтры по видам и корзина заказа.
        </div>
        <div class="portal-card-footer">
          Перейти на витрину &rarr;
        </div>
      </a>

      <a href="/dashboard" class="portal-card">
        <div class="portal-card-icon" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">
          📦
        </div>
        <div class="portal-card-title">Склад и Сроки годности (/dashboard)</div>
        <div class="portal-card-desc">
          Складская панель: оперативный мониторинг партий, светофор сроков годности (свежий/скоро истекает/просрочен), быстрое добавление с авто-сохранением новых позиций в каталог и сканер PLU.
        </div>
        <div class="portal-card-footer">
          Открыть панель склада &rarr;
        </div>
      </a>

      <a href="/api-docs" class="portal-card">
        <div class="portal-card-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">
          📡
        </div>
        <div class="portal-card-title">REST API & Тестирование (/api-docs)</div>
        <div class="portal-card-desc">
          Техническая справка по всем эндпоинтам (/login, /items, /items/scan, /catalog), Bearer токены ролей (Admin, Editor, Viewer), тестовый песочник и ловушки ботов.
        </div>
        <div class="portal-card-footer">
          Смотреть API &rarr;
        </div>
      </a>
    </div>

    <div class="system-status-box">
      <div class="status-indicator">
        <span class="status-dot"></span>
        <div>
          <strong style="color: #fff; font-size: 0.95rem;">API сервер активен</strong>
          <div style="color: var(--text-muted); font-size: 0.8rem;">Siteau Express Engine • Node.js Runtime</div>
        </div>
      </div>
      <div style="display: flex; gap: 20px; font-size: 0.88rem; color: #cbd5e1;">
        <div>Позиций на витрине: <strong style="color: var(--accent);">${itemsCount}</strong></div>
        <div>Справочник PLU: <strong style="color: var(--success);">${catalogCount}</strong></div>
      </div>
    </div>
  </main>

  <footer>
    Siteau Backend Service &bull; ${new Date().getFullYear()}
  </footer>
</body>
</html>`;
}
