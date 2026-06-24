const KEY = 'sm_session_v1';

export function loadSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { user: null };
    return JSON.parse(raw);
  } catch {
    return { user: null };
  }
}

export function saveSession(session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function requireAuth(fn, { go }) {
  return (...args) => {
    if (!loadSession().user) {
      go('auth', { mode: 'login' });
      return;
    }
    return fn(...args);
  };
}

