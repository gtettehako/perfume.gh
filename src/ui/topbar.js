import { cartCount } from '../cart/cartStore.js';
import { formatMoney } from '../utils/money.js';

export function createTopbar(router) {
  const el = document.createElement('div');
  el.className = 'topbar';

  const count = cartCount(router.state.cart);
  const user = router.state.session.user;

  const brand = document.createElement('div');
  brand.className = 'brand';
  brand.innerHTML = `<div class="logo"></div><div>Shady Market <span class="muted" style="font-weight:700;">Perfume</span></div>`;

  const nav = document.createElement('div');
  nav.className = 'nav';

  nav.innerHTML = `
    <a href="#/">Home</a>
    <a href="#/cart">Cart (${count})</a>
    <a href="#/orders">Orders</a>
    <a href="#/auth" id="authLink">${user ? 'Account' : 'Login'}</a>
    <button id="signOutBtn" style="display:${user ? 'block' : 'none'};">Sign out</button>
  `;

  nav.querySelector('#signOutBtn')?.addEventListener('click', async () => {
    await router.state.api.signOut();
    router.state.session.user = null;
    router.reload();
    location.hash = '#/';
  });

  el.appendChild(brand);
  el.appendChild(nav);

  // Keep link correct based on login state
  const authLink = nav.querySelector('#authLink');
  if (authLink) {
    if (user) {
      authLink.href = '#/orders';
    } else {
      authLink.href = '#/auth?mode=login';
    }
  }

  // Inject styles and core CSS link once
  if (!document.getElementById('sm-styles')) {
    const link = document.createElement('link');
    link.id = 'sm-styles';
    link.rel = 'stylesheet';
    link.href = './src/styles.css';
    document.head.appendChild(link);
  }

  return el;
}

