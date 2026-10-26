// Експеримент 4 (§4): jitter таймера ігрового сервера.
// Запуск: node 04-timer-jitter.js        (~10 с: три частини по 100 тіків по 33 мс)
//
// Спитай студентів ПЕРЕД запуском: чи будуть інтервали рівно 33 мс?
// А де опиниться сотий тік, якщо ідеал 3300 мс?
const STEP = 33;
const TICKS = 100;

function report(times, t0) {
  const dt = times.slice(1).map((t, i) => t - times[i]);
  console.log(`  min ${Math.min(...dt).toFixed(2)}  max ${Math.max(...dt).toFixed(2)} мс`);
  // Гістограма інтервалів по 1 мс
  const buckets = new Map();
  for (const d of dt) {
    const key = Math.max(30, Math.min(37, Math.floor(d)));
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  for (let key = 30; key <= 37; key++) {
    const n = buckets.get(key) ?? 0;
    const label = key === 30 ? '  <31' : key === 37 ? '  37+' : `${key}-${key + 1}`.padStart(5);
    console.log(`  ${label} мс ${String(n).padStart(3)} ${'#'.repeat(n)}`);
  }
  const drift = times.at(-1) - t0 - STEP * TICKS;
  console.log(`  сотий тік: ${Math.round(times.at(-1) - t0)} мс, ідеал ${STEP * TICKS}, дрейф ${drift.toFixed(1)} мс`);
}

// Частина A: код з нотаток, але 100 тіків замість 30 і з гістограмою.
// Очікування: інтервали не рівні 33, здебільшого 33-35 мс, поодинокі 37+.
// Node відраховує наступний тік від моменту, коли спрацював попередній,
// тож запізнення накопичуються: дрейф ~100-150 мс за 100 тіків.
console.log('--- A: setInterval(33)');
await new Promise((resolve) => {
  const times = [];
  const t0 = performance.now();
  const id = setInterval(() => {
    times.push(performance.now());
    if (times.length >= TICKS) {
      clearInterval(id);
      report(times, t0);
      resolve();
    }
  }, STEP);
});

// Частина B: ланцюжок setTimeout(33). Кожне запізнення додається до наступного.
// Очікування: та сама картина, що в A: інтервали 33-35 мс, дрейф ~100-150 мс.
console.log('--- B: ланцюжок setTimeout(33)');
await new Promise((resolve) => {
  const times = [];
  const t0 = performance.now();
  function tick() {
    times.push(performance.now());
    if (times.length >= TICKS) {
      report(times, t0);
      resolve();
    } else {
      setTimeout(tick, STEP);
    }
  }
  setTimeout(tick, STEP);
});

// Частина C: як радять нотатки, "ціль = старт + n * step".
// Кожен тік рахує свою ціль від старту і чекає рівно до неї.
// Очікування: окремі інтервали дрижать навіть сильніше (є й <31 мс: тік наздоганяє),
// але дрейф ~0-3 мс, він не накопичується.
console.log('--- C: ціль = старт + n * step');
await new Promise((resolve) => {
  const times = [];
  const t0 = performance.now();
  let n = 0;
  function tick() {
    times.push(performance.now());
    n += 1;
    if (n >= TICKS) {
      report(times, t0);
      resolve();
    } else {
      setTimeout(tick, Math.max(0, t0 + (n + 1) * STEP - performance.now()));
    }
  }
  setTimeout(tick, STEP);
});
