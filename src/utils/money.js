export function formatMoney(amount) {
  const n = Number(amount || 0);
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

