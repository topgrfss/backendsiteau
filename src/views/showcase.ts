import { AppConfig } from '../config.js';

export function renderShowcaseHtml(config: AppConfig): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    /* Чисто клиентская шапка: никаких ссылок на админку и склад */
    header {
      background: #0d1322;
      border-bottom: 1px solid var(--card-border);
      padding: 16px 32px;
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
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
    }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .btn-cart {
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      color: #090d16 !important;
      font-weight: 700;
      border: none;
      padding: 9px 18px;
      border-radius: 10px;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-cart:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .cart-badge {
      background: #090d16;
      color: #fff;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .hero-banner {
      background: radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.15) 0%, rgba(9, 13, 22, 0) 70%), #0d1322;
      border-bottom: 1px solid var(--card-border);
      padding: 40px 24px 32px;
      text-align: center;
    }
    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(56, 189, 248, 0.15);
      color: var(--accent);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 12px;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .hero-h1 {
      font-size: 2.2rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 10px;
      letter-spacing: -0.02em;
    }
    .hero-sub {
      color: var(--text-muted);
      font-size: 1rem;
      max-width: 620px;
      margin: 0 auto;
      line-height: 1.5;
    }
    .controls-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 24px 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .search-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .search-bar { flex: 1; min-width: 280px; position: relative; }
    .search-input {
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 12px 16px 12px 42px;
      color: #fff;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus { border-color: var(--accent); }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
    .cat-chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; }
    .cat-chip {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 8px 16px;
      border-radius: 30px;
      font-size: 0.86rem;
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
      padding: 24px;
    }
    .showcase-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .prod-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: all 0.25s;
    }
    .prod-card:hover {
      transform: translateY(-3px);
      border-color: #334155;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    }
    .prod-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    .prod-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #172133;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      border: 1px solid var(--card-border);
      flex-shrink: 0;
    }
    .prod-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
      text-transform: capitalize;
      line-height: 1.3;
    }
    .prod-category {
      display: inline-block;
      font-size: 0.74rem;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      background: #0d1322;
      color: var(--accent);
      border: 1px solid var(--card-border);
      margin-top: 4px;
    }
    .prod-desc {
      font-size: 0.88rem;
      color: #94a3b8;
      line-height: 1.5;
      background: #090d16;
      padding: 10px 14px;
      border-radius: 8px;
      border-left: 3px solid var(--accent);
    }
    .prod-specs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      background: #0d1322;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid var(--card-border);
    }
    .spec-item { display: flex; flex-direction: column; }
    .spec-label { color: var(--text-muted); font-size: 0.72rem; }
    .spec-val { color: #fff; font-weight: 700; font-size: 0.95rem; }
    .exp-pill {
      font-size: 0.8rem;
      padding: 6px 12px;
      border-radius: 8px;
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
      padding: 11px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: auto;
    }
    .prod-btn:hover { background: var(--accent); color: #090d16; border-color: var(--accent); }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.75);
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
      border-radius: 16px;
      padding: 24px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 12px;
    }
    .modal-title { font-size: 1.25rem; font-weight: 700; color: #fff; }
    .modal-close { background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }
    .cart-items-list {
      max-height: 280px;
      overflow-y: auto;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .cart-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #090d16;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.9rem;
    }
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
      <span id="cartCount" class="cart-badge">0</span>
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
        <input type="text" id="searchInput" class="search-input" placeholder="Поиск по названию (форель, лосось, треска) или описанию..." oninput="filterShowcase()" />
      </div>
    </div>
    <div id="categoryChips" class="cat-chips">
      <button class="cat-chip active" data-cat="all" onclick="selectCategory('all', this)">Все категории</button>
    </div>
  </div>

  <main>
    <div id="showcaseGrid" class="showcase-grid">
      <div style="text-align:center; padding:60px; grid-column:1/-1; color:var(--text-muted);">Загрузка витрины...</div>
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
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; padding-top:12px; border-top:1px solid var(--card-border); font-weight:700;">
        <span>Итого объем:</span>
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
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
            <div style="font-size: 44px; margin-bottom: 12px;">🌊</div>
            <p style="font-size: 1.1rem; color: #fff;">На витрине сейчас нет таких позиций</p>
            <p style="font-size: 0.85rem; margin-top: 4px;">Попробуйте выбрать другую категорию или изменить поиск</p>
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
          expText = '🔴 Истёк срок годности';
        } else if (days <= 3) {
          expClass = 'exp-pill-warning';
          expText = '🟡 Скоро истекает (' + days + ' дн.)';
        }

        let icon = '🐟';
        const lower = (item.name || '').toLowerCase();
        if (lower.includes('стейк')) icon = '🥩';
        else if (lower.includes('филе')) icon = '🧊';
        else if (lower.includes('форель') || lower.includes('лосось')) icon = '🍣';

        // На витрине НЕ пишем PLU и артикул, описание пишем только если есть
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
        list.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">Заявка пуста. Выберите позиции на витрине.</div>';
      } else {
        list.innerHTML = cart.map(c => \`
          <div class="cart-row">
            <div>
              <strong style="color:#fff; text-transform:capitalize;">\${c.name}</strong>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button style="background:#1e293b; color:#fff; border:none; width:26px; height:26px; border-radius:4px; cursor:pointer;" onclick="changeQty(\${c.id}, -1)">-</button>
              <span style="font-weight:700; min-width:44px; text-align:center;">\${c.weightKg} кг</span>
              <button style="background:#1e293b; color:#fff; border:none; width:26px; height:26px; border-radius:4px; cursor:pointer;" onclick="changeQty(\${c.id}, 1)">+</button>
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
