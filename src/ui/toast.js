export function createToastSystem() {
  const wrap = document.createElement('div');
  wrap.className = 'toastWrap';

  const pushToast = ({ title = 'Update', message = '', kind = 'default' } = {}) => {
    const t = document.createElement('div');
    t.className = 'toast';
    if (kind === 'ok') t.style.borderColor = 'rgba(77,255,154,.35)';
    if (kind === 'danger') t.style.borderColor = 'rgba(255,77,77,.35)';

    t.innerHTML = `
      <p class="toastTitle">${escapeHtml(title)}</p>
      <p class="toastMsg">${escapeHtml(message)}</p>
    `;

    wrap.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity .25s ease';
      setTimeout(() => t.remove(), 250);
    }, 3200);
  };

  return { toastWrap: wrap, pushToast };
}

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}

