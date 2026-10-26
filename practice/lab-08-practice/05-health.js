// Експеримент 5 (§5): /health, коли event loop зайнятий.
// Запуск: node 05-health.js        (~15 с)
//
// Скрипт піднімає node 05-health-server.js окремим процесом і опитує /health
// з таймаутом 1 с, як це робить балансувальник або HEALTHCHECK. Три фази:
//   A: сервер 3 с крутить синхронний цикл у обробнику запиту
//   B: той самий цикл винесено в worker_threads
//   C: kill -STOP на 3 с, потім kill -CONT (процес "замерз", як у нотатках)
// Кожне опитування: "." відповів швидко, "x" не відповів за 1 с.
// Спитай студентів ПЕРЕД запуском: що покаже /health у кожній фазі?
import { spawn } from 'node:child_process';

const child = spawn(process.execPath, ['05-health-server.js'], { env: { ...process.env, PORT: '0' } });
const port = await new Promise((resolve) => {
  child.stdout.on('data', (chunk) => {
    const found = chunk.toString().match(/слухаю порт (\d+)/)?.[1];
    if (found) resolve(found);
  });
});
const base = `http://localhost:${port}`;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function poll(seconds) {
  let line = '';
  let timeouts = 0;
  let maxElu = 0;
  const end = performance.now() + seconds * 1000;
  while (performance.now() < end) {
    try {
      const r = await fetch(`${base}/health`, { signal: AbortSignal.timeout(1000) });
      const { elu } = await r.json();
      maxElu = Math.max(maxElu, elu);
      line += '.';
    } catch {
      timeouts += 1;
      line += 'x';
    }
    await wait(250);
  }
  console.log(`  ${line}`);
  console.log(`  без відповіді за 1 с: ${timeouts}, найбільший elu у відповідях: ${maxElu}`);
}

await poll(1); // розігрів: сервер живий

// Частина A. Очікування: "xx" (кожен x — секунда таймауту), потім ".";
// перша відповідь після циклу каже elu близько 1: loop весь час був зайнятий.
console.log('--- A: /work/sync, цикл на головному потоці');
fetch(`${base}/work/sync`).catch(() => {});
await poll(4.5);

// Частина B. Очікування: самі ".", elu близько 0. Цикл крутиться, але не в event loop сервера.
console.log('--- B: /work/worker, цикл у worker_threads');
fetch(`${base}/work/worker`).catch(() => {});
await poll(4.5);

// Частина C. Очікування: та сама картина, що в A: "xx", потім "."; elu близько 1
// (перевірено на macOS: час заморозки зараховано як зайнятий).
// Головний сигнал однаковий в A і C: /health не відповідає вчасно, хоча процес "живий".
console.log('--- C: kill -STOP на 3 с, потім kill -CONT');
child.kill('SIGSTOP');
setTimeout(() => child.kill('SIGCONT'), 3000);
await poll(4.5);

child.kill('SIGTERM');
