import { formatMoney } from '../utils/money.js';

export function createPageOrders(router, { pushToast }) {
  const page = document.createElement('div');
  page.className = 'container';

  const user = router.state.session.user;
  const title = document.createElement('div');
  title.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <h2 style="margin:0; font-weight:950;">Your orders</h2>
        <p style="margin:8px 0 0; color:var(--muted);">Track status and view history.</p>
      </div>
      <button class="primaryBtn" id="shopAgain">Shop more</button>
    </div>
  `;
  title.querySelector('#shopAgain').addEventListener('click', () => router.go('home'));

  const list = document.createElement('div');
  list.className = 'grid';
  list.style.marginTop = '18px';

  const left = document.createElement('div');
  left.className = 'col-12';

  left.innerHTML = `
    <div class="panel" style="padding:14px;">
      <h3 style="margin:0; font-weight:950;">Order history</h3>
      <div id="ordersBody" style="margin-top:14px; display:flex; flex-direction:column; gap:12px;"></div>
    </div>
  `;

  list.appendChild(left);

  if (!user) {
    left.innerHTML = `
      <div style="padding:18px;">
        <h3 style="margin:0; font-weight:950;">Login required</h3>
        <p style="margin:8px 0 0; color:var(--muted);">Sign in to see your orders.</p>
        <button class="primaryBtn" style="margin-top:14px;" id="goLogin">Go to login</button>
      </div>
    `;
    left.querySelector('#goLogin').addEventListener('click', () => router.go('auth', { mode: 'login' }));
    page.appendChild(title);
    page.appendChild(list);
    return page;
  }

  router.state.api.getOrdersByUser(user.id).then((orders) => {
    const body = left.querySelector('#ordersBody');
    body.innerHTML = '';

    if (!orders.length) {
      body.innerHTML = `
        <div class="panel" style="padding:14px;">
          <p style="margin:0; font-weight:900;">No orders yet</p>
          <p style="margin:8px 0 0; color:var(--muted); font-size:13px;">Checkout to get a tracking number.</p>
        </div>
      `;
      return;
    }

    orders.forEach((o) => {
      const card = document.createElement('div');
      card.className = 'panel';
      card.style.padding = '14px';
      card.style.borderRadius = '16px';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.gap = '12px';
      card.style.flexWrap = 'wrap';

      const statusTitle = o.timeline?.[Math.max(0, o.statusIndex - 1)]?.title || 'Processing';

      card.innerHTML = `
        <div style="min-width:260px;">
          <div style="font-weight:950;">${o.trackingNumber}</div>
          <div style="margin-top:6px; color:var(--muted); font-size:13px;">${new Date(o.createdAt).toLocaleString()}</div>
          <div style="margin-top:10px;">
            <span class="kbd">${statusTitle}</span>
          </div>
        </div>
        <div style="flex: 1 1 220px;">
          <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:flex-end;">
            <div style="color:var(--muted); font-size:13px;">Total</div>
            <div style="font-weight:950;">${formatMoney(o.totals.total)}</div>
            <button class="primaryBtn" data-open="${o.id}">Track</button>
          </div>
        </div>
      `;

      card.querySelector(`[data-open="${o.id}"]`).addEventListener('click', () => {
        router.go('tracking', { orderId: o.id });
      });

      body.appendChild(card);
    });
  });

  page.appendChild(title);
  page.appendChild(list);

  return page;
}

