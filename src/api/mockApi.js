import { saveCart } from '../cart/cartStore.js';
import { saveSession } from '../auth/session.js';

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const USERS_KEY = 'sm_users_v1';
const ORDERS_KEY = 'sm_orders_v1';

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function makeId(prefix) {
  return prefix + '_' + Math.random().toString(16).slice(2) + '_' + Date.now();
}

export function mockApi({ products }) {
  return {
    async signUp({ name, email, password }) {
      await delay(250);
      const users = loadUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email already registered');
      }
      const user = { id: makeId('usr'), name, email, passwordHash: password }; // demo only
      users.push(user);
      saveUsers(users);
      const session = { user: { id: user.id, name: user.name, email: user.email } };
      saveSession(session);
      return session.user;
    },

    async login({ email, password }) {
      await delay(250);
      const users = loadUsers();
      const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
      if (!u || u.passwordHash !== password) throw new Error('Invalid email or password');
      const session = { user: { id: u.id, name: u.name, email: u.email } };
      saveSession(session);
      return session.user;
    },

    async signOut() {
      await delay(100);
      saveSession({ user: null });
      return true;
    },

    async placeOrder({ cart, coupon, shipping, payment }) {
      await delay(600);
      const orders = loadOrders();
      const orderId = makeId('ord');

      // totals
      const lineItems = cart.items.map((it) => {
        const p = products.find((x) => x.id === it.productId);
        return { productId: it.productId, name: p.name, price: p.price, qty: it.qty, image: p.image };
      });

      const subtotal = lineItems.reduce((s, li) => s + li.price * li.qty, 0);
      const discount = coupon?.type === 'percent'
        ? Math.round(subtotal * coupon.amount)
        : coupon?.type === 'amount'
          ? coupon.amount
          : 0;
      const finalTotal = Math.max(0, subtotal - discount);
      const shippingCost = shipping?.country ? 8 : 0;
      const total = finalTotal + shippingCost;

      const now = Date.now();
      const trackingNumber = 'TRK' + Math.floor(100000 + Math.random() * 900000);

      const order = {
        id: orderId,
        trackingNumber,
        createdAt: now,
        statusIndex: 1,
        timeline: [
          { key: 'placed', title: 'Order placed', at: now - 1000 * 60 * 5 },
          { key: 'packed', title: 'Packed', at: now },
          { key: 'shipped', title: 'Shipped', at: now + 1000 * 60 * 60 * 10 },
          { key: 'delivered', title: 'Delivered', at: now + 1000 * 60 * 60 * 36 }
        ],
        userId: null, // filled by caller
        customer: {
          name: shipping.name,
          email: shipping.email,
          address1: shipping.address1,
          city: shipping.city,
          country: shipping.country
        },
        payment: { method: payment?.method || 'Card' },
        coupon: coupon || null,
        totals: { subtotal, discount, shipping: shippingCost, total },
        items: lineItems
      };

      orders.push(order);
      saveOrders(orders);
      return order;
    },

    async getOrdersByUser(userId) {
      await delay(150);
      const orders = loadOrders();
      return orders
        .filter((o) => (o.userId || null) === (userId || null))
        .sort((a, b) => b.createdAt - a.createdAt);
    },

    async getOrderById(orderId) {
      await delay(150);
      const orders = loadOrders();
      return orders.find((o) => o.id === orderId) || null;
    },

    async listProducts() {
      await delay(50);
      return products;
    },

    async applyCoupon(code) {
      await delay(120);
      const normalized = (code || '').trim().toUpperCase();
      if (!normalized) return { ok: true, coupon: null, message: 'No coupon' };
      // Demo coupons
      if (normalized === 'SHADE10') return { ok: true, coupon: { code: normalized, type: 'percent', amount: 0.10 }, message: '10% off' };
      if (normalized === 'WELCOME15') return { ok: true, coupon: { code: normalized, type: 'amount', amount: 15 }, message: '$15 off' };
      return { ok: false, coupon: null, message: 'Invalid coupon code' };
    }
  };
}

