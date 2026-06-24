export function createPageAuth(router, { pushToast }) {
  const url = new URL(location.href);
  const mode = url.searchParams.get('mode') || 'login';

  const page = document.createElement('div');
  page.className = 'container';
  page.style.maxWidth = '860px';

  const card = document.createElement('div');
  card.className = 'panel';
  card.style.padding = '18px';
  card.style.borderRadius = '20px';

  const title = mode === 'signup' ? 'Create your account' : 'Welcome back';
  const subtitle = mode === 'signup'
    ? 'Sign up for coupons, order tracking, and faster checkout.'
    : 'Log in to view your orders and track shipments.';

  card.innerHTML = `
    <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; flex-wrap:wrap;">
      <div>
        <h2 style="margin:0; font-weight:950;">${title}</h2>
        <p style="margin:8px 0 0; color:var(--muted);">${subtitle}</p>
      </div>
      <div>
        <button class="ghostBtn" id="switchMode">${mode === 'signup' ? 'Have an account? Login' : 'New here? Sign up'}</button>
      </div>
    </div>

    <div style="margin-top:18px;">
      <form id="authForm">
        <div class="formRow">
          <div style="grid-column: 1 / -1; display:none;" id="nameWrap">
            <label class="label" for="name">Name</label>
            <input id="name" class="input" placeholder="Alex Johnson" />
          </div>
          <div style="grid-column: 1 / -1;">
            <label class="label" for="email">Email</label>
            <input id="email" class="input" type="email" placeholder="alex@email.com" required />
          </div>
          <div style="grid-column: 1 / -1;">
            <label class="label" for="password">Password</label>
            <input id="password" class="input" type="password" placeholder="••••••••" required />
          </div>
        </div>

        <div style="margin-top:14px; display:flex; gap:12px; flex-wrap:wrap;">
          <button class="primaryBtn" style="flex: 1 1 220px;" ${true ? '' : ''} type="submit">${mode === 'signup' ? 'Sign up' : 'Login'}</button>
          <button class="ghostBtn" style="flex: 1 1 220px;" type="button" id="demoLogin">Demo login</button>
        </div>
        <p id="authMsg" style="margin:12px 0 0; color:var(--muted); font-size:13px;"></p>
      </form>
    </div>
  `;

  const nameWrap = card.querySelector('#nameWrap');
  if (mode === 'signup') nameWrap.style.display = 'block';

  card.querySelector('#switchMode').addEventListener('click', () => {
    router.go('auth', { mode: mode === 'signup' ? 'login' : 'signup' });
  });

  card.querySelector('#demoLogin').addEventListener('click', async () => {
    const res = await ensureDemoUser(router);
    if (!res) return;
    pushToast({ title: 'Logged in', message: 'Demo user loaded.', kind: 'ok' });
    router.reload();
    router.go('orders');
  });


  card.querySelector('#authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = card.querySelector('#email').value.trim();
    const password = card.querySelector('#password').value;
    const name = card.querySelector('#name')?.value.trim() || '';

    try {
      if (mode === 'signup') {
        if (!name) throw new Error('Name is required');
        await router.state.api.signUp({ name, email, password });
        pushToast({ title: 'Account created', message: 'Welcome!', kind: 'ok' });
      } else {
        await router.state.api.login({ email, password });
        pushToast({ title: 'Login successful', message: 'Welcome back.', kind: 'ok' });
      }
      router.reload();
      router.go('orders');
    } catch (err) {
      card.querySelector('#authMsg').textContent = err.message || String(err);
      card.querySelector('#authMsg').style.color = 'rgba(255,77,77,.95)';
      pushToast({ title: 'Auth failed', message: err.message || String(err), kind: 'danger' });
    }
  });

  page.appendChild(card);
  return page;
}

async function ensureDemoUser(router) {
  // Check session; if already logged in, do nothing.
  const usersKey = 'sm_users_v1';
  const raw = localStorage.getItem(usersKey);
  const users = raw ? JSON.parse(raw) : [];

  const demoEmail = 'demo@shady.market';
  const demoPassword = 'demo1234';
  let u = users.find((x) => x.email.toLowerCase() === demoEmail.toLowerCase());
  if (!u) {
    u = { id: 'usr_demo_' + Date.now(), name: 'Demo Customer', email: demoEmail, passwordHash: demoPassword };
    users.push(u);
    localStorage.setItem(usersKey, JSON.stringify(users));
  }

  localStorage.setItem('sm_session_v1', JSON.stringify({ user: { id: u.id, name: u.name, email: u.email } }));
  return u;
}

