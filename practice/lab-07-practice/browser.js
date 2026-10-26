// Браузерна частина Lab 07 (§4). Підключається з browser.html.
// Node-версія з тим самим echo і з transfer в обидва боки: node 04-transfer.js
const out = document.getElementById('out');

function log(...args) {
  console.log(...args);
  out.textContent += args.join(' ') + '\n';
}

// Код з нотаток
const w = new Worker(URL.createObjectURL(new Blob(['onmessage=e=>postMessage(e.data)'])));
function once(buf, transfer) {
  return new Promise((res) => {
    w.onmessage = () => res({ left: buf.byteLength, ms: performance.now() - t });
    const t = performance.now();
    transfer ? w.postMessage(buf, [buf]) : w.postMessage(buf);
  });
}

// Очікування: clone — left 52428800, transfer — left 0.
// Час transfer менший, але не в десятки разів: назад echo все одно копіює 50 MB.
document.getElementById('run').onclick = async (e) => {
  e.target.disabled = true; // onmessage один на всіх: два прогони разом переплутають відповіді
  log('\n--- clone, потім transfer');
  await once(new ArrayBuffer(8), false); // розігрів, щоб не міряти старт worker
  const a = new ArrayBuffer(50 * 1024 * 1024);
  const r1 = await once(a, false);
  log(`clone:    left ${r1.left}, ${r1.ms.toFixed(1)} мс`);
  const b = new ArrayBuffer(50 * 1024 * 1024);
  const r2 = await once(b, true);
  log(`transfer: left ${r2.left}, ${r2.ms.toFixed(1)} мс`);
  e.target.disabled = false;
};

document.getElementById('clear').onclick = () => { out.textContent = ''; };
