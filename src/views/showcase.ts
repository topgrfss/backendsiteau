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
      --salmon: #fb7185;
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
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }
    .brand-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: #fff;
    }
    .header-links {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-header {
      background: #172133;
      border: 1px solid var(--card-border);
      color: #cbd5e1;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
    }
    .btn-header:hover { color: #fff; background: #1e293b; border-color: var(--accent); }
    .btn-cart {
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      color: #090d16 !important;
      font-weight: 700;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .hero-banner {
      background: radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.15) 0%, rgba(9, 13, 22, 0) 70%), #0d1322;
      border-bottom: 1px solid var(--card-border);
      padding: 44px 24px 36px;
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
      margin-bottom: 14px;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .hero-h1 {
      font-size: 2.2rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    .hero-sub {
      color: var(--text-muted);
      font-size: 1rem;
      max-width: 620px;
      margin: 0 auto 28px;
    }
    .controls-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 24px 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .search-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .search-bar {
      flex: 1;
      min-width: 280px;
      position: relative;
    }
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
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }
    .cat-chips {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
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
    .cat-chip.active {
      background: var(--accent);
      color: #090d16;
      border-color: var(--accent);
    }
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
      position: relative;
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
    }
    .prod-title {
      font-size: 1.18rem;
      font-weight: 700;
      color: #fff;
      text-transform: capitalize;
      line-height: 1.3;
    }
    .prod-badge {
      display: inline-block;
      font-size: 0.72rem;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-family: monospace;
      background: #0d1322;
      color: var(--accent);
      border: 1px solid var(--card-border);
    }
    .prod-desc {
      font-size: 0.86rem;
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
      font-size: 0.82rem;
    }
    .spec-item { display: flex; flex-direction: column; }
    .spec-label { color: var(--text-muted); font-size: 0.72rem; }
    .spec-val { color: #fff; font-weight: 700; font-size: 0.92rem; }
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
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: auto;
    }
    .prod-btn:hover { background: var(--accent); color: #090d16; border-color: var(--accent); }
    /* Cart Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
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
    .modal-close {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.5rem;
      cursor: pointer;
    }
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
    <a href="/" class="brand">
      <div class="brand-icon">🐟</div>
      <div>
        <div class="brand-title">Siteau Seafood</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">Витрина свежих морепродуктов</div>
      </div>
    </a>
    <div class="header-links">
      <a href="/" class="btn-header">🏠 Портал</a>
      <a href="/dashboard" class="btn-header">📦 Панель склада</a>
      <button class="btn-header btn-cart" onclick="openCart()">
        <span>🛒 Заявка</span>
        <span id="cartCount" style="background:#090d16; color:#fff; padding:2px 8px; border-radius:12px; font-size:0.75rem;">0</span>
      </button>
    </div>
  </header>

  <section class="hero-banner">
    <div class="hero-tag">✨ Свежие поступления и витрина</div>
    <h1 class="hero-h1">Витрина рыбы и морепродуктов</h1>
    <p class="hero-sub">
      Отборная охлажденная рыба, северный вылов, порционные стейки и диетическое филе с гарантированным контролем свежести и сроков годности.
    </p>
  </section>

  <div class="controls-wrapper">
    <div class="search-row">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" id="searchInput" class="search-input" placeholder="Поиск по названию (форель, лосось, треска), PLU коду или описанию..." oninput="filterShowcase()" />
      </div>
    </div>
    <div class="cat-chips">
      <button class="cat-chip active" data-cat="all" onclick="selectCategory('all', this)">Все позиции</button>
      <button class="cat-chip" data-cat="salmon" onclick="selectCategory('salmon', this)">Красная рыба (Форель / Лосось)</button>
      <button class="cat-chip" data-cat="white" onclick="selectCategory('white', this)">Белая морская рыба</button>
      <button class="cat-chip" data-cat="fillet" onclick="selectCategory('fillet', this)">Филе и стейки</button>
      <button class="cat-chip" data-cat="river" onclick="selectCategory('river', this)">Речная и озерная рыба</button>
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
      <div id="cartList" class="cart-items-list">
        <!-- Cart items -->
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; padding-top:12px; border-top:1px solid var(--card-border); font-weight:700;">
        <span>Итого позиций:</span>
        <span id="cartTotal" style="color:var(--accent);">0 ед.</span>
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
        filterShowcase();
      } catch (err) {
        document.getElementById('showcaseGrid').innerHTML = '<div style="color:#ef4444; text-align:center; padding:40px;">Ошибка загрузки товаров: ' + err.message + '</div>';
      }
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
        const plu = (item.plu || '').toLowerCase();

        // Категории
        let matchCat = true;
        if (activeCat === 'salmon') {
          matchCat = name.includes('форель') || name.includes('лосось');
        } else if (activeCat === 'white') {
          matchCat = name.includes('треска') || name.includes('пикша') || name.includes('камбала') || name.includes('минтай') || name.includes('зубатка');
        } else if (activeCat === 'fillet') {
          matchCat = name.includes('филе') || name.includes('стейк');
        } else if (activeCat === 'river') {
          matchCat = name.includes('щука') || name.includes('судак') || name.includes('лещ') || name.includes('карась') || name.includes('карп') || name.includes('сазан');
        }

        if (!matchCat) return false;
        if (!q) return true;

        return name.includes(q) || desc.includes(q) || plu.includes(q);
      });

      if (!filtered.length) {
        grid.innerHTML = \`
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
            <div style="font-size: 44px; margin-bottom: 12px;">🔍</div>
            <p style="font-size: 1.1rem; color: #fff;">По вашему запросу ничего не найдено</p>
            <p style="font-size: 0.85rem; margin-top: 4px;">Попробуйте изменить поисковый запрос или категорию</p>
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

        return \`
          <div class="prod-card">
            <div class="prod-card-top">
              <div class="prod-icon">\${icon}</div>
              <div style="flex:1;">
                <div class="prod-title">\${item.name}</div>
                <div style="display:flex; gap:6px; margin-top:4px;">
                  \${item.plu ? '<span class="prod-badge">PLU: ' + item.plu + '</span>' : ''}
                  \${item.articul ? '<span class="prod-badge" style="color:#94a3b8;">АРТ: ' + item.articul + '</span>' : ''}
                </div>
              </div>
            </div>

            <div class="prod-desc">
              \${item.description || 'Высококачественная свежая рыбная продукция гарантированного качества.'}
            </div>

            <div class="prod-specs">
              <div class="spec-item">
                <span class="spec-label">В наличии на витрине</span>
                <span class="spec-val" style="color:var(--accent);">\${item.quantity} ед/кг</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Годен до</span>
                <span class="spec-val">\${item.date.end}</span>
              </div>
            </div>

            <div class="exp-pill \${expClass}">
              <span>\${expText}</span>
              \${item.shelf_life ? '<span style="font-size:0.75rem; opacity:0.8;">(срок ' + item.shelf_life + ' дн.)</span>' : ''}
            </div>

            <button class="prod-btn" onclick="addToCart(\${item.id}, '\${encodeURIComponent(item.name)}')">
              <span>🛒</span> Добавить в заявку
            </button>
          </div>
        \`;
      }).join('');
    }

    function addToCart(id, encName) {
      const name = decodeURIComponent(encName);
      const existing = cart.find(c => c.id === id);
      if (existing) {
        existing.count += 1;
      } else {
        cart.push({ id, name, count: 1 });
      }
      updateCartBadge();
      showToast('Добавлено в заявку: ' + name);
    }

    function updateCartBadge() {
      const total = cart.reduce((s, c) => s + c.count, 0);
      document.getElementById('cartCount').textContent = total;
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
              <span style="font-weight:700; min-width:20px; text-align:center;">\${c.count}</span>
              <button style="background:#1e293b; color:#fff; border:none; width:26px; height:26px; border-radius:4px; cursor:pointer;" onclick="changeQty(\${c.id}, 1)">+</button>
            </div>
          </div>
        \`).join('');
      }
      const total = cart.reduce((s, c) => s + c.count, 0);
      document.getElementById('cartTotal').textContent = total + ' ед.';
      modal.style.display = 'flex';
    }

    function changeQty(id, delta) {
      const item = cart.find(c => c.id === id);
      if (!item) return;
      item.count += delta;
      if (item.count <= 0) {
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
