import { formatMoney } from '../utils/money.js';
import { setQty, saveCart } from '../cart/cartStore.js';

export function createPageCart(router, { pushToast }) {
  const page = document.createElement('div');
  page.className = 'container';

  const cart = router.state.cart;
  const items = (cart.items || []).map((it) => ({
    ...it,
    product: router.state.products.find((p) => p.id === it.productId)
  })).filter((x) => x.product);

  const hasItems = items.length > 0;

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.innerHTML = `
    <div>
      <h2 style="margin:0; font-weight:950;">Your cart</h2>
      <p style="margin:8px 0 0; color:var(--muted);">Coupon & checkout available.</p>
    </div>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <button class="ghostBtn" id="continueBtn">Continue shopping</button>
      <button class="primaryBtn" id="checkoutBtn" ${hasItems ? '' : 'disabled'}>Checkout</button>
    </div>
  `;

  header.querySelector('#continueBtn').addEventListener('click', () => router.go('home'));
  header.querySelector('#checkoutBtn').addEventListener('click', () => router.go('checkout'));

  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.style.marginTop = '18px';

  const left = document.createElement('div');
  left.className = 'col-8';
  left.innerHTML = `
    <div class="panel" style="padding:14px;">
      <div class="tableWrap">
        <table class="table">
          <thead>
            <tr>
              <th style="width:44%;">Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody id="cartRows"></tbody>
        </table>
      </div>
    </div>
  `;

  const rows = left.querySelector('#cartRows');
  items.forEach((it) => {
    const tr = document.createElement('tr');
    const lineTotal = it.product.price * it.qty;
    tr.innerHTML = `
      <td>
        <div style="display:flex; gap:12px; align-items:center;">
          <div class="imgWrap" style="width:74px; height:74px; border-radius:18px;">
            <img class="prodImg" style="height:74px;" alt="${it.product.name}" src="${it.product.image}" />
          </div>
          <div>
            <p style="margin:0; font-weight:900;">${it.product.name}</p>
            <p style="margin:4px 0 0; color:var(--muted); font-size:13px;">${it.product.category}</p>
            <button style="margin-top:10px;" class="ghostBtn" data-remove="${it.product.id}">Remove</button>
          </div>
        </div>
      </td>
      <td>${formatMoney(it.product.price)}</td>
      <td>
        <div class="stepper">
          <button class="qtyBtn" data-dec="${it.product.id}">-</button>
          <div class="qty">${it.qty}</div>
          <button class="qtyBtn" data-inc="${it.product.id}">+</button>
        </div>
      </td>
      <td style="font-weight:900;">${formatMoney(lineTotal)}</td>
    `;

    tr.querySelector(`[data-dec="${it.product.id}"]`).addEventListener('click', () => {
      router.state.cart = setQty(router.state.cart, it.product.id, it.qty - 1);
      saveCart(router.state.cart);
      pushToast({ title: 'Cart updated', message: it.product.name, kind: 'ok' });
      router.reload();
    });
    tr.querySelector(`[data-inc="${it.product.id}"]`).addEventListener('click', () => {
      router.state.cart = setQty(router.state.cart, it.product.id, it.qty + 1);
      saveCart(router.state.cart);
      pushToast({ title: 'Cart updated', message: it.product.name, kind: 'ok' });
      router.reload();
    });
    tr.querySelector(`[data-remove="${it.product.id}"]`).addEventListener('click', () => {
      router.state.cart = setQty(router.state.cart, it.product.id, 0);
      saveCart(router.state.cart);
      pushToast({ title: 'Removed', message: it.product.name, kind: 'danger' });
      router.reload();
    });

    rows.appendChild(tr);
  });

  const right = document.createElement('div');
  right.className = 'col-4';
  right.innerHTML = `
    <div class="panel" style="padding:14px; height: fit-content;">
      <h3 style="margin:0; font-weight:950;">Order summary</h3>
      <div style="margin-top:12px; display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between;">
          <span class="muted">Subtotal</span>
          <span style="font-weight:900;" id="sumSubtotal"></span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span class="muted">Shipping</span>
          <span style="font-weight:900;">Calculated at checkout</span>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,.10); padding-top:12px; display:flex; justify-content:space-between;">
          <span style="font-weight:900;">Total</span>
          <span style="font-weight:950;" id="sumTotal"></span>
        </div>
        <button class="primaryBtn" style="width:100%; margin-top:10px;" ${hasItems ? '' : 'disabled'} id="goCheckout">Go to checkout</button>
        <p style="margin:10px 0 0; color:var(--muted); font-size:12px;">Coupons are applied during checkout.</p>
      </div>
    </div>
  `;

  const subtotal = items.reduce((s, it) => s + it.product.price * it.qty, 0);
  right.querySelector('#sumSubtotal').textContent = formatMoney(subtotal);
  right.querySelector('#sumTotal').textContent = formatMoney(subtotal);

  right.querySelector('#goCheckout').addEventListener('click', () => router.go('checkout'));

  if (!hasItems) {
    left.innerHTML = `
      <div style="padding:22px;">
        <h3 style="margin:0; font-weight:950;">Your cart is empty</h3>
        <p style="margin:8px 0 0; color:var(--muted);">Add a perfume to continue.</p>
        <button class="primaryBtn" style="margin-top:14px;" id="emptyShop">Browse products</button>
      </div>
    `;
    left.querySelector('#emptyShop').addEventListener('click', () => router.go('home'));
  }

  grid.appendChild(left);
  grid.appendChild(right);

  page.appendChild(header);
  page.appendChild(grid);
  return page;
}

