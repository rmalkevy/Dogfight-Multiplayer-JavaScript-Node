// Експеримент 4 (§4): transfer проти clone у Worker. Node-версія на worker_threads.
// Запуск: node 04-transfer.js
// Код з нотаток (браузерний Worker) без змін — у browser.html.
//
// Спитай студентів ПЕРЕД запуском: скільки байтів лишиться в буфері після кожного способу?
// Час — це шлях туди й назад: worker відсилає отримане назад (echo).
import { Worker } from 'node:worker_threads';

const MB50 = 50 * 1024 * 1024;

async function startEcho(transferBack) {
  const w = new Worker(
    `const { parentPort } = require('node:worker_threads');
     const back = ${transferBack};
     parentPort.on('message', (data) =>
       back && data instanceof ArrayBuffer ? parentPort.postMessage(data, [data]) : parentPort.postMessage(data));`,
    { eval: true },
  );
  // Розігрів: перше повідомлення чекає, поки worker запуститься. Не хочемо міряти старт.
  await new Promise((resolve) => {
    w.once('message', resolve);
    w.postMessage('warm-up');
  });
  return w;
}

function once(w, buf, transfer) {
  return new Promise((res) => {
    const t = performance.now();
    w.once('message', () => res({ left: buf.byteLength, ms: Number((performance.now() - t).toFixed(1)) }));
    transfer ? w.postMessage(buf, [buf]) : w.postMessage(buf);
  });
}

// Частина A: echo як у нотатках, назад завжди clone.
// Очікування: clone — left 52428800 (буфер на місці); transfer — left 0 (буфер "переїхав").
// Transfer швидший лише ~удвічі: туди без копії, але назад echo все одно копіює 50 MB.
console.log('--- A: echo з нотаток (назад clone)');
let w = await startEcho(false);
console.log('clone   ', await once(w, new ArrayBuffer(MB50), false));
console.log('transfer', await once(w, new ArrayBuffer(MB50), true));
await w.terminate();

// Частина B: worker теж віддає буфер через transfer.
// Очікування: clone кілька мс (одна копія, назад transfer), transfer ~1 мс або менше, у рази швидше.
// Мілісекунди плавають від запуску до запуску; left 52428800 і left 0 — завжди.
console.log('--- B: transfer в обидва боки');
w = await startEcho(true);
console.log('clone   ', await once(w, new ArrayBuffer(MB50), false));
console.log('transfer', await once(w, new ArrayBuffer(MB50), true));
await w.terminate();
