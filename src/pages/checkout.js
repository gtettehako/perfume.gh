import { formatMoney } from '../utils/money.js';
import { saveCart, setQty } from '../cart/cartStore.js';

export function createPageCheckout(router, { pushToast }) {
  const page = document.createElement('div');
  page.className = 'container';

  const items = (router.state.cart.items || [])
    .map((it) => ({
      ...it,
      product: router.state.products.find((p) => p.id === it.productId)
    }))
    .filter((x) => x.product);

  const hasItems = items.length > 0;

  const subtotal = items.reduce((s, it) => s + it.product.price * it.qty, 0);

  const header = document.createElement('div');
  header.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <h2 style="margin:0; font-weight:950;">Checkout</h2>
        <p style="margin:8px 0 0; color:var(--muted);">Coupon, shipping, and payment.</p>
      </div>
      <button class="ghostBtn" id="backCart">Back to cart</button>
    </div>
  `;
  header.querySelector('#backCart').addEventListener('click', () => router.go('cart'));

  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.style.marginTop = '18px';

  const left = document.createElement('div');
  left.className = 'col-8';
  left.innerHTML = `
    <div class="panel" style="padding:14px;">
      <h3 style="margin:0; font-weight:950;">Customer details</h3>
      <div style="margin-top:14px;">
        <div class="formRow">
          <div>
            <label class="label" for="shipName">Full name</label>
            <input id="shipName" class="input" placeholder="Alex Johnson" />
          </div>
          <div>
            <label class="label" for="shipEmail">Email</label>
            <input id="shipEmail" class="input" placeholder="alex@email.com" />
          </div>
        </div>
        <div class="formRow" style="margin-top:12px;">
          <div style="grid-column: 1 / -1;">
            <label class="label" for="shipAddr1">Address</label>
            <input id="shipAddr1" class="input" placeholder="123 Silk Street" />
          </div>
        </div>
        <div class="formRow" style="margin-top:12px;">
          <div>
            <label class="label" for="shipCity">City</label>
            <input id="shipCity" class="input" placeholder="Los Angeles" />
          </div>
          <div>
            <label class="label" for="shipCountry">Country</label>
            <select id="shipCountry" class="select">
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
          </div>
        </div>
      </div>

      <div style="margin-top:18px; border-top:1px solid rgba(255,255,255,.10); padding-top:18px;">
        <h3 style="margin:0; font-weight:950;">Payment method</h3>
        <div style="margin-top:12px; display:flex; gap:12px; flex-wrap:wrap;">
          <label class="panel" style="padding:12px 14px; border-radius:16px; cursor:pointer; flex:1 1 220px;">
            <input type="radio" name="pay" value="Card" checked /> <b>Card</b>
            <div style="margin-top:6px; color:var(--muted); font-size:12px;">Demo UI (no real payment).</div>
          </label>
          <label class="panel" style="padding:12px 14px; border-radius:16px; cursor:pointer; flex:1 1 220px;">
            <input type="radio" name="pay" value="PayPal" /> <b>PayPal</b>
            <div style="margin-top:6px; color:var(--muted); font-size:12px;">Redirect simulation.</div>
          </label>
          <label class="panel" style="padding:12px 14px; border-radius:16px; cursor:pointer; flex:1 1 220px;">
            <input type="radio" name="pay" value="Stripe" /> <b>Stripe</b>
            <div style="margin-top:6px; color:var(--muted); font-size:12px;">Demo UI (no real payment).</div>
          </label>
        </div>
      </div>

      <div style="margin-top:18px; border-top:1px solid rgba(255,255,255,.10); padding-top:18px;">
        <h3 style="margin:0; font-weight:950;">Coupon</h3>
        <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">
          <input id="couponCode" class="input" placeholder="Try SHADE10 or WELCOME15" style="flex: 1 1 260px;" />
          <button class="primaryBtn" id="applyCoupon">Apply</button>
        </div>
        <div id="couponMsg" style="margin-top:10px; color:var(--muted); font-size:13px;"></div>
      </div>

      <div style="margin-top:18px;">
        <button class="primaryBtn" style="width:100%; padding:14px 16px;" id="placeOrder" ${hasItems ? '' : 'disabled'}>Place order</button>
        <p style="margin:10px 0 0; color:var(--muted); font-size:12px;">By placing your order, you agree to demo terms.</p>
      </div>
    </div>
  `;

  const right = document.createElement('div');
  right.className = 'col-4';
  right.innerHTML = `
    <div class="panel" style="padding:14px; height: fit-content;">
      <h3 style="margin:0; font-weight:950;">Summary</h3>
      <div style="margin-top:12px; display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between;">
          <span class="muted">Items</span>
          <span style="font-weight:900;" id="sumItems"></span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span class="muted">Subtotal</span>
          <span style="font-weight:900;" id="sumSubtotal"></span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span class="muted">Discount</span>
          <span style="font-weight:900;" id="sumDiscount">${formatMoney(0)}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span class="muted">Shipping</span>
          <span style="font-weight:900;" id="sumShipping">Calculated</span>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,.10); padding-top:12px; display:flex; justify-content:space-between;">
          <span style="font-weight:900;">Total</span>
          <span style="font-weight:950;" id="sumTotal"></span>
        </div>
      </div>

      <div style="margin-top:14px; border-top:1px solid rgba(255,255,255,.10); padding-top:14px;">
        <h4 style="margin:0; font-weight:900;">Items in your order</h4>
        <div id="summaryItems" style="margin-top:12px; display:flex; flex-direction:column; gap:12px;">
        </div>
      </div>
    </div>
  `;

  const sumItems = items.reduce((s, it) => s + it.qty, 0);
  right.querySelector('#sumItems').textContent = String(sumItems);
  right.querySelector('#sumSubtotal').textContent = formatMoney(subtotal);

  const summaryItemsEl = right.querySelector('#summaryItems');
  items.forEach((it) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '12px';
    row.style.alignItems = 'center';
    row.innerHTML = `
      <div class="imgWrap" style="width:56px; height:56px; border-radius:16px;">
        <img class="prodImg" style="height:56px;" alt="${it.product.name}" src="${it.product.image}" />
      </div>
      <div style="min-width:0; flex:1;">
        <div style="font-weight:900;">${it.product.name}</div>
        <div style="color:var(--muted); font-size:13px;">Qty ${it.qty} • ${formatMoney(it.product.price)}</div>
      </div>
    `;
    summaryItemsEl.appendChild(row);
  });

  function calcTotals({ coupon, shippingCountry }) {
    const discount = coupon?.type === 'percent'
      ? Math.round(subtotal * coupon.amount)
      : coupon?.type === 'amount'
        ? coupon.amount
        : 0;

    const shipping = shippingCountry ? 8 : 0;
    const total = Math.max(0, subtotal - discount) + shipping;

    right.querySelector('#sumDiscount').textContent = formatMoney(discount);
    right.querySelector('#sumShipping').textContent = formatMoney(shipping);
    right.querySelector('#sumTotal').textContent = formatMoney(total);

    return { discount, shipping, total };
  }

  let activeCoupon = null;
  calcTotals({ coupon: activeCoupon, shippingCountry: null });

  left.querySelector('#applyCoupon').addEventListener('click', async () => {
    const code = left.querySelector('#couponCode').value;
    const res = await router.state.api.applyCoupon(code);
    if (res.ok && res.coupon) {
      activeCoupon = res.coupon;
      left.querySelector('#couponMsg').textContent = res.message;
      left.querySelector('#couponMsg').style.color = 'rgba(77,255,154,.9)';
      calcTotals({ coupon: activeCoupon, shippingCountry: left.querySelector('#shipCountry').value });
      pushToast({ title: 'Coupon applied', message: res.coupon.code, kind: 'ok' });
    } else {
      activeCoupon = null;
      left.querySelector('#couponMsg').textContent = res.message;
      left.querySelector('#couponMsg').style.color = 'rgba(255,77,77,.9)';
      calcTotals({ coupon: activeCoupon, shippingCountry: left.querySelector('#shipCountry').value });
      pushToast({ title: 'Coupon not valid', message: res.message, kind: 'danger' });
    }
  });

  left.querySelector('#shipCountry').addEventListener('change', () => {
    calcTotals({ coupon: activeCoupon, shippingCountry: left.querySelector('#shipCountry').value });
  });

  left.querySelector('#placeOrder').addEventListener('click', async () => {
    const name = left.querySelector('#shipName').value.trim();
    const email = left.querySelector('#shipEmail').value.trim();
    const address1 = left.querySelector('#shipAddr1').value.trim();
    const city = left.querySelector('#shipCity').value.trim();
    const country = left.querySelector('#shipCountry').value;

    if (!name || !email || !address1 || !city) {
      pushToast({ title: 'Missing details', message: 'Please complete shipping fields.', kind: 'danger' });
      return;
    }

    const payMethod = left.querySelector('input[name="pay"]:checked')?.value || 'Card';

    router.requireAuth(async () => {
      const user = router.state.session.user;
      const order = await router.state.api.placeOrder({
        cart: router.state.cart,
        coupon: activeCoupon,
        shipping: { name, email, address1, city, country, userId: user?.id },
        payment: { method: payMethod }
      });

      // assign userId
      const ordersKey = 'sm_orders_v1';
      const raw = localStorage.getItem(ordersKey);
      const orders = raw ? JSON.parse(raw) : [];
      const idx = orders.findIndex((o) => o.id === order.id);
      if (idx >= 0) {
        orders[idx].userId = user.id;
        localStorage.setItem(ordersKey, JSON.stringify(orders));
      }

      // clear cart
      router.state.cart = { items: [] };
      saveCart(router.state.cart);

      pushToast({ title: 'Order placed', message: `Tracking: ${order.trackingNumber}`, kind: 'ok' });
      router.go('tracking', { orderId: order.id });
    })();
  });

  if (!hasItems) {
    left.innerHTML = `
      <div style="padding:22px;">
        <h3 style="margin:0; font-weight:950;">Nothing to checkout</h3>
        <p style="margin:8px 0 0; color:var(--muted);">Your cart is empty.</p>
        <button class="primaryBtn" style="margin-top:14px;" id="emptyBack">Go to cart</button>
      </div>
    `;
    left.querySelector('#emptyBack').addEventListener('click', () => router.go('cart'));
  }

  grid.appendChild(left);
  grid.appendChild(right);

  page.appendChild(header);
  page.appendChild(grid);

  return page;
}

