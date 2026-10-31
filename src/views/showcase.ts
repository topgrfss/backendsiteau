import { AppConfig } from '../config.js';

export function renderShowcaseHtml(config: AppConfig): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Витрина продукции — Siteau Seafood</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1f293d;
      --card-hover: #172133;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --accent-hover: #0284c7;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
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
    /* Клиентская шапка: без PLU и без ссылок на склад */
    header {
      background: #0d1322;
      border-bottom: 1px solid var(--card-border);
      padding: 12px 20px;
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
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
      flex-shrink: 0;
    }
    .brand-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .btn-cart {
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      color: #090d16 !important;
      font-weight: 700;
      border: none;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 0.88rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      min-height: 40px;
    }
    .btn-cart:hover { filter: brightness(1.1); }
    .cart-badge {
      background: #090d16;
      color: #fff;
      padding: 2px 7px;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .hero-banner {
      background: radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.15) 0%, rgba(9, 13, 22, 0) 70%), #0d1322;
      border-bottom: 1px solid var(--card-border);
      padding: 28px 18px 24px;
      text-align: center;
    }
    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(56, 189, 248, 0.15);
      color: var(--accent);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.76rem;
      font-weight: 700;
      margin-bottom: 10px;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .hero-h1 {
      font-size: 1.8rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .hero-sub {
      color: var(--text-muted);
      font-size: 0.92rem;
      max-width: 580px;
      margin: 0 auto;
      line-height: 1.45;
    }
    .controls-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 18px 16px 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }
    .search-row { display: flex; gap: 10px; }
    .search-bar { flex: 1; position: relative; }
    .search-input {
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 12px 16px 12px 40px;
      color: #fff;
      font-size: 16px; /* Предотвращает зум на мобильных */
      outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus { border-color: var(--accent); }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
    .cat-chips { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: none; }
    .cat-chips::-webkit-scrollbar { display: none; }
    .cat-chip {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 7px 14px;
      border-radius: 25px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .cat-chip:hover { color: #fff; border-color: var(--accent); }
    .cat-chip.active { background: var(--accent); color: #090d16; border-color: var(--accent); }
    main {
      flex: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 16px;
    }
    .showcase-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .prod-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.25s;
    }
    .prod-card:hover {
      transform: translateY(-2px);
      border-color: #334155;
      box-shadow: 0 8px 20px rgba(0,0,0,0.35);
    }
    .prod-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
    }
    .prod-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #172133;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      border: 1px solid var(--card-border);
      flex-shrink: 0;
    }
    .prod-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      text-transform: capitalize;
      line-height: 1.25;
    }
    .prod-category {
      display: inline-block;
      font-size: 0.72rem;
      padding: 2px 7px;
      border-radius: 4px;
      font-weight: 700;
      background: #0d1322;
      color: var(--accent);
      border: 1px solid var(--card-border);
      margin-top: 4px;
    }
    .prod-desc {
      font-size: 0.86rem;
      color: #94a3b8;
      line-height: 1.45;
      background: #090d16;
      padding: 10px 12px;
      border-radius: 8px;
      border-left: 3px solid var(--accent);
    }
    .prod-specs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: #0d1322;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--card-border);
    }
    .spec-item { display: flex; flex-direction: column; }
    .spec-label { color: var(--text-muted); font-size: 0.7rem; }
    .spec-val { color: #fff; font-weight: 700; font-size: 0.92rem; }
    .exp-pill {
      font-size: 0.78rem;
      padding: 6px 10px;
      border-radius: 6px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .exp-pill-fresh { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .exp-pill-warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .exp-pill-expired { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .prod-btn {
      background: #172133;
      border: 1px solid var(--card-border);
      color: #fff;
      padding: 12px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 44px;
      margin-top: auto;
    }
    .prod-btn:hover { background: var(--accent); color: #090d16; border-color: var(--accent); }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 16px;
    }
    .modal {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 20px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 10px;
    }
    .modal-title { font-size: 1.15rem; font-weight: 700; color: #fff; }
    .modal-close { background: none; border: none; color: var(--text-muted); font-size: 1.4rem; cursor: pointer; }
    .cart-items-list {
      max-height: 260px;
      overflow-y: auto;
      margin-bottom: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .cart-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #090d16;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 0.88rem;
    }
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
    @media (max-width: 640px) {
      header { padding: 10px 14px; }
      .brand-title { font-size: 1rem; }
      .brand-sub { display: none; }
      .hero-banner { padding: 20px 14px 18px; }
      .hero-h1 { font-size: 1.45rem; }
      .showcase-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <a href="/showcase" class="brand">
      <div class="brand-icon">🐟</div>
      <div>
        <div class="brand-title">Siteau Seafood</div>
        <div class="brand-sub">Свежая рыба и морепродукты</div>
      </div>
    </a>
    <button class="btn-cart" onclick="openCart()">
      <span>🛒 Заявка</span>
      <span id="cartCount" class="cart-badge">0 кг</span>
    </button>
  </header>

  <section class="hero-banner">
    <div class="hero-tag">✨ Свежая продукция на витрине</div>
    <h1 class="hero-h1">Витрина отборных морепродуктов</h1>
    <p class="hero-sub">
      Охлажденная рыба, северный вылов, порционные стейки и филе со строгим контролем сроков свежести.
    </p>
  </section>

  <div class="controls-wrapper">
    <div class="search-row">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" id="searchInput" class="search-input" placeholder="Поиск по названию (форель, лосось, треска)..." oninput="filterShowcase()" />
      </div>
    </div>
    <div id="categoryChips" class="cat-chips">
      <button class="cat-chip active" data-cat="all" onclick="selectCategory('all', this)">Все категории</button>
    </div>
  </div>

  <main>
    <div id="showcaseGrid" class="showcase-grid">
      <div style="text-align:center; padding:48px; grid-column:1/-1; color:var(--text-muted);">Загрузка витрины...</div>
    </div>
  </main>

  <!-- Cart Modal -->
  <div id="cartModal" class="modal-backdrop" onclick="closeCart(event)">
    <div class="modal" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div class="modal-title">Ваша заявка на поставку</div>
        <button class="modal-close" onclick="closeCart()">&times;</button>
      </div>
      <div id="cartList" class="cart-items-list"></div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-top:10px; border-top:1px solid var(--card-border); font-weight:700;">
        <span>Итого вес:</span>
        <span id="cartTotal" style="color:var(--accent);">0 кг</span>
      </div>
      <button class="prod-btn" style="background:var(--accent); color:#090d16; width:100%; border:none;" onclick="submitOrder()">
        ✅ Подтвердить заявку
      </button>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    let showcaseItems = [];
    let cart = [];
    let activeCat = 'all';

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 2500);
    }

    async function loadShowcase() {
      try {
        const res = await fetch('/items', {
          headers: { 'Authorization': 'Bearer ${config.viewerToken}' }
        });
        showcaseItems = await res.json();
        buildCategories();
        filterShowcase();
      } catch (err) {
        document.getElementById('showcaseGrid').innerHTML = '<div style="color:#ef4444; text-align:center; padding:40px;">Ошибка загрузки витрины: ' + err.message + '</div>';
      }
    }

    function buildCategories() {
      const cats = new Set();
      showcaseItems.forEach(i => {
        if (i.category && i.category.trim()) cats.add(i.category.trim());
      });

      const container = document.getElementById('categoryChips');
      let html = '<button class="cat-chip active" data-cat="all" onclick="selectCategory(\\'all\\', this)">Все категории</button>';
      cats.forEach(c => {
        html += \`<button class="cat-chip" data-cat="\${c}" onclick="selectCategory('\${c}', this)">\${c}</button>\`;
      });
      container.innerHTML = html;
    }

    function getDaysDiff(endIso) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const end = new Date(endIso);
      end.setHours(0,0,0,0);
      return Math.round((end - today) / (1000 * 60 * 60 * 24));
    }

    function selectCategory(cat, el) {
      activeCat = cat;
      document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      filterShowcase();
    }

    function filterShowcase() {
      const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
      const grid = document.getElementById('showcaseGrid');

      const filtered = showcaseItems.filter(item => {
        const name = (item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();

        if (activeCat !== 'all') {
          if (cat !== activeCat.toLowerCase()) return false;
        }

        if (!q) return true;
        return name.includes(q) || desc.includes(q);
      });

      if (!filtered.length) {
        grid.innerHTML = \`
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; color: var(--text-muted);">
            <div style="font-size: 38px; margin-bottom: 10px;">🌊</div>
            <p style="font-size: 1.05rem; color: #fff;">Позиций не найдено</p>
            <p style="font-size: 0.82rem; margin-top: 4px;">Попробуйте выбрать другую категорию</p>
          </div>
        \`;
        return;
      }

      grid.innerHTML = filtered.map(item => {
        const days = getDaysDiff(item.date.end);
        let expClass = 'exp-pill-fresh';
        let expText = '🟢 Свежий привоз (еще ' + days + ' дн.)';
        if (days < 0) {
          expClass = 'exp-pill-expired';
          expText = '🔴 Истёк срок';
        } else if (days <= 3) {
          expClass = 'exp-pill-warning';
          expText = '🟡 Скоро истекает (' + days + ' дн.)';
        }

        let icon = '🐟';
        const lower = (item.name || '').toLowerCase();
        if (lower.includes('стейк')) icon = '🥩';
        else if (lower.includes('филе')) icon = '🧊';
        else if (lower.includes('форель') || lower.includes('лосось')) icon = '🍣';

        // На витрине строго без PLU и артикула
        return \`
          <div class="prod-card">
            <div class="prod-card-top">
              <div class="prod-icon">\${icon}</div>
              <div style="flex:1;">
                <div class="prod-title">\${item.name}</div>
                \${item.category ? '<span class="prod-category">' + item.category + '</span>' : ''}
              </div>
            </div>

            \${item.description && item.description.trim() ? '<div class="prod-desc">' + item.description + '</div>' : ''}

            <div class="prod-specs">
              <div class="spec-item">
                <span class="spec-label">В наличии</span>
                <span class="spec-val" style="color:var(--accent);">\${item.quantity} кг</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Срок до</span>
                <span class="spec-val">\${item.date.end}</span>
              </div>
            </div>

            <div class="exp-pill \${expClass}">
              <span>\${expText}</span>
              \${item.shelf_life ? '<span style="font-size:0.75rem; opacity:0.8;">(срок ' + item.shelf_life + ' дн.)</span>' : ''}
            </div>

            <button class="prod-btn" onclick="addToCart(\${item.id}, '\${encodeURIComponent(item.name)}')">
              <span>🛒</span> Заказать в заявку
            </button>
          </div>
        \`;
      }).join('');
    }

    function addToCart(id, encName) {
      const name = decodeURIComponent(encName);
      const existing = cart.find(c => c.id === id);
      if (existing) {
        existing.weightKg += 1;
      } else {
        cart.push({ id, name, weightKg: 1 });
      }
      updateCartBadge();
      showToast('Добавлено в заявку: ' + name);
    }

    function updateCartBadge() {
      const total = cart.reduce((s, c) => s + c.weightKg, 0);
      document.getElementById('cartCount').textContent = total + ' кг';
    }

    function openCart() {
      const modal = document.getElementById('cartModal');
      const list = document.getElementById('cartList');
      if (!cart.length) {
        list.innerHTML = '<div style="text-align:center; padding:24px; color:var(--text-muted);">Заявка пуста. Выберите позиции на витрине.</div>';
      } else {
        list.innerHTML = cart.map(c => \`
          <div class="cart-row">
            <div>
              <strong style="color:#fff; text-transform:capitalize;">\${c.name}</strong>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button style="background:#1e293b; color:#fff; border:none; width:30px; height:30px; border-radius:4px; font-weight:700; cursor:pointer;" onclick="changeQty(\${c.id}, -1)">-</button>
              <span style="font-weight:700; min-width:44px; text-align:center;">\${c.weightKg} кг</span>
              <button style="background:#1e293b; color:#fff; border:none; width:30px; height:30px; border-radius:4px; font-weight:700; cursor:pointer;" onclick="changeQty(\${c.id}, 1)">+</button>
            </div>
          </div>
        \`).join('');
      }
      const total = cart.reduce((s, c) => s + c.weightKg, 0);
      document.getElementById('cartTotal').textContent = total + ' кг';
      modal.style.display = 'flex';
    }

    function changeQty(id, delta) {
      const item = cart.find(c => c.id === id);
      if (!item) return;
      item.weightKg += delta;
      if (item.weightKg <= 0) {
        cart = cart.filter(c => c.id !== id);
      }
      updateCartBadge();
      openCart();
    }

    function closeCart(e) {
      if (!e || e.target === document.getElementById('cartModal')) {
        document.getElementById('cartModal').style.display = 'none';
      }
    }

    function submitOrder() {
      if (!cart.length) {
        alert('Заявка пуста!');
        return;
      }
      alert('Заявка успешно сформирована! Менеджер свяжется для подтверждения поставки.');
      cart = [];
      updateCartBadge();
      closeCart();
    }

    loadShowcase();
  </script>
</body>
</html>`;
}
