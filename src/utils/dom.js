export function el(tag, className, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const c of children) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return node;
}

