// Сервер для досліду 1 (§1) і для Dockerfile. Окремо: node server.js
//   GET /stream  -> довга відповідь, "tick" щосекунди (як відкритий сокет гравця)
//   GET /health  -> {"ok":true}
//
// На SIGTERM (і Ctrl+C = SIGINT): перестати приймати нових, попрощатися з клієнтами,
// дочекатися закриття і вийти з кодом 0. Не встиг за 2 с — вийти з кодом 1 самому,
// не чекаючи, поки оркестратор пришле SIGKILL.
import http from 'node:http';

const PORT = Number(process.env.PORT ?? 3008);
const streams = new Set();

const server = http.createServer((req, res) => {
  if (req.url === '/stream') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.write('hello\n');
    const timer = setInterval(() => res.write('tick\n'), 1000);
    const client = { res, timer };
    streams.add(client);
    res.on('close', () => {
      clearInterval(timer);
      streams.delete(client);
    });
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

function shutdown(signal) {
  const t0 = performance.now();
  console.log(`[server] ${signal}: не приймаю нових, закриваю клієнтів: ${streams.size}`);
  server.close(() => {
    console.log(`[server] закрито за ${Math.round(performance.now() - t0)} мс, exit 0`);
    process.exit(0);
  });
  for (const { res, timer } of streams) {
    clearInterval(timer);
    res.end('bye: server shutting down\n');
  }
  server.closeIdleConnections();
  setTimeout(() => {
    console.log('[server] не встиг за 2 с, exit 1');
    process.exit(1);
  }, 2000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

server.listen(PORT, () => {
  console.log(`[server] pid ${process.pid}, слухаю порт ${server.address().port}`);
});
