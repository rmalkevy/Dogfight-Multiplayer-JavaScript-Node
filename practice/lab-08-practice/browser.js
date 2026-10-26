// Браузерна частина Lab 08 (§4). Сторінку віддає node 03-origin.js --serve.
const out = document.getElementById('out');
document.getElementById('origin').textContent = location.origin;

function log(...args) {
  console.log(...args);
  out.textContent += args.join(' ') + '\n';
}

// Очікування: з http://localhost:3008 — open, повідомлення "привіт, http://localhost:3008", close 1000.
// З http://localhost:3009 — error і close 1006: сервер відповів 403, а браузер причини не показує.
document.getElementById('connect').onclick = () => {
  log(`\n--- ${location.origin} -> ws://localhost:3008/ws`);
  const ws = new WebSocket('ws://localhost:3008/ws');
  ws.onopen = () => log('open');
  ws.onmessage = (e) => log('повідомлення:', e.data);
  ws.onerror = () => log('error');
  ws.onclose = (e) => log('close', e.code);
};

document.getElementById('clear').onclick = () => { out.textContent = ''; };
