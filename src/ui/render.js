import { createTopbar } from './topbar.js';
import { createToastSystem } from './toast.js';
import { createPageHome } from '../pages/home.js';
import { createPageCart } from '../pages/cart.js';
import { createPageCheckout } from '../pages/checkout.js';
import { createPageAuth } from '../pages/auth.js';
import { createPageOrders } from '../pages/orders.js';
import { createPageTracking } from '../pages/tracking.js';
import { createPageProduct } from '../pages/product.js';

export function render(router) {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const { toastWrap, pushToast } = createToastSystem();
  app.appendChild(toastWrap);

  const topbar = createTopbar(router);
  app.appendChild(topbar);

  const page = router.state.route;

  let content;
  switch (page.name) {
    case 'home':
      content = createPageHome(router, { pushToast });
      break;
    case 'cart':
      content = createPageCart(router, { pushToast });
      break;
    case 'checkout':
      content = createPageCheckout(router, { pushToast });
      break;
    case 'auth':
      content = createPageAuth(router, { pushToast });
      break;
    case 'orders':
      content = createPageOrders(router, { pushToast });
      break;
    case 'tracking':
      content = createPageTracking(router, { pushToast });
      break;
    case 'product':
      content = createPageProduct(router, { pushToast });
      break;
    default:
      content = createPageHome(router, { pushToast });
  }

  app.appendChild(content);
}

