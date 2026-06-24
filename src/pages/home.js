import { formatMoney } from '../utils/money.js';

export function createPageHome(router, { pushToast }) {
  const page = document.createElement('div');
  page.className = 'container';

  const hero = document.createElement('div');
  hero.className = 'hero';
  hero.innerHTML = `
    <div class="heroMain card">
      <h1 class="hTitle">Luxury perfume, shipped fast.</h1>
      <p class="hSub">Discover signature scents crafted for nights out, mornings in, and everything between.</p>
      <div class="ctaRow">
        <button class="primaryBtn" id="shopBtn">Shop perfumes</button>
        <button class="ghostBtn" id="trackBtn">Track an order</button>
      </div>
      <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap;">
        <span class="kbd">Secure checkout</span>
        <span class="kbd">Easy returns</span>
        <span class="kbd">Coupon-ready</span>
      </div>
    </div>
    <div class="panel" style="padding:18px; border-radius: var(--radius);">
      <h3 style="margin:0; font-weight:900;">Today’s picks</h3>
      <p style="margin:8px 0 14px; color:var(--muted); font-size:13px;">Tap a card to see details.</p>
      <div id="picks" style="display:flex; flex-direction:column; gap:12px;"></div>
    </div>
  `;

  const picks = hero.querySelector('#picks');
  const pickItems = router.state.products.slice(0, 3);

  pickItems.forEach((p) => {
    const row = document.createElement('div');
    row.className = 'panel';
    row.style.padding = '12px';
    row.style.borderRadius = '16px';
    row.style.display = 'flex';
    row.style.gap = '12px';
    row.style.alignItems = 'center';
    row.innerHTML = `
      <div class="imgWrap" style="width:58px; height:58px; flex:0 0 auto; border-radius:16px;">
        <img class="prodImg" style="height:58px;" alt="${p.name}" src="${p.image}" />
      </div>
      <div style="min-width:0;">
        <p style="margin:0; font-weight:900;">${p.name}</p>
        <p style="margin:4px 0 0; color:var(--muted); font-size:13px;">${formatMoney(p.price)}</p>
      </div>
    `;
    row.addEventListener('click', () => router.go('product', { id: p.id }));
    row.style.cursor = 'pointer';
    picks.appendChild(row);
  });

  hero.querySelector('#shopBtn').addEventListener('click', () => {
    document.getElementById('productGrid')?.scrollIntoView({ behavior: 'smooth' });
  });

  hero.querySelector('#trackBtn').addEventListener('click', () => router.go('tracking', { orderId: 'latest' }));

  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.gap = '12px';
  controls.style.flexWrap = 'wrap';
  controls.style.marginTop = '18px';
  controls.innerHTML = `
    <div class="panel" style="padding:12px 14px; border-radius: 16px; flex: 1 1 260px;">
      <label class="label" for="searchInput">Search</label>
      <input id="searchInput" class="input" placeholder="e.g. rose, amber, clean" />
    </div>
    <div class="panel" style="padding:12px 14px; border-radius: 16px; width: 260px; max-width: 100%;">
      <label class="label" for="sortSelect">Sort</label>
      <select id="sortSelect" class="select">
        <option value="featured">Featured</option>
        <option value="priceAsc">Price: low to high</option>
        <option value="priceDesc">Price: high to low</option>
      </select>
    </div>
  `;

  const grid = document.createElement('div');
  grid.id = 'productGrid';
  grid.className = 'grid';

  function renderGrid(items) {
    grid.innerHTML = '';
    items.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'productCard panel col-4';
      card.style.cursor = 'pointer';
      card.innerHTML = `
        <div class="imgWrap">
          <img class="prodImg" src="${p.image}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="prodTop">
          <div style="min-width:0;">
            <p class="prodName">${p.name}</p>
            <p class="prodMeta">${p.category} • ${p.badge || 'Signature'}</p>
          </div>
          <span class="kbd" style="flex:0 0 auto;">${formatMoney(p.price)}</span>
        </div>
        <div class="priceRow">
          ${p.compareAt ? `<span class="price">${formatMoney(p.price)}</span><span class="strike" style="font-size:13px;">${formatMoney(p.compareAt)}</span>` : `<span class="price">${formatMoney(p.price)}</span>`}
        </div>
        <button class="smallBtn" style="margin-top:8px;" data-add="${p.id}">Add to cart</button>
      `;

      card.addEventListener('click', (e) => {
        if (e.target && e.target.getAttribute && e.target.getAttribute('data-add')) return;
        router.go('product', { id: p.id });
      });

      grid.appendChild(card);
    });
  }

  async function attachAddHandlers(items) {
    const mod = await import('../cart/cartStore.js');
    const { setQty, saveCart } = mod;

    items.forEach((p) => {
      const btn = grid.querySelector(`[data-add="${p.id}"]`);
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentQty = router.state.cart.items.find((x) => x.productId === p.id)?.qty || 0;
        router.state.cart = setQty(router.state.cart, p.id, currentQty + 1);
        saveCart(router.state.cart);
        pushToast({ title: 'Added to cart', message: p.name, kind: 'ok' });
        router.go('cart');
      });
    });
  }


  function getVisible() {
    const q = (controls.querySelector('#searchInput').value || '').trim().toLowerCase();
    const sort = controls.querySelector('#sortSelect').value;
    let items = [...router.state.products];
    if (q) {
      items = items.filter((p) => {
        const hay = [p.name, p.category, ...(p.notes || []), p.badge].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }
    if (sort === 'priceAsc') items.sort((a, b) => a.price - b.price);
    if (sort === 'priceDesc') items.sort((a, b) => b.price - a.price);
    if (sort === 'featured') items = items;
    return items;
  }

  let visible = getVisible();
  renderGrid(visible);
  attachAddHandlers(visible);

  function refresh() {
    visible = getVisible();
    renderGrid(visible);
    attachAddHandlers(visible);
  }


  controls.querySelector('#searchInput').addEventListener('input', () => {
    const items = getVisible();
    renderGrid(items);
    attachAddHandlers(items);
  });

  controls.querySelector('#sortSelect').addEventListener('change', () => {
    const items = getVisible();
    renderGrid(items);
    attachAddHandlers(items);
  });

  page.appendChild(hero);
  page.appendChild(controls);
  page.appendChild(grid);

  return page;
}

