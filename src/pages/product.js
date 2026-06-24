import { formatMoney } from '../utils/money.js';
import { setQty, saveCart } from '../cart/cartStore.js';

export function createPageProduct(router, { pushToast }) {
  const page = document.createElement('div');
  page.className = 'container';

  const id = router.state.route.params.id;
  const p = router.state.products.find((x) => x.id === id);

  const header = document.createElement('div');
  header.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <button class="ghostBtn" id="backHome">Back</button>
      <button class="primaryBtn" id="goCart">Cart</button>
    </div>
  `;
  header.querySelector('#backHome').addEventListener('click', () => router.go('home'));
  header.querySelector('#goCart').addEventListener('click', () => router.go('cart'));

  if (!p) {
    const empty = document.createElement('div');
    empty.className = 'panel';
    empty.style.padding = '18px';
    empty.style.marginTop = '18px';
    empty.textContent = 'Product not found.';
    page.appendChild(header);
    page.appendChild(empty);
    return page;
  }

  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.style.marginTop = '18px';

  grid.innerHTML = `
    <div class="col-8 panel" style="padding:14px; border-radius: 20px;">
      <div class="imgWrap" style="height: 420px;">
        <img class="prodImg" style="height: 420px;" src="${p.image}" alt="${p.name}" />
      </div>
      <div style="margin-top:14px; display:flex; gap:12px; flex-wrap:wrap;">
        ${(p.notes || []).map((n) => `<span class="kbd">${n}</span>`).join('')}
      </div>
    </div>
    <div class="col-4 panel" style="padding:14px; border-radius: 20px; height: fit-content;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
        <div>
          <h2 style="margin:0; font-weight:950;">${p.name}</h2>
          <p style="margin:8px 0 0; color:var(--muted);">${p.category} • ${p.badge || 'Signature'}</p>
        </div>
        <span class="kbd">${p.brand}</span>
      </div>
      <div class="priceRow" style="margin-top:12px;">
        ${p.compareAt ? `<span class="price">${formatMoney(p.price)}</span><span class="strike" style="font-size:13px;">${formatMoney(p.compareAt)}</span>` : `<span class="price">${formatMoney(p.price)}</span>`}
      </div>
      <p style="margin:12px 0 0; color:var(--muted); font-size:13px;">A refined blend designed for long-lasting presence.</p>
      <button class="primaryBtn" style="width:100%; margin-top:14px;" id="addToCart">Add to cart</button>
      <div style="margin-top:12px; border-top:1px solid rgba(255,255,255,.10); padding-top:12px;">
        <div style="color:var(--muted); font-size:13px;">Need a recommendation?</div>
        <p style="margin:8px 0 0; font-weight:900;">Try pairing this with a clean citrus for contrast.</p>
      </div>
    </div>
  `;

  grid.querySelector('#addToCart').addEventListener('click', () => {
    const currentQty = router.state.cart.items.find((x) => x.productId === p.id)?.qty || 0;
    router.state.cart = setQty(router.state.cart, p.id, currentQty + 1);
    saveCart(router.state.cart);
    pushToast({ title: 'Added to cart', message: p.name, kind: 'ok' });
  });

  page.appendChild(header);
  page.appendChild(grid);
  return page;
}

