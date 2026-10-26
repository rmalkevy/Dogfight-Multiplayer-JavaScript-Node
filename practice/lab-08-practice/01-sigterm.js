// Експеримент 1 (§1): SIGTERM проти SIGKILL, без Docker.
// Запуск: node 01-sigterm.js
//
// Скрипт сам піднімає node server.js, підключає клієнта до /stream,
// через секунду шле сигнал і міряє, як процес вийшов і що побачив клієнт.
// Те саме руками: node server.js; у другому терміналі curl -N localhost:3008/stream;
// у третьому kill -TERM <pid> (pid сервер друкує при старті).
//
// Спитай студентів ПЕРЕД запуском: що побачить клієнт у кожному випадку? З яким кодом вийде процес?
import { spawn } from 'node:child_process';
import http from 'node:http';

function startServer() {
  const child = spawn(process.execPath, ['server.js'], { env: { ...process.env, PORT: '0' } });
  child.stderr.pipe(process.stderr);
  return new Promise((resolve) => {
    child.stdout.on('data', (chunk) => {
      for (const line of chunk.toString().trim().split('\n')) {
        console.log('  ' + line);
        const port = line.match(/слухаю порт (\d+)/)?.[1];
        if (port) resolve({ child, port });
      }
    });
  });
}

async function demo(signal) {
  const { child, port } = await startServer();
  const exited = new Promise((resolve) => child.on('exit', (code, sig) => resolve({ code, sig })));

  const clientDone = new Promise((resolve) => {
    http.get(`http://localhost:${port}/stream`, (res) => {
      let lines = [];
      res.on('data', (chunk) => (lines = lines.concat(chunk.toString().trim().split('\n'))));
      res.on('end', () => resolve(`end, останній рядок: "${lines.at(-1)}"`));
      res.on('error', (e) => resolve(`обрив: ${e.code ?? e.message}`));
      res.on('aborted', () => resolve(`обрив (aborted), останній рядок: "${lines.at(-1)}"`));
    }).on('error', (e) => resolve(`помилка: ${e.code}`));
  });

  await new Promise((resolve) => setTimeout(resolve, 1200));
  const t0 = performance.now();
  child.kill(signal);
  const { code, sig } = await exited;
  console.log(`  процес вийшов за ${Math.round(performance.now() - t0)} мс: code ${code}, signal ${sig}`);
  console.log(`  клієнт: ${await clientDone}`);
}

// Частина A: SIGTERM. Очікування: сервер друкує "SIGTERM: ... клієнтів: 1",
// виходить за кілька мс з code 0, клієнт отримує "bye: server shutting down" і чистий end.
console.log('--- A: SIGTERM');
await demo('SIGTERM');

// Частина B: SIGKILL. Обробника немає і бути не може.
// Очікування: сервер нічого не друкує, code null, signal SIGKILL; клієнт бачить обрив після "tick".
console.log('--- B: SIGKILL');
await demo('SIGKILL');
