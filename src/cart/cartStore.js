const KEY = 'sm_cart_v1';

export function loadCart() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { items: [] };
    return JSON.parse(raw);
  } catch {
    return { items: [] };
  }
}

export function saveCart(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
}

export function cartCount(cart) {
  return (cart.items || []).reduce((sum, it) => sum + (it.qty || 0), 0);
}

export function setQty(cart, productId, qty) {
  const next = { ...cart, items: [...(cart.items || [])] };
  const idx = next.items.findIndex((x) => x.productId === productId);
  if (qty <= 0) {
    if (idx >= 0) next.items.splice(idx, 1);
  } else {
    if (idx >= 0) next.items[idx] = { ...next.items[idx], qty };
    else next.items.push({ productId, qty });
  }
  return next;
}

