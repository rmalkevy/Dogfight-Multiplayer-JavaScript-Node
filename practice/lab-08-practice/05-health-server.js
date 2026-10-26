// Сервер для 05-health.js. Окремо: node 05-health-server.js
//   GET /health       -> {"ok":true,"elu":0.03}  elu: event loop utilization з минулого /health (0..1)
//   GET /work/sync    -> 3 с синхронного циклу просто в обробнику (як важкий тік гри)
//   GET /work/worker  -> той самий цикл у worker_threads, головний потік вільний
import http from 'node:http';
import { Worker } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';

const PORT = Number(process.env.PORT ?? 3008);
const BUSY = `const t = Date.now(); while (Date.now() - t < 3000) {}`;
let lastElu = performance.eventLoopUtilization();

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    const elu = performance.eventLoopUtilization(lastElu); // частка часу, коли loop був зайнятий
    lastElu = performance.eventLoopUtilization();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, elu: Number(elu.utilization.toFixed(2)) }));
  } else if (req.url === '/work/sync') {
    const t = Date.now();
    while (Date.now() - t < 3000) {} // той самий BUSY, але на головному потоці
    res.end('sync done\n');
  } else if (req.url === '/work/worker') {
    const worker = new Worker(BUSY, { eval: true });
    worker.on('exit', () => res.end('worker done\n'));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => console.log(`[server] pid ${process.pid}, слухаю порт ${server.address().port}`));
