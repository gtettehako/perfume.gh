import { formatMoney } from '../utils/money.js';

export function createPageTracking(router, { pushToast }) {
  const page = document.createElement('div');
  page.className = 'container';

  const orderId = router.state.route.params.orderId;

  const title = document.createElement('div');
  title.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <h2 style="margin:0; font-weight:950;">Order tracking</h2>
        <p style="margin:8px 0 0; color:var(--muted);">Live status simulation.</p>
      </div>
      <button class="ghostBtn" id="backOrders">Back to orders</button>
    </div>
  `;
  title.querySelector('#backOrders').addEventListener('click', () => router.go('orders'));

  const wrap = document.createElement('div');
  wrap.className = 'grid';
  wrap.style.marginTop = '18px';

  const left = document.createElement('div');
  left.className = 'col-7';
  left.innerHTML = `
    <div class="panel" style="padding:14px; border-radius: 20px;">
      <h3 style="margin:0; font-weight:950;">Status timeline</h3>
      <div style="margin-top:14px;" id="timeline" class="timeline"></div>
    </div>
  `;

  const right = document.createElement('div');
  right.className = 'col-5';
  right.innerHTML = `
    <div class="panel" style="padding:14px; border-radius: 20px; height: fit-content;">
      <h3 style="margin:0; font-weight:950;">Details</h3>
      <div id="detailBody" style="margin-top:14px; display:flex; flex-direction:column; gap:12px;"></div>
    </div>
  `;

  wrap.appendChild(left);
  wrap.appendChild(right);

  async function load() {
    // If orderId === 'latest', pick latest order for user.
    if (orderId === 'latest') {
      if (!router.state.session.user) {
        pushToast({ title: 'Login required', message: 'Sign in to track orders.', kind: 'danger' });
        router.go('auth', { mode: 'login' });
        return;
      }
      const orders = await router.state.api.getOrdersByUser(router.state.session.user.id);
      const latest = orders[0];
      if (!latest) {
        right.querySelector('#detailBody').innerHTML = `<p style="color:var(--muted);">No orders yet.</p>`;
        return;
      }
      renderOrder(latest);
      return;
    }

    const o = await router.state.api.getOrderById(orderId);
    if (!o) {
      right.querySelector('#detailBody').innerHTML = `<p style="color:var(--muted);">Order not found.</p>`;
      return;
    }

    renderOrder(o);
  }

  function renderOrder(o) {
    const timelineEl = left.querySelector('#timeline');
    const activeIndex = calcActiveStatusIndex(o);

    timelineEl.innerHTML = '';
    (o.timeline || []).forEach((t, idx) => {
      const item = document.createElement('div');
      item.className = 'tItem ' + (idx === activeIndex ? 'active' : '') + (idx < activeIndex ? 'active' : '');
      item.innerHTML = `
        <div class="tDot"></div>
        <div class="tText">
          <p class="tTitle">${t.title}</p>
          <p class="tSub">${new Date(t.at).toLocaleString()}</p>
        </div>
      `;
      timelineEl.appendChild(item);
    });

    // Details
    const body = right.querySelector('#detailBody');
    body.innerHTML = `
      <div>
        <div style="color:var(--muted); font-size:13px;">Tracking number</div>
        <div style="font-weight:950; margin-top:6px;">${o.trackingNumber}</div>
      </div>
      <div>
        <div style="color:var(--muted); font-size:13px;">Status</div>
        <div style="font-weight:950; margin-top:6px;">${o.timeline?.[activeIndex]?.title || 'Processing'}</div>
      </div>
      <div>
        <div style="color:var(--muted); font-size:13px;">Total</div>
        <div style="font-weight:950; margin-top:6px;">${formatMoney(o.totals.total)}</div>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,.10); padding-top:12px;">
        <div style="font-weight:900;">Ship to</div>
        <div style="color:var(--muted); font-size:13px; margin-top:6px;">
          ${o.customer.name}<br/>
          ${o.customer.address1}<br/>
          ${o.customer.city}, ${o.customer.country}
        </div>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,.10); padding-top:12px;">
        <div style="font-weight:900;">Items</div>
        <div style="display:flex; flex-direction:column; gap:12px; margin-top:12px;">
          ${(o.items || []).map((it) => `
            <div style="display:flex; gap:12px; align-items:center;">
              <div class="imgWrap" style="width:56px; height:56px; border-radius:16px;">
                <img class="prodImg" style="height:56px;" alt="${it.name}" src="${it.image}" />
              </div>
              <div style="min-width:0;">
                <div style="font-weight:900;">${it.name}</div>
                <div style="color:var(--muted); font-size:13px;">Qty ${it.qty} • ${formatMoney(it.price)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Auto-refresh status simulation every few seconds
    const interval = setInterval(() => {
      const newActiveIndex = calcActiveStatusIndex(o);
      if (newActiveIndex !== activeIndex) {
        clearInterval(interval);
        // reload order to get updated state index? We'll just rerender.
        renderOrder({ ...o, statusIndex: newActiveIndex + 1 });
      }
    }, 3000);
  }

  function calcActiveStatusIndex(o) {
    // Use time offsets in timeline; approximate progress.
    const now = Date.now();
    const tl = o.timeline || [];
    let idx = 0;
    for (let i = 0; i < tl.length; i++) {
      if (now >= tl[i].at) idx = i;
    }
    return idx;
  }

  page.appendChild(title);
  page.appendChild(wrap);

  load();
  return page;
}

