import { formatMoney } from '../utils/money.js';

export function createRouter({ products, cart, session, api, requireAuth }) {
  const routeFromLocation = () => {
    const hash = location.hash || '#/';
    const clean = hash.replace(/^#/, '');
    const parts = clean.split('/').filter(Boolean);

    // Routes:
    // / => home
    // /product/:id
    // /cart
    // /checkout
    // /auth?mode=login|signup
    // /orders
    // /tracking/:orderId

    if (parts.length === 0) return { name: 'home', params: {} };
    const [a, b] = parts;
    if (a === 'product' && b) return { name: 'product', params: { id: b } };
    if (a === 'cart') return { name: 'cart', params: {} };
    if (a === 'checkout') return { name: 'checkout', params: {} };
    if (a === 'orders') return { name: 'orders', params: {} };
    if (a === 'tracking' && b) return { name: 'tracking', params: { orderId: b } };
    if (a === 'auth') {
      const url = new URL(location.href);
      const mode = url.searchParams.get('mode') || 'login';
      return { name: 'auth', params: { mode } };
    }
    return { name: 'home', params: {} };
  };

  const state = {
    products,
    cart,
    session,
    api,
    route: routeFromLocation(),
    formatMoney
  };

  const navigate = (to, query = {}) => {
    // to is one of: '/', '/cart', '/checkout', '/orders', '/auth'
    // product: '/product/:id'
    let target = '#';
    if (to === '/') target = '#/';
    else target = '#' + (to.startsWith('/') ? to : '/' + to);

    if (to === '/auth') {
      const url = new URL(location.href);
      for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
      location.href = url.origin + url.pathname + '#/auth';
      return;
    }

    location.hash = target.replace(/^#/, '');
  };

  const setRoute = (r) => {
    state.route = r;
  };

  const go = (name, params = {}) => {
    switch (name) {
      case 'home': navigate('/'); break;
      case 'cart': navigate('/cart'); break;
      case 'checkout': navigate('/checkout'); break;
      case 'orders': navigate('/orders'); break;
      case 'auth': {
        const mode = params.mode || 'login';
        // preserve query via search param
        const url = new URL(location.href);
        url.searchParams.set('mode', mode);
        location.href = url.origin + url.pathname + '#/auth';
        break;
      }
      case 'tracking': navigate('/tracking/' + params.orderId); break;
      case 'product': navigate('/product/' + params.id); break;
      default: navigate('/');
    }
  };

  const reload = () => {
    state.route = routeFromLocation();
  };

  // router API exposed
  return {
    state,
    navigate,
    go,
    reload,
    requireAuth: (fn) => requireAuth(fn, { go })
  };
}

