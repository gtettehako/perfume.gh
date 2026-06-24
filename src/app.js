import { render } from './ui/render.js';
import { createRouter } from './router/router.js';
import { loadSession, requireAuth } from './auth/session.js';
import { loadProducts } from './data/products.js';
import { loadCart } from './cart/cartStore.js';
import { mockApi } from './api/mockApi.js';

export function initApp() {
  const products = loadProducts();
  const cart = loadCart();
  const session = loadSession();

  const router = createRouter({
    products,
    cart,
    session,
    api: mockApi({ products }),
    requireAuth
  });

  render(router);

  window.addEventListener('popstate', () => {
    render(router);
  });
}

